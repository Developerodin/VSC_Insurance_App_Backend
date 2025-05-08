import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createLead = {
  body: Joi.object().keys({
    customerName: Joi.string().required(),
    email: Joi.string().email(),
    mobileNumber: Joi.string().required(),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other').required(),
    products: Joi.array().items(Joi.object().keys({
      product: Joi.string().custom(objectId).required(),
      status: Joi.string().valid('interested', 'proposed', 'sold', 'rejected'),
      notes: Joi.string(),
    })),
    requirements: Joi.string(),
    budget: Joi.object().keys({
      amount: Joi.number(),
      currency: Joi.string().default('INR'),
    }),
    address: Joi.object().keys({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string(),
      country: Joi.string().default('India'),
    }),
    tags: Joi.array().items(Joi.string()),
  }),
};

const getLeads = {
  query: Joi.object().keys({
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
};

const updateLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    customerName: Joi.string(),
    email: Joi.string().email(),
    mobileNumber: Joi.string(),
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other'),
    products: Joi.array().items(Joi.object().keys({
      product: Joi.string().custom(objectId).required(),
      status: Joi.string().valid('interested', 'proposed', 'sold', 'rejected'),
      notes: Joi.string(),
    })),
    requirements: Joi.string(),
    budget: Joi.object().keys({
      amount: Joi.number(),
      currency: Joi.string(),
    }),
    address: Joi.object().keys({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string(),
      country: Joi.string(),
    }),
    tags: Joi.array().items(Joi.string()),
  }),
};

const deleteLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
};

const addFollowUp = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    date: Joi.date().required(),
    notes: Joi.string(),
    status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending'),
  }),
};

const addNote = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
  }),
};

const getLeadStats = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
};

const assignLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    agentId: Joi.string().custom(objectId).required(),
  }),
};

export {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  addFollowUp,
  addNote,
  getLeadStats,
  assignLead,
}; 