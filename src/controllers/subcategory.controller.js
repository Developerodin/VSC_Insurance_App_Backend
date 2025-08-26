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
  if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
  
  const subcategories = await Subcategory.paginate(filter, {
    populate: 'category',
    sortBy: req.query.sortBy || 'createdAt:desc',
  });
  res.send(subcategories);
});

export const getSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.subcategoryId).populate('category');
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

  // Handle nested objects update
  if (req.body.commission) {
    subcategory.commission = { ...subcategory.commission, ...req.body.commission };
    delete req.body.commission;
  }
  if (req.body.pricing) {
    subcategory.pricing = { ...subcategory.pricing, ...req.body.pricing };
    delete req.body.pricing;
  }
  if (req.body.loanAmount) {
    subcategory.loanAmount = { ...subcategory.loanAmount, ...req.body.loanAmount };
    delete req.body.loanAmount;
  }
  if (req.body.tenure) {
    subcategory.tenure = { ...subcategory.tenure, ...req.body.tenure };
    delete req.body.tenure;
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
  await subcategory.deleteOne();
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
  const filter = { category: req.params.categoryId };
  if (req.query.status) filter.status = req.query.status;
  
  const subcategories = await Subcategory.find(filter)
    .populate('category')
    .sort({ createdAt: -1 });
  res.send(subcategories);
});

export const addSubcategoryDocument = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.subcategoryId);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }

  const { name, url, type } = req.body;
  subcategory.documents.push({ name, url, type });
  await subcategory.save();
  res.send(subcategory);
}); 