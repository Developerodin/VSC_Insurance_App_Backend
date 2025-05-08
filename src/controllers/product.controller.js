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
  const options = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  
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