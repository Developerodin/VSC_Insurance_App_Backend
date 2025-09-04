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

export const getProductPieChartStats = catchAsync(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  
  if (totalProducts === 0) {
    return res.send({
      totalProducts: 0,
      pieChartData: [],
      message: 'No products found'
    });
  }

  // Get product distribution by type
  const typeDistribution = await Product.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get product distribution by status
  const statusDistribution = await Product.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get top 5 categories by product count
  const categoryDistribution = await Product.aggregate([
    { $unwind: '$categories' },
    {
      $group: {
        _id: '$categories',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: '$categoryInfo'
    },
    {
      $project: {
        categoryId: '$_id',
        categoryName: '$categoryInfo.name',
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Calculate percentages for type distribution
  const typePieData = typeDistribution.map(item => ({
    name: item._id,
    value: item.count,
    percentage: Math.round((item.count / totalProducts) * 100 * 100) / 100
  }));

  // Calculate percentages for status distribution
  const statusPieData = statusDistribution.map(item => ({
    name: item._id,
    value: item.count,
    percentage: Math.round((item.count / totalProducts) * 100 * 100) / 100
  }));

  // Calculate percentages for category distribution
  const categoryPieData = categoryDistribution.map(item => ({
    name: item.categoryName,
    categoryId: item.categoryId,
    value: item.count,
    percentage: Math.round((item.count / totalProducts) * 100 * 100) / 100
  }));

  // Get additional statistics
  const additionalStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        averagePrice: { $avg: '$pricing.basePrice' },
        minPrice: { $min: '$pricing.basePrice' },
        maxPrice: { $max: '$pricing.basePrice' },
        totalValue: { $sum: '$pricing.basePrice' }
      }
    }
  ]);

  const response = {
    totalProducts,
    pieChartData: {
      byType: {
        title: 'Products by Type',
        data: typePieData,
        total: typeDistribution.reduce((sum, item) => sum + item.count, 0)
      },
      byStatus: {
        title: 'Products by Status',
        data: statusPieData,
        total: statusDistribution.reduce((sum, item) => sum + item.count, 0)
      },
      byCategory: {
        title: 'Top 5 Categories',
        data: categoryPieData,
        total: categoryDistribution.reduce((sum, item) => sum + item.count, 0)
      }
    },
    additionalStats: additionalStats[0] || {
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      totalValue: 0
    },
    generatedAt: new Date()
  };

  res.send(response);
}); 