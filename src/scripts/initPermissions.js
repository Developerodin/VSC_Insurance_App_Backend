import mongoose from 'mongoose';
import * as config from '../config/config.js';
import { Permission } from '../models/index.js';
import { fileURLToPath } from 'url';

const defaultPermissions = [
  // User Management
  { name: 'getUsers', description: 'Can view users', module: 'users' },
  { name: 'manageUsers', description: 'Can manage users', module: 'users' },
  { name: 'manageAdmins', description: 'Can manage admins', module: 'users' },
  
  // Admin Routes
  { name: 'accessAdminPanel', description: 'Can access admin panel', module: 'admin' },
  { name: 'adminViewUsers', description: 'Can view users in admin panel', module: 'admin' },
  { name: 'adminManageKyc', description: 'Can manage KYC in admin panel', module: 'admin' },
  
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
  
  // LeadsFields Management
  { name: 'manageLeadsFields', description: 'Can manage leads fields configuration', module: 'leadsFields' },
  { name: 'getLeadsFields', description: 'Can view leads fields configuration', module: 'leadsFields' },
  
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

  // Wallet Management
  { name: 'getWallet', description: 'Can view wallet details', module: 'wallet' },
  { name: 'getWalletTransactions', description: 'Can view wallet transactions', module: 'wallet' },
  { name: 'getWalletStats', description: 'Can view wallet statistics', module: 'wallet' },
  { name: 'getCommissionEarnings', description: 'Can view commission earnings', module: 'wallet' },
  { name: 'getWithdrawalHistory', description: 'Can view withdrawal history', module: 'wallet' },
  { name: 'getPendingWithdrawals', description: 'Can view pending withdrawals', module: 'wallet' },
  { name: 'getRecentTransactions', description: 'Can view recent transactions', module: 'wallet' },
  { name: 'getTransactionDetails', description: 'Can view transaction details', module: 'wallet' },
  { name: 'manageWallets', description: 'Can manage wallets', module: 'wallet' },

  // Withdrawal Request Management
  { name: 'getWithdrawalRequests', description: 'Can view withdrawal requests', module: 'withdrawalRequests' },
  { name: 'manageWithdrawalRequests', description: 'Can manage withdrawal requests', module: 'withdrawalRequests' },
  { name: 'rejectWithdrawalRequest', description: 'Can reject withdrawal requests', module: 'withdrawalRequests' },
  { name: 'markWithdrawalRequestAsPaid', description: 'Can mark withdrawal requests as paid', module: 'withdrawalRequests' },
  { name: 'approveWithdrawalRequest', description: 'Can approve withdrawal requests', module: 'withdrawalRequests' },
  { name: 'getUserWithdrawalRequests', description: 'Can view user withdrawal requests', module: 'withdrawalRequests' },
  { name: 'createWithdrawalRequest', description: 'Can create withdrawal requests', module: 'withdrawalRequests' },
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

    return true;
  } catch (error) {
    console.error('Error initializing permissions:', error);
    return false;
  } finally {
    // Don't close the connection here to allow chaining with other operations
  }
};

// Execute if this file is run directly (not imported)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  initPermissions().then((success) => {
    // Only close the connection if running as main module
    mongoose.connection.close();
    process.exit(success ? 0 : 1);
  });
}

export default initPermissions; 