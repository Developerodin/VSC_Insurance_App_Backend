import httpStatus from 'http-status';
import { Subcategory } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.create(req.body);
  res.status(httpStatus.CREATED).send(subcategory);
});

export const getSubcategories = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  
  const subcategories = await Subcategory.paginate(filter);
  res.send(subcategories);
});

export const getSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.subcategoryId);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }
  res.send(subcategory);
});

export const updateSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.subcategoryId);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }
  Object.assign(subcategory, req.body);
  await subcategory.save();
  res.send(subcategory);
});

export const deleteSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.subcategoryId);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }
  await subcategory.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

export const updateSubcategoryStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const subcategory = await Subcategory.findById(req.params.subcategoryId);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }
  subcategory.status = status;
  await subcategory.save();
  res.send(subcategory);
});

export const getSubcategoriesByCategory = catchAsync(async (req, res) => {
  const subcategories = await Subcategory.find({ category: req.params.categoryId });
  res.send(subcategories);
}); 