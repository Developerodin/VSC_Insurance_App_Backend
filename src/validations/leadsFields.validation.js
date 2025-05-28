import Joi from 'joi';
import { objectId } from './custom.validation.js';

const fieldDefinition = Joi.object({
  name: Joi.string().required().trim().min(1).max(100),
  type: Joi.string().required().trim().min(1).max(50)
});

const createLeadsFields = {
  body: Joi.object().keys({
    product: Joi.string().custom(objectId).required(),
    category: Joi.string().custom(objectId).required(),
    fields: Joi.array().items(fieldDefinition).default([])
  }),
};

const getLeadsFields = {
  query: Joi.object().keys({
    product: Joi.string().custom(objectId),
    category: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLeadsFieldsById = {
  params: Joi.object().keys({
    leadsFieldsId: Joi.string().custom(objectId),
  }),
};

const getLeadsFieldsByProductCategory = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
    categoryId: Joi.string().custom(objectId),
  }),
};

const updateLeadsFields = {
  params: Joi.object().keys({
    leadsFieldsId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      product: Joi.string().custom(objectId),
      category: Joi.string().custom(objectId),
      fields: Joi.array().items(fieldDefinition)
    })
    .min(1),
};

const deleteLeadsFields = {
  params: Joi.object().keys({
    leadsFieldsId: Joi.string().custom(objectId),
  }),
};

const addField = {
  params: Joi.object().keys({
    leadsFieldsId: Joi.string().custom(objectId),
  }),
  body: fieldDefinition,
};

const updateField = {
  params: Joi.object().keys({
    leadsFieldsId: Joi.string().custom(objectId),
    fieldIndex: Joi.number().integer().min(0),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim().min(1).max(100),
      type: Joi.string().trim().min(1).max(50)
    })
    .min(1),
};

const removeField = {
  params: Joi.object().keys({
    leadsFieldsId: Joi.string().custom(objectId),
    fieldIndex: Joi.number().integer().min(0),
  }),
};

const removeFieldByName = {
  params: Joi.object().keys({
    leadsFieldsId: Joi.string().custom(objectId),
    fieldName: Joi.string().required(),
  }),
};

const reorderFields = {
  params: Joi.object().keys({
    leadsFieldsId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    fieldIndexes: Joi.array().items(Joi.number().integer().min(0)).required()
  }),
};

export const leadsFieldsValidation = {
  createLeadsFields,
  getLeadsFields,
  getLeadsFieldsById,
  getLeadsFieldsByProductCategory,
  updateLeadsFields,
  deleteLeadsFields,
  addField,
  updateField,
  removeField,
  removeFieldByName,
  reorderFields,
}; 