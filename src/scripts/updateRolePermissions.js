import mongoose from 'mongoose';
import * as config from '../config/config.js';
import { Role, Permission, RolePermission } from '../models/index.js';
import { fileURLToPath } from 'url';

const updateRolePermissions = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    // Get all permissions
    const permissions = await Permission.find({});
    const permissionMap = new Map(permissions.map(p => [p.name, p._id]));

    // Get all roles
    const userRole = await Role.findOne({ name: 'user' });
    const adminRole = await Role.findOne({ name: 'admin' });
    const superAdminRole = await Role.findOne({ name: 'superAdmin' });

    if (!userRole || !adminRole || !superAdminRole) {
      console.error('One or more required roles not found');
      return false;
    }

    // Define permission sets for each role
    const rolePermissionsMap = {
      user: [
        'getUsers',
        'getProducts',
        'getCategories',
        'getSubcategories',
        'getLeads',
        'getLeadsFields',
        'getBankAccounts',
        'getTransactions',
        'getCommissions',
        'manageCommissions',
        'getNotifications',
        'getSettings',
        'manageLeads'
      ],
      admin: [
        // User permissions
        'getUsers', 
        'manageUsers',
        // Product permissions
        'getProducts',
        'manageProducts',
        // Category permissions
        'getCategories',
        'manageCategories', 
        'getSubcategories',
        'manageSubcategories',
        // Lead permissions
        'getLeads',
        'manageLeads',
        // LeadsFields permissions
        'getLeadsFields',
        'manageLeadsFields',
        // Bank account permissions
        'getBankAccounts',
        'manageBankAccounts',
        // Transaction permissions
        'getTransactions',
        'manageTransactions',
        // Commission permissions
        'getCommissions',
        'manageCommissions',
        // Notification permissions
        'getNotifications',
        'manageNotifications',
        // Settings permissions
        'getSettings',
        'manageSettings',
        // Role permissions
        'getRoles',
        // Admin panel permissions
        'accessAdminPanel',
        'adminViewUsers',
        'adminManageKyc',
     
      ],
      superAdmin: [
        // All permissions
        'getUsers', 
        'manageUsers',
        'manageAdmins',
        'getProducts',
        'manageProducts',
        'getCategories',
        'manageCategories', 
        'getSubcategories',
        'manageSubcategories',
        'getLeads',
        'manageLeads',
        'getLeadsFields',
        'manageLeadsFields',
        'getBankAccounts',
        'manageBankAccounts',
        'getTransactions',
        'manageTransactions',
        'getCommissions',
        'manageCommissions',
        'getNotifications',
        'manageNotifications',
        'getSettings',
        'manageSettings',
        'getRoles',
        'manageRoles',
        'getPermissions',
        'managePermissions',
        'accessAdminPanel',
        'adminViewUsers',
        'adminManageKyc',
      
      ]
    };

    // Function to update role permissions
    const updateRoleWithPermissions = async (role, permissionNames) => {
      // Get existing role permissions
      const existingRolePermissions = await RolePermission.find({ roleId: role._id });
      const existingPermissionIds = existingRolePermissions.map(p => p.permissionId.toString());
      
      // Add new permissions
      let addedCount = 0;
      for (const permName of permissionNames) {
        const permId = permissionMap.get(permName);
        if (permId && !existingPermissionIds.includes(permId.toString())) {
          await RolePermission.create({
            roleId: role._id,
            permissionId: permId
          });
          addedCount++;
        }
      }
      
      console.log(`Added ${addedCount} permissions to ${role.name} role`);
    };

    // Update each role with their permissions
    await updateRoleWithPermissions(userRole, rolePermissionsMap.user);
    await updateRoleWithPermissions(adminRole, rolePermissionsMap.admin);
    await updateRoleWithPermissions(superAdminRole, rolePermissionsMap.superAdmin);

    console.log('Role permissions updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return false;
  }
};

// Execute if this file is run directly (not imported)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  updateRolePermissions().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export default updateRolePermissions; 