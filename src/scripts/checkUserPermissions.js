import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import * as config from '../config/config.js';
import { User, Role, RolePermission, Permission } from '../models/index.js';
import { roleRights } from '../config/roles.js';

/**
 * Get user permissions from database based on role
 * @param {string} roleName - User's role name
 * @returns {Promise<Array<string>>} List of permission names
 */
const getRolePermissions = async (roleName) => {
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
};

/**
 * Check if user has a specific permission
 * @param {string} roleName - User's role name
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} Whether user has permission
 */
const hasPermission = async (roleName, permission) => {
  // Check static rights from config
  const staticRights = roleRights.get(roleName) || [];
  if (staticRights.includes(permission)) return true;
  
  // Check dynamic rights from database
  const dynamicRights = await getRolePermissions(roleName);
  return dynamicRights.includes(permission);
};

const checkUserPermissions = async (email) => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found`);
      return false;
    }
    
    console.log(`\nUser: ${user.name} (${user.email})`);
    console.log(`Role: ${user.role}`);
    
    // Get static rights
    const staticRights = roleRights.get(user.role) || [];
    console.log(`\nStatic rights from config: ${staticRights.length ? staticRights.join(', ') : 'None'}`);
    
    // Get dynamic rights
    const dynamicRights = await getRolePermissions(user.role);
    console.log(`\nDynamic rights from database: ${dynamicRights.length ? dynamicRights.join(', ') : 'None'}`);
    
    // Combined rights
    const allRights = [...new Set([...staticRights, ...dynamicRights])];
    console.log(`\nTotal permissions: ${allRights.length}`);
    
    // Check key permissions
    const keyPermissions = ['getUsers', 'manageUsers', 'accessAdminPanel', 'adminViewUsers'];
    console.log('\nChecking key permissions:');
    for (const perm of keyPermissions) {
      const has = await hasPermission(user.role, perm);
      console.log(`- ${perm}: ${has ? 'YES' : 'NO'}`);
    }
    
    console.log('\nAll permissions:');
    console.log(allRights.join('\n'));
    
    return true;
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

// Get email from command line argument
const args = process.argv.slice(2);
const email = args[0];

if (!email) {
  console.error('Please provide a user email as an argument');
  process.exit(1);
}

// Execute if this file is run directly (not imported)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  checkUserPermissions(email).then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export default checkUserPermissions; 