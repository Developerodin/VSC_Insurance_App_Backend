import httpStatus from 'http-status';
import { Lead, User, Notification, Commission, Subcategory, Wallet, WalletTransaction } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';
import walletService from '../services/wallet.service.js';

export const createLead = catchAsync(async (req, res) => {
  const leadData = {
    ...req.body,
    agent: req.user.id,
  };
  
  // Initialize statusHistory with the initial status
  if (leadData.status) {
    leadData.statusHistory = [{
      status: leadData.status,
      remark: leadData.remark || '',
      updatedBy: req.user.id,
      updatedAt: new Date()
    }];
  }
  
  const lead = await Lead.create(leadData);

  // Update wallet statistics for lead creation
  await walletService.updateWalletOnLeadCreation(req.user.id);

  // Create notification with basic lead details
  const leadDetails = [];
  if (req.body.source) leadDetails.push(`Source: ${req.body.source}`);
  if (req.body.status) leadDetails.push(`Status: ${req.body.status}`);
  
  // Get category name if available
  let categoryName = '';
  if (req.body.category) {
    try {
      const category = await Category.findById(req.body.category);
      if (category) categoryName = category.name;
    } catch (error) {
      console.log('Could not fetch category name for notification');
    }
  }
  if (categoryName) leadDetails.push(`Category: ${categoryName}`);
  
  // Get subcategory name if available
  let subcategoryName = '';
  if (req.body.subcategory) {
    try {
      const subcategory = await Subcategory.findById(req.body.subcategory);
      if (subcategory) subcategoryName = subcategory.name;
    } catch (error) {
      console.log('Could not fetch subcategory name for notification');
    }
  }
  if (subcategoryName) leadDetails.push(`Subcategory: ${subcategoryName}`);
  
  const message = leadDetails.length > 0 
    ? `New lead created with details: ${leadDetails.join(', ')}`
    : 'A new lead has been created';

  await Notification.create({
    recipient: req.user.id,
    type: 'lead_created',
    title: 'New Lead Created',
    message,
    channels: ['in_app', 'email'],
    data: {
      leadId: lead._id,
      source: req.body.source,
      status: req.body.status,
      category: req.body.category,
      subcategory: req.body.subcategory,
      categoryName,
      subcategoryName,
    },
  });

  res.status(httpStatus.CREATED).send(lead);
});

export const getLeads = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    populate: 'agent,category,subcategory,products.product,statusHistory.updatedBy',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1
  };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.agent) filter.agent = req.query.agent;
  if (req.query.subcategory) filter.subcategory = req.query.subcategory;

  const leads = await Lead.paginate(filter, options);
  res.send(leads);
});

export const getLead = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product')
    .populate('statusHistory.updatedBy', 'name email');
    
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  res.send(lead);
});

export const updateLead = catchAsync(async (req, res) => {
  let lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('subcategory');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  const oldStatus = lead.status;
  Object.assign(lead, req.body);
  
  // If status is being updated, add to statusHistory
  if (req.body.status && req.body.status !== oldStatus) {
    lead.statusHistory.push({
      status: req.body.status,
      remark: req.body.remark || '',
      updatedBy: req.user.id,
      updatedAt: new Date()
    });
  }
  
  await lead.save();

  // Create notification if status changed
  if (oldStatus !== lead.status) {
    await Notification.create({
      recipient: lead.agent._id,
      type: 'lead_status_change',
      title: 'Lead Status Updated',
      message: `Lead status has been updated to: ${lead.status}`,
      channels: ['in_app', 'email'],
      data: {
        leadId: lead._id,
        oldStatus,
        newStatus: lead.status,
      },
    });

    // If status changed to closed, create commission with 0 values (admin will set amounts later)
    if (lead.status === 'closed' && lead.subcategory) {
      console.log('🔍 Commission check: Lead status is closed, creating commission with 0 values');
      console.log('🔍 Lead ID:', lead._id);
      console.log('🔍 Agent ID:', lead.agent._id);
      
      // Create commission with 0 values - admin will set baseAmount and tdsPercentage later
      const commission = await Commission.create({
        agent: lead.agent._id,
        product: lead.products[0].product,
        lead: lead._id,
        amount: 0,
        baseAmount: 0,
        tdsPercentage: 0,
        status: 'pending',
      });
      
      console.log('✅ Commission created with 0 values, admin will set amounts later:', commission._id);

        // Create notification for commission creation
        await Notification.create({
          recipient: lead.agent._id,
          type: 'commission_earned',
          title: 'Commission Created',
          message: `A commission has been created for closing the lead. Admin will set the amount and approve it for your wallet.`,
          channels: ['in_app', 'email'],
          data: {
            commissionId: commission._id,
            amount: commission.amount,
            status: 'pending',
          },
        });
        
        console.log('✅ Commission workflow completed successfully');

    } else {
      console.log('❌ Commission not created because:');
      if (lead.status !== 'closed') {
        console.log('   - Lead status is not "closed" (current:', lead.status, ')');
      }
      if (!lead.subcategory) {
        console.log('   - Lead has no subcategory assigned');
      }
    }
  }

  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product');

  res.send(lead);
});

export const deleteLead = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  await lead.deleteOne();
  res.status(httpStatus.NO_CONTENT).send();
});

export const addFollowUp = catchAsync(async (req, res) => {
  let lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }


  lead.followUps.push({
    ...req.body,
    agent: req.user.id,
  });
  await lead.save();

  // Create notification for follow-up
  await Notification.create({
    recipient: lead.agent._id,
    type: 'follow_up_reminder',
    title: 'Follow-up Added',
    message: `A new follow-up has been added for lead: ${lead.customerName}`,
    channels: ['in_app', 'email'],
    data: {
      leadId: lead._id,
      followUpDate: req.body.date,
    },
  });

  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product');

  res.send(lead);
});

export const addNote = catchAsync(async (req, res) => {
  let lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }


  lead.notes.push({
    content: req.body.content,
    createdBy: req.user.id,
  });
  await lead.save();
  
  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product');
    
  res.send(lead);
});

export const getLeadStats = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    filter.agent = req.user.id;
  }

  const stats = await Lead.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.send(stats);
});

export const assignLead = catchAsync(async (req, res) => {
  const { agentId } = req.body;
  let lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  const agent = await User.findById(agentId);
  if (!agent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agent not found');
  }

  lead.agent = agentId;
  await lead.save();

  // Create notification for the new agent
  await Notification.create({
    recipient: agentId,
    type: 'lead_assigned',
    title: 'Lead Assigned',
    message: `A lead has been assigned to you`,
    channels: ['in_app', 'email'],
    data: {
      leadId: lead._id,
    },
  });

  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product');

  res.send(lead);
});

export const getLeadsByUserId = catchAsync(async (req, res) => {
  const filter = { agent: req.params.userId };
  const options = {
    populate: 'agent,category,subcategory,products.product'
  };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.category) filter.category = req.query.category;

  const leads = await Lead.paginate(filter, options);
  res.send(leads);
});

export const updateLeadFields = catchAsync(async (req, res) => {
  let lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }


  // Update fieldsData with new values
  if (req.body.fieldsData) {
    // If fieldsData doesn't exist, create it
    if (!lead.fieldsData) {
      lead.fieldsData = new Map();
    }
    
    // Loop through and update each field
    Object.entries(req.body.fieldsData).forEach(([key, value]) => {
      lead.fieldsData.set(key, value);
    });
  }
  
  await lead.save();
  
  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product');
    
  res.send(lead);
});

export const updateLeadProducts = catchAsync(async (req, res) => {
  let lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }


  if (req.body.products) {
    lead.products = req.body.products;
  }
  
  await lead.save();
  
  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product');
    
  res.send(lead);
});

/**
 * Get lead timeline information
 * @param {string} leadId - The ID of the lead
 * @returns {Object} Timeline data including current status, phases, and remaining steps
 */
export const getLeadTimeline = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product')
    .populate('statusHistory.updatedBy', 'name email');
    
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  
  // Define all possible statuses in order
  const allStatuses = [
    'new', 
    'contacted', 
    'interested', 
    'followUp', 
    'qualified', 
    'proposal', 
    'negotiation', 
    'closed', 
    'lost'
  ];
  
  // Get current status index
  const currentStatusIndex = allStatuses.indexOf(lead.status);
  
  // Calculate estimated completion percentage
  let completionPercentage = 0;
  if (lead.status === 'closed') {
    completionPercentage = 100;
  } else if (lead.status === 'lost') {
    completionPercentage = 100; // Also consider lost as "complete" but with different outcome
  } else if (currentStatusIndex >= 0) {
    // Calculate percentage based on current status position
    // Exclude 'lost' from calculation (hence the -1)
    completionPercentage = Math.round((currentStatusIndex / (allStatuses.length - 2)) * 100);
  }
  
  // Create a more detailed phases array with time estimates and descriptions
  const phasesDetails = [
    { 
      name: 'new', 
      description: 'Lead has been created but no contact made yet',
      estimatedDuration: '1-2 days',
    },
    { 
      name: 'contacted', 
      description: 'Initial contact has been made with the lead',
      estimatedDuration: '2-3 days',
    },
    { 
      name: 'interested', 
      description: 'Lead has expressed interest in our products/services',
      estimatedDuration: '3-5 days',
    },
    { 
      name: 'followUp', 
      description: 'Follow-up communications are in progress',
      estimatedDuration: '5-7 days',
    },
    { 
      name: 'qualified', 
      description: 'Lead has been qualified as a potential customer',
      estimatedDuration: '3-5 days',
    },
    { 
      name: 'proposal', 
      description: 'Proposal has been presented to the lead',
      estimatedDuration: '7-14 days',
    },
    { 
      name: 'negotiation', 
      description: 'Terms are being negotiated with the lead',
      estimatedDuration: '7-14 days',
    },
    { 
      name: 'closed', 
      description: 'Deal successfully closed',
      estimatedDuration: 'Complete',
    },
    { 
      name: 'lost', 
      description: 'Deal was lost or lead is no longer interested',
      estimatedDuration: 'Complete',
    }
  ];
  
  // Build timeline data
  const timeline = {
    leadId: lead._id,
    currentStatus: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    agent: lead.agent,
    category: lead.category,
    subcategory: lead.subcategory,
    source: lead.source,
    lastContact: lead.lastContact,
    nextFollowUp: lead.nextFollowUp,
    completionPercentage,
    
    // Status history with remarks and timestamps
    statusHistory: lead.statusHistory || [],
    
    // Create phases with completion status and details
    phases: allStatuses.map((status, index) => {
      const phaseDetails = phasesDetails.find(phase => phase.name === status);
      // Find actual status history entry for this status
      const statusHistoryEntry = lead.statusHistory?.find(entry => entry.status === status);
      
      return {
        name: status,
        description: phaseDetails.description,
        estimatedDuration: phaseDetails.estimatedDuration,
        completed: index <= currentStatusIndex && lead.status !== 'lost',
        active: status === lead.status,
        skipped: lead.status === 'lost' && index > currentStatusIndex,
        // Use actual date from status history if available, otherwise estimate
        actualDate: statusHistoryEntry?.updatedAt || null,
        remark: statusHistoryEntry?.remark || null,
        updatedBy: statusHistoryEntry?.updatedBy || null,
        // Indicate when this phase was likely active (estimation)
        estimatedActiveDate: index <= currentStatusIndex ? 
          new Date(new Date(lead.createdAt).getTime() + (index * 3 * 24 * 60 * 60 * 1000)) : null // Roughly 3 days per phase
      };
    }),
    
    // Remaining steps (statuses after current one, if not closed or lost)
    remainingSteps: (lead.status !== 'closed' && lead.status !== 'lost') 
      ? allStatuses.slice(currentStatusIndex + 1).map(status => {
          const phaseDetails = phasesDetails.find(phase => phase.name === status);
          return {
            name: status,
            description: phaseDetails.description,
            estimatedDuration: phaseDetails.estimatedDuration
          };
        }) 
      : [],
      
    // Timeline is complete when status is closed or lost
    isComplete: lead.status === 'closed' || lead.status === 'lost',
    
    // Products information with status
    products: lead.products,
    
    // Key events in timeline
    keyEvents: [
      {
        name: 'Lead Created',
        date: lead.createdAt,
        description: `Lead was created with source: ${lead.source}`
      },
      {
        name: 'Last Updated',
        date: lead.updatedAt,
        description: 'Lead information was last updated'
      }
    ]
  };
  
  // Add status change events from statusHistory
  if (lead.statusHistory && lead.statusHistory.length > 0) {
    lead.statusHistory.forEach((statusEntry, index) => {
      timeline.keyEvents.push({
        name: `Status Changed to ${statusEntry.status.charAt(0).toUpperCase() + statusEntry.status.slice(1)}`,
        date: statusEntry.updatedAt,
        description: statusEntry.remark || `Status updated to ${statusEntry.status}`,
        type: 'status_change',
        status: statusEntry.status,
        remark: statusEntry.remark,
        updatedBy: statusEntry.updatedBy
      });
    });
  }
  
  // Add last contact event if available
  if (lead.lastContact) {
    timeline.keyEvents.push({
      name: 'Last Contact',
      date: lead.lastContact,
      description: 'Last communication with the lead',
      type: 'contact'
    });
  }
  
  // Add next follow-up event if available
  if (lead.nextFollowUp) {
    timeline.keyEvents.push({
      name: 'Next Follow-up',
      date: lead.nextFollowUp,
      description: 'Scheduled follow-up with the lead',
      type: 'follow_up'
    });
  }
  
  // Sort key events by date
  timeline.keyEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  res.send(timeline);
});

export const addDocument = catchAsync(async (req, res) => {
  let lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  const { url, key, name } = req.body;
  
  lead.documents.push({
    url,
    key,
    name,
    uploadedAt: new Date()
  });
  
  await lead.save();
  
  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product');
    
  res.send(lead);
});

export const removeDocument = catchAsync(async (req, res) => {
  let lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  const { documentKey } = req.params;
  
  // Find and remove the document
  lead.documents = lead.documents.filter(doc => doc.key !== documentKey);
  
  await lead.save();
  
  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product');
    
  res.send(lead);
});

export const getDocuments = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  res.send(lead.documents);
});

export const updateLeadStatus = catchAsync(async (req, res) => {
  const { status, remark } = req.body;
  
  let lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('subcategory');
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  const oldStatus = lead.status;
  
  // Update the lead status
  lead.status = status;
  
  // Add to statusHistory
  lead.statusHistory.push({
    status: status,
    remark: remark || '',
    updatedBy: req.user.id,
    updatedAt: new Date()
  });
  
  await lead.save();

  // Create notification if status changed
  if (oldStatus !== lead.status) {
    await Notification.create({
      recipient: lead.agent._id,
      type: 'lead_status_change',
      title: 'Lead Status Updated',
      message: `Lead status has been updated to: ${lead.status}${remark ? ` with remark: ${remark}` : ''}`,
      channels: ['in_app', 'email'],
      data: {
        leadId: lead._id,
        oldStatus,
        newStatus: lead.status,
        remark: remark || '',
      },
    });

    // If status changed to closed, create commission with 0 values (admin will set amounts later)
    if (lead.status === 'closed' && lead.subcategory) {
      console.log('🔍 Commission check: Lead status is closed, creating commission with 0 values');
      console.log('🔍 Lead ID:', lead._id);
      console.log('🔍 Agent ID:', lead.agent._id);
      
      // Create commission with 0 values - admin will set baseAmount and tdsPercentage later
      const commission = await Commission.create({
        agent: lead.agent._id,
        product: lead.products[0].product,
        lead: lead._id,
        amount: 0,
        baseAmount: 0,
        tdsPercentage: 0,
        status: 'pending',
      });
      
      console.log('✅ Commission created with 0 values, admin will set amounts later:', commission._id);

        // Create notification for commission creation
        await Notification.create({
          recipient: lead.agent._id,
          type: 'commission_earned',
          title: 'Commission Created',
          message: `A commission has been created for closing the lead. Admin will set the amount and approve it for your wallet.`,
          channels: ['in_app', 'email'],
          data: {
            commissionId: commission._id,
            amount: commission.amount,
            status: 'pending',
          },
        });
        
        console.log('✅ Commission workflow completed successfully');

    } else {
      console.log('❌ Commission not created because:');
      if (lead.status !== 'closed') {
        console.log('   - Lead status is not "closed" (current:', lead.status, ')');
      }
      if (!lead.subcategory) {
        console.log('   - Lead has no subcategory assigned');
      }
    }
  }

  // Fetch and populate the updated lead
  lead = await Lead.findById(req.params.leadId)
    .populate('agent', 'name email')
    .populate('category')
    .populate('subcategory')
    .populate('products.product')
    .populate('statusHistory.updatedBy', 'name email');

  res.send(lead);
});

export const getMonthlyLeadStats = catchAsync(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const year = parseInt(req.query.year) || currentYear;
  
  // Build filter based on user role
  const filter = {
    createdAt: {
      $gte: new Date(year, 0, 1), // January 1st of the year
      $lt: new Date(year + 1, 0, 1) // January 1st of next year
    }
  };
  
  // If user is not admin or superAdmin, filter by their leads only
  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    filter.agent = req.user.id;
  }
  
  // Get monthly lead counts
  const monthlyStats = await Lead.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        leads: {
          $push: {
            id: '$_id',
            status: '$status',
            source: '$source',
            createdAt: '$createdAt'
          }
        }
      }
    },
    {
      $sort: { '_id.month': 1 }
    }
  ]);
  
  // Create a complete year array with all 12 months
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const completeYearData = [];
  
  for (let month = 1; month <= 12; month++) {
    const monthData = monthlyStats.find(stat => stat._id.month === month);
    
    completeYearData.push({
      month: month,
      monthName: monthNames[month - 1],
      year: year,
      count: monthData ? monthData.count : 0,
      leads: monthData ? monthData.leads : []
    });
  }
  
  // Calculate total leads for the year
  const totalLeads = monthlyStats.reduce((sum, month) => sum + month.count, 0);
  
  // Calculate average leads per month
  const averageLeadsPerMonth = totalLeads / 12;
  
  // Find the month with highest and lowest leads
  const maxMonth = monthlyStats.reduce((max, month) => 
    month.count > max.count ? month : max, 
    { count: 0, _id: { month: 0 } }
  );
  
  const minMonth = monthlyStats.reduce((min, month) => 
    month.count < min.count ? month : min, 
    { count: Infinity, _id: { month: 0 } }
  );
  
  // Get status-wise breakdown for the year
  const statusBreakdown = await Lead.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get source-wise breakdown for the year
  const sourceBreakdown = await Lead.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const response = {
    year: year,
    totalLeads: totalLeads,
    averageLeadsPerMonth: Math.round(averageLeadsPerMonth * 100) / 100,
    monthlyData: completeYearData,
    summary: {
      highestMonth: maxMonth.count > 0 ? {
        month: maxMonth._id.month,
        monthName: monthNames[maxMonth._id.month - 1],
        count: maxMonth.count
      } : null,
      lowestMonth: minMonth.count < Infinity ? {
        month: minMonth._id.month,
        monthName: monthNames[minMonth._id.month - 1],
        count: minMonth.count
      } : null
    },
    statusBreakdown: statusBreakdown,
    sourceBreakdown: sourceBreakdown,
    generatedAt: new Date()
  };
  
  res.send(response);
}); 