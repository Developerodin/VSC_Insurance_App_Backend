import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createAdminUser = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    email: Joi.string().required().email().trim().lowercase(),
    password: Joi.string().required().min(8).trim(),
    role: Joi.string().valid('admin', 'superAdmin').optional(),
    products: Joi.array().items(Joi.string().custom(objectId)).optional(),
    navigation: Joi.object().optional(),
  }),
};

const getAdminUsers = {
  query: Joi.object().keys({
    search: Joi.string().trim(),
    role: Joi.string().valid('admin', 'superAdmin'),
    status: Joi.string().valid('pending', 'active', 'inactive', 'suspended'),
    products: Joi.string(), // Comma-separated product IDs
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAdminUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateAdminUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      email: Joi.string().email().trim().lowercase(),
      password: Joi.string().min(8).trim(),
      role: Joi.string().valid('admin', 'superAdmin'),
      status: Joi.string().valid('pending', 'active', 'inactive', 'suspended'),
      products: Joi.array().items(Joi.string().custom(objectId)),
      navigation: Joi.object(),
    })
    .min(1),
};

const deleteAdminUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export default {
  createAdminUser,
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
};
