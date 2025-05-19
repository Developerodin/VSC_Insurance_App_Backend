import mongoose from 'mongoose';
import * as config from '../config/config.js';
import { Role, Permission, RolePermission } from '../models/index.js';

const defaultRoles = [
  {
    name: 'user',
    description: 'Basic user role',
    permissions: ['getUsers', 'getProducts', 'getCategories', 'getSubcategories', 'getLeads', 'getBankAccounts', 'getTransactions', 'getCommissions', 'getNotifications', 'getSettings']
  },
  {
    name: 'admin',
    description: 'Administrator role',
    permissions: ['getUsers', 'manageUsers', 'getProducts', 'manageProducts', 'getCategories', 'manageCategories', 'getSubcategories', 'manageSubcategories', 'getLeads', 'manageLeads', 'getBankAccounts', 'manageBankAccounts', 'getTransactions', 'manageTransactions', 'getCommissions', 'manageCommissions', 'getNotifications', 'manageNotifications', 'getSettings', 'manageSettings']
  },
  {
    name: 'superAdmin',
    description: 'Super Administrator role with all permissions',
    permissions: ['getUsers', 'manageUsers', 'manageAdmins', 'getProducts', 'manageProducts', 'getCategories', 'manageCategories', 'getSubcategories', 'manageSubcategories', 'getLeads', 'manageLeads', 'getBankAccounts', 'manageBankAccounts', 'getTransactions', 'manageTransactions', 'getCommissions', 'manageCommissions', 'getNotifications', 'manageNotifications', 'getSettings', 'manageSettings', 'manageRoles', 'getRoles', 'managePermissions', 'getPermissions']
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

    // Create roles and assign permissions
    for (const roleData of defaultRoles) {
      const role = await Role.create({
        name: roleData.name,
        description: roleData.description
      });

      const rolePermissions = roleData.permissions.map(permissionName => ({
        roleId: role._id,
        permissionId: permissionMap.get(permissionName)
      }));

      await RolePermission.insertMany(rolePermissions);
      console.log(`Created role ${role.name} with ${rolePermissions.length} permissions`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error initializing roles:', error);
    process.exit(1);
  }
};

initRoles(); 