import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createLead = {
  body: Joi.object().keys({
    agent: Joi.string().custom(objectId).required(),
    customerName: Joi.string().required().trim(),
    email: Joi.string().email().trim().lowercase(),
    mobileNumber: Joi.string().required().trim(),
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost').default('new'),
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
    followUps: Joi.array().items(Joi.object().keys({
      date: Joi.date().required(),
      notes: Joi.string(),
      status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending'),
      agent: Joi.string().custom(objectId),
    })),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
      uploadedAt: Joi.date().default(() => new Date()),
    })),
    notes: Joi.array().items(Joi.object().keys({
      content: Joi.string().required(),
      createdBy: Joi.string().custom(objectId).required(),
      createdAt: Joi.date().default(() => new Date()),
    })),
    lastContact: Joi.date(),
    nextFollowUp: Joi.date(),
    address: Joi.object().keys({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string(),
      country: Joi.string().default('India'),
    }),
    tags: Joi.array().items(Joi.string()),
    metadata: Joi.object().pattern(Joi.string(), Joi.any()),
  }),
};

const getLeads = {
  query: Joi.object().keys({
    agent: Joi.string().custom(objectId),
    customerName: Joi.string(),
    email: Joi.string().email(),
    mobileNumber: Joi.string(),
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
};

const updateLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      agent: Joi.string().custom(objectId),
      customerName: Joi.string().trim(),
      email: Joi.string().email().trim().lowercase(),
      mobileNumber: Joi.string().trim(),
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
      followUps: Joi.array().items(Joi.object().keys({
        date: Joi.date().required(),
        notes: Joi.string(),
        status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending'),
        agent: Joi.string().custom(objectId),
      })),
      documents: Joi.array().items(Joi.object().keys({
        name: Joi.string().required(),
        url: Joi.string().required(),
        type: Joi.string().required(),
        uploadedAt: Joi.date(),
      })),
      notes: Joi.array().items(Joi.object().keys({
        content: Joi.string().required(),
        createdBy: Joi.string().custom(objectId).required(),
        createdAt: Joi.date(),
      })),
      lastContact: Joi.date(),
      nextFollowUp: Joi.date(),
      address: Joi.object().keys({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        pincode: Joi.string(),
        country: Joi.string(),
      }),
      tags: Joi.array().items(Joi.string()),
      metadata: Joi.object().pattern(Joi.string(), Joi.any()),
    })
    .min(1),
};

const deleteLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
};

const addFollowUp = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    date: Joi.date().required(),
    notes: Joi.string(),
    status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending'),
    agent: Joi.string().custom(objectId),
  }),
};

const addNote = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
    createdBy: Joi.string().custom(objectId).required(),
  }),
};

const getLeadStats = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date(),
    agent: Joi.string().custom(objectId),
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other'),
  }),
};

const assignLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
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