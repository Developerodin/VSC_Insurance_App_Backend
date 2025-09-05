import Joi from 'joi';
import { objectId } from './custom.validation.js';

const assignPermissionsToRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    permissionIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    productIds: Joi.array().items(Joi.string().custom(objectId)).optional(),
  }),
};

const getPermissionsForRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const removePermissionFromRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
    permissionId: Joi.string().custom(objectId),
  }),
};

const getPermissionsForRoleByProduct = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
    productId: Joi.string().custom(objectId),
  }),
};

export default {
  assignPermissionsToRole,
  getPermissionsForRole,
  removePermissionFromRole,
  getPermissionsForRoleByProduct,
}; 