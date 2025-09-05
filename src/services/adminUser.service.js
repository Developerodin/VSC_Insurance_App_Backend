import httpStatus from 'http-status';
import { User, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create admin user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createAdminUser = async (userBody) => {
  const { name, email, password, products, navigation, role = 'admin' } = userBody;

  // Check if email is already taken
  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Validate products if provided
  if (products && products.length > 0) {
    const validProducts = await Product.find({ _id: { $in: products } });
    if (validProducts.length !== products.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'One or more products not found');
    }
  }

  // Create admin user object
  const adminUser = {
    name,
    email,
    password,
    role,
    status: 'active', // Admin users are active by default
    isEmailVerified: true, // Admin users are email verified by default
    products: products || [],
    navigation: navigation || null,
  };

  const user = await User.create(adminUser);
  return user;
};

/**
 * Get admin users with products populated
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getAdminUsers = async (filter, options) => {
  const adminFilter = { ...filter, role: { $in: ['admin', 'superAdmin'] } };
  
  const users = await User.paginate(adminFilter, {
    ...options,
    populate: 'products',
    select: 'name email role status isEmailVerified products navigation createdAt updatedAt',
  });
  
  return users;
};

/**
 * Update admin user
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateAdminUser = async (userId, updateBody) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user is admin/superAdmin
  if (!['admin', 'superAdmin'].includes(user.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is not an admin');
  }

  // Validate products if provided
  if (updateBody.products && updateBody.products.length > 0) {
    const validProducts = await Product.find({ _id: { $in: updateBody.products } });
    if (validProducts.length !== updateBody.products.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'One or more products not found');
    }
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete admin user
 * @param {ObjectId} userId
 * @returns {Promise<void>}
 */
const deleteAdminUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user is admin/superAdmin
  if (!['admin', 'superAdmin'].includes(user.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is not an admin');
  }

  await user.deleteOne();
};

/**
 * Get admin user by ID
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const getAdminUserById = async (userId) => {
  const user = await User.findById(userId).populate('products', 'name type status');
  
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user is admin/superAdmin
  if (!['admin', 'superAdmin'].includes(user.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is not an admin');
  }

  return user;
};

export {
  createAdminUser,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminUserById,
};
