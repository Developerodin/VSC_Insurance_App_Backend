import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { roleRights } from '../config/roles.js';
import { Role, RolePermission, Permission } from '../models/index.js';

/**
 * Get user permissions from database based on role
 * @param {string} roleName - User's role name
 * @returns {Promise<Array<string>>} List of permission names
 */
const getUserPermissions = async (roleName) => {
  try {
    // Get role by name
    const role = await Role.findOne({ name: roleName, isActive: true });
    if (!role) {
      console.warn(`Role not found or inactive: ${roleName}`);
      return [];
    }
    
    // Get permissions for this role
    const rolePermissions = await RolePermission.find({ roleId: role._id }).populate('permissionId');
    
    // Extract permission names, filtering out any null values or inactive permissions
    return rolePermissions
      .filter(rp => rp.permissionId && rp.permissionId.isActive)
      .map(rp => rp.permissionId.name);
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleName}:`, error);
    return [];
  }
};

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  try {
    // Authentication check
    if (err || info || !user) {
      console.log('Authentication failed:', err || info || 'No user found');
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    
    // Set user in request
    req.user = user;
    
    // If no rights required, allow access
    if (!requiredRights || requiredRights.length === 0) {
      return resolve();
    }
    
    console.log('Auth check for:', req.method, req.originalUrl);
    console.log('User role:', user.role);
    console.log('Required permissions:', JSON.stringify(requiredRights));
    
    // 1. Get static rights from hardcoded config (for backward compatibility)
    const staticRights = roleRights.get(user.role) || [];
    console.log('Static rights:', JSON.stringify(staticRights));
    
    // 2. Get dynamic rights from database
    const dynamicRights = await getUserPermissions(user.role);
    console.log('Dynamic rights:', JSON.stringify(dynamicRights));
    
    // 3. Combine all rights
    const allUserRights = [...new Set([...staticRights, ...dynamicRights])];
    console.log('Combined user rights:', JSON.stringify(allUserRights));
    
    // 4. Check if user has ANY of the required rights (not ALL)
    const matchedRights = requiredRights.filter(right => allUserRights.includes(right));
    const hasAnyRequiredRight = matchedRights.length > 0;
    
    console.log('Matched rights:', JSON.stringify(matchedRights));
    console.log('Has required rights:', hasAnyRequiredRight);
    
    // 5. Allow access if user has any required right OR is accessing their own resource
    const isAccessingOwnResource = req.params.userId === user.id;
    console.log('Is accessing own resource:', isAccessingOwnResource);
    
    if (hasAnyRequiredRight || isAccessingOwnResource) {
      return resolve();
    }
    
    // Access denied
    console.log('Access denied: insufficient permissions');
    return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'));
  }
};

const auth = (...requiredRights) => async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    });
    next();
  } catch (err) {
    next(err);
  }
};

export default auth;

