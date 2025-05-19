import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createPermission = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    module: Joi.string().required(),
    isActive: Joi.boolean(),
  }),
};

const getPermissions = {
  query: Joi.object().keys({
    name: Joi.string(),
    module: Joi.string(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().custom(objectId),
  }),
};

const updatePermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      module: Joi.string(),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deletePermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().custom(objectId),
  }),
};

export default {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
}; 