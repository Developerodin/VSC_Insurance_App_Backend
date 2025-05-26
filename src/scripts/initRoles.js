import mongoose from 'mongoose';
import * as config from '../config/config.js';
import { Role, Permission, RolePermission } from '../models/index.js';
import { fileURLToPath } from 'url';

const defaultRoles = [
  {
    name: 'user',
    description: 'Basic user role',
    permissions: ['getUsers', 'getProducts', 'getCategories', 'getSubcategories', 'getLeads', 'getBankAccounts', 'getTransactions', 'getCommissions', 'getNotifications', 'getSettings']
  },
  {
    name: 'admin',
    description: 'Administrator role',
    permissions: [
      'getUsers', 'manageUsers', 
      'getProducts', 'manageProducts', 
      'getCategories', 'manageCategories', 
      'getSubcategories', 'manageSubcategories', 
      'getLeads', 'manageLeads', 
      'getBankAccounts', 'manageBankAccounts', 
      'getTransactions', 'manageTransactions', 
      'getCommissions', 'manageCommissions', 
      'getNotifications', 'manageNotifications', 
      'getSettings', 'manageSettings',
      'getRoles',
      'accessAdminPanel', 'adminViewUsers', 'adminManageKyc'
    ]
  },
  {
    name: 'superAdmin',
    description: 'Super Administrator role with all permissions',
    permissions: [
      'getUsers', 'manageUsers', 'manageAdmins',
      'getProducts', 'manageProducts',
      'getCategories', 'manageCategories',
      'getSubcategories', 'manageSubcategories',
      'getLeads', 'manageLeads',
      'getBankAccounts', 'manageBankAccounts',
      'getTransactions', 'manageTransactions',
      'getCommissions', 'manageCommissions',
      'getNotifications', 'manageNotifications',
      'getSettings', 'manageSettings',
      'manageRoles', 'getRoles',
      'managePermissions', 'getPermissions',
      'accessAdminPanel', 'adminViewUsers', 'adminManageKyc'
    ]
  }
];

const initRoles = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    // Clear existing roles and role permissions
    await Role.deleteMany({});
    await RolePermission.deleteMany({});
    console.log('Cleared existing roles and role permissions');

    // Get all permissions
    const permissions = await Permission.find({});
    const permissionMap = new Map(permissions.map(p => [p.name, p._id]));

    // For superAdmin, ensure ALL permissions are assigned
    if (permissions.length > defaultRoles[2].permissions.length) {
      console.log('Adding all available permissions to superAdmin');
      defaultRoles[2].permissions = permissions.map(p => p.name);
    }

    // Create roles and assign permissions
    for (const roleData of defaultRoles) {
      const role = await Role.create({
        name: roleData.name,
        description: roleData.description
      });

      const validPermissions = roleData.permissions
        .filter(permName => permissionMap.has(permName))
        .map(permName => ({
          roleId: role._id,
          permissionId: permissionMap.get(permName)
        }));

      if (validPermissions.length > 0) {
        await RolePermission.insertMany(validPermissions);
      }
      
      console.log(`Created role ${role.name} with ${validPermissions.length} permissions`);
    }

    return true;
  } catch (error) {
    console.error('Error initializing roles:', error);
    return false;
  }
};

// Execute if this file is run directly (not imported)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  initRoles().then((success) => {
    mongoose.connection.close();
    process.exit(success ? 0 : 1);
  });
}

export default initRoles; 