import httpStatus from 'http-status';
import { Lead, User, Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';

export const createLead = catchAsync(async (req, res) => {
  const lead = await Lead.create({
    ...req.body,
    agent: req.user.id,
  });

  // Create notification for the agent
  await Notification.create({
    recipient: req.user.id,
    type: 'lead_assigned',
    title: 'New Lead Assigned',
    message: `A new lead has been assigned to you`,
    channels: ['in_app', 'email'],
    data: {
      leadId: lead._id,
    },
  });

  res.status(httpStatus.CREATED).send(lead);
});

export const getLeads = catchAsync(async (req, res) => {
  const filter = {};
  const options = {};

  // Filter by agent if not admin
  if (req.user.role !== 'admin') {
    filter.agent = req.user.id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.category) filter.category = req.query.category;

  const leads = await Lead.paginate(filter, options);
  res.send(leads);
});

export const getLead = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  if (lead.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  res.send(lead);
});

export const updateLead = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  if (lead.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  const oldStatus = lead.status;
  Object.assign(lead, req.body);
  await lead.save();

  // Create notification if status changed
  if (oldStatus !== lead.status) {
    await Notification.create({
      recipient: lead.agent,
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
  }

  res.send(lead);
});

export const deleteLead = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  if (lead.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await lead.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

export const addFollowUp = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  if (lead.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  lead.followUps.push({
    ...req.body,
    agent: req.user.id,
  });
  await lead.save();

  // Create notification for follow-up
  await Notification.create({
    recipient: lead.agent,
    type: 'follow_up_reminder',
    title: 'Follow-up Added',
    message: `A new follow-up has been added for lead: ${lead.customerName}`,
    channels: ['in_app', 'email'],
    data: {
      leadId: lead._id,
      followUpDate: req.body.date,
    },
  });

  res.send(lead);
});

export const addNote = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  if (lead.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  lead.notes.push({
    content: req.body.content,
    createdBy: req.user.id,
  });
  await lead.save();
  res.send(lead);
});

export const getLeadStats = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
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
  const lead = await Lead.findById(req.params.leadId);
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

  res.send(lead);
});

export const getLeadsByUserId = catchAsync(async (req, res) => {
  const filter = { agent: req.params.userId };
  const options = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.category) filter.category = req.query.category;

  const leads = await Lead.paginate(filter, options);
  res.send(leads);
});

export const updateLeadFields = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  if (lead.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
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
  res.send(lead);
});

export const updateLeadProducts = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  if (lead.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  if (req.body.products) {
    lead.products = req.body.products;
  }
  
  await lead.save();
  res.send(lead);
}); 