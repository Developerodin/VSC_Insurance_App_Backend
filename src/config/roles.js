export const roles = ['user', 'admin', 'superAdmin'];

export const roleRights = new Map();
roleRights.set(roles[0], ['getUsers']);
roleRights.set(roles[1], ['getUsers', 'manageUsers']);
roleRights.set(roles[2], ['getUsers', 'manageUsers', 'manageAdmins']);
