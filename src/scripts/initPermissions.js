import mongoose from 'mongoose';
import * as config from '../config/config.js';
import { Permission } from '../models/index.js';

const defaultPermissions = [
  // User Management
  { name: 'getUsers', description: 'Can view users', module: 'users' },
  { name: 'manageUsers', description: 'Can manage users', module: 'users' },
  { name: 'manageAdmins', description: 'Can manage admins', module: 'users' },
  
  // Product Management
  { name: 'manageProducts', description: 'Can manage products', module: 'products' },
  { name: 'getProducts', description: 'Can view products', module: 'products' },
  
  // Category Management
  { name: 'manageCategories', description: 'Can manage categories', module: 'categories' },
  { name: 'getCategories', description: 'Can view categories', module: 'categories' },
  { name: 'manageSubcategories', description: 'Can manage subcategories', module: 'categories' },
  { name: 'getSubcategories', description: 'Can view subcategories', module: 'categories' },
  
  // Lead Management
  { name: 'manageLeads', description: 'Can manage leads', module: 'leads' },
  { name: 'getLeads', description: 'Can view leads', module: 'leads' },
  
  // Bank Account Management
  { name: 'manageBankAccounts', description: 'Can manage bank accounts', module: 'bankAccounts' },
  { name: 'getBankAccounts', description: 'Can view bank accounts', module: 'bankAccounts' },
  
  // Transaction Management
  { name: 'manageTransactions', description: 'Can manage transactions', module: 'transactions' },
  { name: 'getTransactions', description: 'Can view transactions', module: 'transactions' },
  
  // Commission Management
  { name: 'manageCommissions', description: 'Can manage commissions', module: 'commissions' },
  { name: 'getCommissions', description: 'Can view commissions', module: 'commissions' },
  
  // Notification Management
  { name: 'manageNotifications', description: 'Can manage notifications', module: 'notifications' },
  { name: 'getNotifications', description: 'Can view notifications', module: 'notifications' },
  
  // Settings Management
  { name: 'manageSettings', description: 'Can manage settings', module: 'settings' },
  { name: 'getSettings', description: 'Can view settings', module: 'settings' },
  
  // Role Management
  { name: 'manageRoles', description: 'Can manage roles', module: 'roles' },
  { name: 'getRoles', description: 'Can view roles', module: 'roles' },
  
  // Permission Management
  { name: 'managePermissions', description: 'Can manage permissions', module: 'permissions' },
  { name: 'getPermissions', description: 'Can view permissions', module: 'permissions' },
];

const initPermissions = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    // Clear existing permissions
    await Permission.deleteMany({});
    console.log('Cleared existing permissions');

    // Insert default permissions
    const permissions = await Permission.insertMany(defaultPermissions);
    console.log(`Inserted ${permissions.length} default permissions`);

    process.exit(0);
  } catch (error) {
    console.error('Error initializing permissions:', error);
    process.exit(1);
  }
};

initPermissions(); 