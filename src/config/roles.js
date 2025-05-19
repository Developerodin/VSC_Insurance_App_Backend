export const roles = ['user', 'admin', 'superAdmin'];

export const roleRights = new Map();
roleRights.set(roles[0], ['getUsers']);
roleRights.set(roles[1], ['getUsers', 'manageUsers', 'getRoles']);
roleRights.set(roles[2], [
  'getUsers', 
  'manageUsers', 
  'manageAdmins',
  'manageProducts',
  'manageCategories',
  'manageSubcategories',
  'manageLeads',
  'manageBankAccounts',
  'getCategories',
  'getSubcategories',
  'getLeads',
  'getProducts',
  'getBankAccounts',
  'manageTransactions',
  'getTransactions',
  'manageCommissions',
  'getCommissions',
  'manageNotifications',
  'getNotifications',
  'manageSettings',
  'getSettings',
  'getRoles',
  'manageRoles',
  'getPermissions',
  'managePermissions'
]);
