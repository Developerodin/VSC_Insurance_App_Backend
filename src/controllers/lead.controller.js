import httpStatus from 'http-status';
import { Lead, User, Notification, Commission, Subcategory, Wallet, WalletTransaction } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';
import walletService from '../services/wallet.service.js';

export const createLead = catchAsync(async (req, res) => {
  const lead = await Lead.create({
    ...req.body,
    agent: req.user.id,
  });

  // Update wallet statistics for lead creation
  await walletService.updateWalletOnLeadCreation(req.user.id);

  // Create notification
  await Notification.create({
    recipient: req.user.id,
    type: 'lead_created',
    title: 'New Lead Created',
    message: 'A new lead has been created',
    channels: ['in_app', 'email'],
    data: {
      leadId: lead._id,
    },
  });

  res.status(httpStatus.CREATED).send(lead);
});

export const getLeads = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    populate: 'agent,category,subcategory,products.product',
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
    .populate('products.product');
    
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

    // If status changed to closed and subcategory exists, create commission and update wallet
    if (lead.status === 'closed' && lead.subcategory) {
      console.log('🔍 Commission check: Lead status is closed and has subcategory');
      console.log('🔍 Subcategory ID:', lead.subcategory._id);
      
      const subcategory = await Subcategory.findById(lead.subcategory._id);
      console.log('🔍 Subcategory found:', !!subcategory);
      
      if (subcategory && subcategory.commission) {
        console.log('🔍 Commission config found:', {
          percentage: subcategory.commission.percentage,
          basePrice: subcategory.pricing.basePrice,
          bonus: subcategory.commission.bonus
        });
        
        // Calculate commission amount
        const commissionAmount = subcategory.commission.percentage * subcategory.pricing.basePrice / 100;
        const totalAmount = commissionAmount + (subcategory.commission.bonus || 0);
        
        console.log('🔍 Commission calculation:', {
          commissionAmount,
          bonus: subcategory.commission.bonus || 0,
          totalAmount
        });

        // Create commission (wallet will be updated only when commission is approved)
        const commission = await Commission.create({
          agent: lead.agent._id,
          product: lead.products[0].product,
          lead: lead._id,
          amount: totalAmount,
          percentage: subcategory.commission.percentage,
          baseAmount: subcategory.pricing.basePrice,
          bonus: subcategory.commission.bonus || 0,
          status: 'pending',
        });
        
        console.log('✅ Commission created successfully:', commission._id);

        // Create notification for commission creation
        await Notification.create({
          recipient: lead.agent._id,
          type: 'commission_created',
          title: 'Commission Created',
          message: `A commission of $${totalAmount} has been created for closing the lead. It will be added to your wallet once approved by an admin.`,
          channels: ['in_app', 'email'],
          data: {
            commissionId: commission._id,
            amount: totalAmount,
            status: 'pending',
          },
        });
        
        console.log('✅ Commission workflow completed successfully');
      } else {
        console.log('❌ Commission not created because:');
        if (!subcategory) {
          console.log('   - Subcategory not found in database');
        } else if (!subcategory.commission) {
          console.log('   - Subcategory has no commission configuration');
          console.log('   - Subcategory data:', {
            name: subcategory.name,
            hasCommission: !!subcategory.commission,
            hasPricing: !!subcategory.pricing
          });
        }
      }
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
    .populate('products.product');
    
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
    
    // Create phases with completion status and details
    phases: allStatuses.map((status, index) => {
      const phaseDetails = phasesDetails.find(phase => phase.name === status);
      return {
        name: status,
        description: phaseDetails.description,
        estimatedDuration: phaseDetails.estimatedDuration,
        completed: index <= currentStatusIndex && lead.status !== 'lost',
        active: status === lead.status,
        skipped: lead.status === 'lost' && index > currentStatusIndex,
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
  
  // Add last contact event if available
  if (lead.lastContact) {
    timeline.keyEvents.push({
      name: 'Last Contact',
      date: lead.lastContact,
      description: 'Last communication with the lead'
    });
  }
  
  // Add next follow-up event if available
  if (lead.nextFollowUp) {
    timeline.keyEvents.push({
      name: 'Next Follow-up',
      date: lead.nextFollowUp,
      description: 'Scheduled follow-up with the lead'
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