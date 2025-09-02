import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createLead = {
  body: Joi.object().keys({
    agent: Joi.string().custom(objectId).required(),
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost').default('new'),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other').required(),
    category: Joi.string().custom(objectId).required(),
    subcategory: Joi.string().custom(objectId),
    products: Joi.array().items(Joi.object().keys({
      product: Joi.string().custom(objectId),
      status: Joi.string().valid('interested', 'proposed', 'sold', 'rejected'),
    })),
    fieldsData: Joi.object().pattern(Joi.string(), Joi.any()).default({}),
    lastContact: Joi.date(),
    nextFollowUp: Joi.date(),
    documents: Joi.array().items(Joi.object().keys({
      url: Joi.string().required(),
      key: Joi.string().required(),
      name: Joi.string().required(),
      uploadedAt: Joi.date().default(() => new Date()),
    })),
    remark: Joi.string().allow(''),
  }),
};

const getLeads = {
  query: Joi.object().keys({
    agent: Joi.string().custom(objectId),
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other'),
    category: Joi.string().custom(objectId),
    subcategory: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
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
      status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
      source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other'),
      category: Joi.string().custom(objectId),
      subcategory: Joi.string().custom(objectId),
      products: Joi.array().items(Joi.object().keys({
        product: Joi.string().custom(objectId),
        status: Joi.string().valid('interested', 'proposed', 'sold', 'rejected'),
      })),
      fieldsData: Joi.object().pattern(Joi.string(), Joi.any()),
      lastContact: Joi.date(),
      nextFollowUp: Joi.date(),
      documents: Joi.array().items(Joi.object().keys({
        url: Joi.string().required(),
        key: Joi.string().required(),
        name: Joi.string().required(),
        uploadedAt: Joi.date(),
      })),
      remark: Joi.string().allow(''),
    })
    .min(1),
};

const deleteLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
};

const getLeadStats = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date(),
    agent: Joi.string().custom(objectId),
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other'),
    category: Joi.string().custom(objectId),
    subcategory: Joi.string().custom(objectId),
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

const getLeadsByUserId = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
    source: Joi.string().valid('direct', 'referral', 'website', 'social', 'other'),
    category: Joi.string().custom(objectId),
    subcategory: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const updateLeadFields = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    fieldsData: Joi.object().pattern(Joi.string(), Joi.any()).required(),
  }),
};

const updateLeadProducts = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    products: Joi.array().items(Joi.object().keys({
      product: Joi.string().custom(objectId).required(),
      status: Joi.string().valid('interested', 'proposed', 'sold', 'rejected'),
    })).required(),
  }),
};

const updateLeadStatus = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost').required(),
    remark: Joi.string().allow('').optional(),
  }),
};

export {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadStats,
  assignLead,
  getLeadsByUserId,
  updateLeadFields,
  updateLeadProducts,
  updateLeadStatus,
}; 