import httpStatus from 'http-status';
import { Category } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createCategory = catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(httpStatus.CREATED).send(category);
});

export const getCategories = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.name) filter.name = req.query.name;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  
  const options = {
    sortBy: req.query.sortBy || 'createdAt',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
  };
  
  const categories = await Category.paginate(filter, options);
  res.send(categories);
});

export const getCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

export const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  Object.assign(category, req.body);
  await category.save();
  res.send(category);
});

export const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  await category.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

export const updateCategoryStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  category.status = status;
  await category.save();
  res.send(category);
}); 