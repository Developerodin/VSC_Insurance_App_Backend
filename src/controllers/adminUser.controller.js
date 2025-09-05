import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync.js';
import * as adminUserService from '../services/adminUser.service.js';

const createAdminUser = catchAsync(async (req, res) => {
  const adminUser = await adminUserService.createAdminUser(req.body);
  res.status(httpStatus.CREATED).send(adminUser);
});

const getAdminUsers = catchAsync(async (req, res) => {
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
      { email: { $regex: searchRegex } }
    ];

    filter.$or = searchConditions;
  }

  // Add filters
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.products) {
    filter.products = { $in: req.query.products.split(',') };
  }

  console.log('🔍 Admin User filter:', filter);
  console.log('🔍 Admin User options:', options);

  const result = await adminUserService.getAdminUsers(filter, options);
  res.send(result);
});

const getAdminUser = catchAsync(async (req, res) => {
  const adminUser = await adminUserService.getAdminUserById(req.params.userId);
  res.send(adminUser);
});

const updateAdminUser = catchAsync(async (req, res) => {
  const adminUser = await adminUserService.updateAdminUser(req.params.userId, req.body);
  res.send(adminUser);
});

const deleteAdminUser = catchAsync(async (req, res) => {
  await adminUserService.deleteAdminUser(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createAdminUser,
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
};
