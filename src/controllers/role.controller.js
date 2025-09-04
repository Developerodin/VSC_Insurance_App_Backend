import httpStatus from 'http-status';
import {catchAsync} from '../utils/catchAsync.js';
import * as roleService  from '../services/role.service.js';

const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body);
  res.status(httpStatus.CREATED).send(role);
});

const getRoles = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
    sortBy: req.query.sortBy || 'createdAt:desc'
  };

  // Add search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    const searchConditions = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } }
    ];

    filter.$or = searchConditions;
  }

  // Add filters
  if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  console.log('🔍 Role filter:', filter);
  console.log('🔍 Role options:', options);
  console.log('🔍 Search query:', req.query.search);

  const result = await roleService.queryRoles(filter, options);
  res.send(result);
});

const getRole = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.roleId);
  res.send(role);
});

const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRoleById(req.params.roleId, req.body);
  res.send(role);
});

const deleteRole = catchAsync(async (req, res) => {
  await roleService.deleteRoleById(req.params.roleId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
}; 