import httpStatus from 'http-status';
import { Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';

export const createProduct = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(httpStatus.CREATED).send(product);
});

export const getProducts = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    sortBy: req.query.sortBy || 'createdAt',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
  };
  
  // Add all available filters
  if (req.query.name) filter.name = req.query.name;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.categories = { $in: [req.query.category] }; // Fix: categories is array
  if (req.query.categories) filter.categories = { $in: req.query.categories };
  if (req.query.status) filter.status = req.query.status;
  
  // Debug logging
  console.log('Product filter:', JSON.stringify(filter, null, 2));
  console.log('Product options:', JSON.stringify(options, null, 2));
  
  const products = await Product.paginate(filter, options);
  res.send(products);
});

export const getProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
});

export const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  Object.assign(product, req.body);
  await product.save();
  res.send(product);
});

export const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  await product.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

export const getProductCategories = catchAsync(async (req, res) => {
  const categories = await Product.distinct('category', { type: req.query.type });
  res.send(categories);
});

export const getProductStats = catchAsync(async (req, res) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalValue: { $sum: '$pricing.basePrice' },
      },
    },
  ]);
  res.send(stats);
});

export const searchProducts = catchAsync(async (req, res) => {
  const { query } = req.query;
  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ],
  });
  res.send(products);
});

export const updateProductStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  product.status = status;
  await product.save();
  res.send(product);
});

export const getProductCommission = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send({
    commission: product.commission,
  });
});

// Debug endpoint to check products and categories
export const debugProducts = catchAsync(async (req, res) => {
  const products = await Product.find({}).select('name categories type status').limit(5);
  const totalProducts = await Product.countDocuments();
  
  res.send({
    totalProducts,
    sampleProducts: products,
    message: 'Debug: Check if products exist and have categories'
  });
}); 