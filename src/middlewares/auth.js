import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { roleRights } from '../config/roles.js';
import jwt from 'jsonwebtoken';
import * as config from '../config/config.js';
import * as  tokenService  from '../services/token.service.js';
import { RolePermission, Permission } from '../models/index.js';

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth = (...requiredPermissions) => async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const payload = jwt.verify(token, config.jwt.secret);
    const user = await tokenService.verifyToken(token, payload.type);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    // Get user's role permissions from database
    const rolePermissions = await RolePermission.find({ roleId: user.role })
      .populate('permissionId');

    // Extract permission names
    const userPermissions = rolePermissions.map(rp => rp.permissionId.name);

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default auth;

