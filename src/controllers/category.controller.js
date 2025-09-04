import httpStatus from 'http-status';
import { Category } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createCategory = catchAsync(async (req, res) => {
  // Check if a category with the same name already exists
  const existingCategory = await Category.findOne({ name: req.body.name });
  
  if (existingCategory) {
    const category = await Category.create(req.body);
    res.status(httpStatus.CREATED).send({
      ...category.toJSON(),
      warning: `A category with name "${req.body.name}" already exists (ID: ${existingCategory._id})`
    });
  } else {
    const category = await Category.create(req.body);
    res.status(httpStatus.CREATED).send(category);
  }
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
  // Transform the response to ensure timestamps are included
  const transformedResults = {
    ...categories,
    results: categories.results.map(category => ({
      ...category.toJSON(),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))
  };
  res.send(transformedResults);
});

export const getCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  // Transform the response to ensure timestamps are included
  const transformedCategory = {
    ...category.toJSON(),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
  res.send(transformedCategory);
});

export const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  Object.assign(category, req.body);
  await category.save();
  // Transform the response to ensure timestamps are included
  const transformedCategory = {
    ...category.toJSON(),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
  res.send(transformedCategory);
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
  // Transform the response to ensure timestamps are included
  const transformedCategory = {
    ...category.toJSON(),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
  res.send(transformedCategory);
});

export const getTopCategories = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const type = req.query.type; // Optional filter by category type
  
  // Build filter for categories
  const categoryFilter = { status: 'active' };
  if (type) {
    categoryFilter.type = type;
  }
  
  // First, try to get categories that have leads
  const categoriesWithLeads = await Category.aggregate([
    { $match: categoryFilter },
    {
      $lookup: {
        from: 'leads',
        localField: '_id',
        foreignField: 'category',
        as: 'leads'
      }
    },
    {
      $addFields: {
        leadCount: { $size: '$leads' },
        totalLeads: { $size: '$leads' }
      }
    },
    {
      $match: {
        leadCount: { $gt: 0 } // Only categories with leads
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        type: 1,
        status: 1,
        image: 1,
        imageKey: 1,
        leadCount: 1,
        totalLeads: 1,
        createdAt: 1,
        updatedAt: 1
      }
    },
    {
      $sort: { leadCount: -1, createdAt: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  // If we have enough categories with leads, return them
  if (categoriesWithLeads.length >= limit) {
    return res.send({
      categories: categoriesWithLeads,
      totalCategories: categoriesWithLeads.length,
      hasLeads: true,
      message: `Top ${categoriesWithLeads.length} categories with leads`
    });
  }
  
  // If we don't have enough categories with leads, get additional categories
  const additionalNeeded = limit - categoriesWithLeads.length;
  
  // Get categories that don't have leads
  const categoriesWithoutLeads = await Category.aggregate([
    { $match: categoryFilter },
    {
      $lookup: {
        from: 'leads',
        localField: '_id',
        foreignField: 'category',
        as: 'leads'
      }
    },
    {
      $addFields: {
        leadCount: { $size: '$leads' },
        totalLeads: { $size: '$leads' }
      }
    },
    {
      $match: {
        leadCount: 0 // Only categories without leads
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        type: 1,
        status: 1,
        image: 1,
        imageKey: 1,
        leadCount: 1,
        totalLeads: 1,
        createdAt: 1,
        updatedAt: 1
      }
    },
    {
      $sort: { createdAt: -1 } // Sort by creation date for consistent ordering
    },
    {
      $limit: additionalNeeded
    }
  ]);
  
  // Combine categories with leads and without leads
  const allCategories = [...categoriesWithLeads, ...categoriesWithoutLeads];
  
  // If we still don't have enough, get any remaining categories
  if (allCategories.length < limit) {
    const remainingNeeded = limit - allCategories.length;
    const usedIds = allCategories.map(cat => cat._id);
    
    const remainingCategories = await Category.aggregate([
      { 
        $match: { 
          ...categoryFilter,
          _id: { $nin: usedIds }
        } 
      },
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'category',
          as: 'leads'
        }
      },
      {
        $addFields: {
          leadCount: { $size: '$leads' },
          totalLeads: { $size: '$leads' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          type: 1,
          status: 1,
          image: 1,
          imageKey: 1,
          leadCount: 1,
          totalLeads: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: remainingNeeded
      }
    ]);
    
    allCategories.push(...remainingCategories);
  }
  
  // Calculate summary statistics
  const totalLeads = allCategories.reduce((sum, cat) => sum + cat.leadCount, 0);
  const categoriesWithLeadCount = allCategories.filter(cat => cat.leadCount > 0).length;
  
  const response = {
    categories: allCategories.slice(0, limit), // Ensure we only return the requested limit
    totalCategories: allCategories.length,
    hasLeads: categoriesWithLeadCount > 0,
    summary: {
      totalLeads: totalLeads,
      categoriesWithLeads: categoriesWithLeadCount,
      categoriesWithoutLeads: allCategories.length - categoriesWithLeadCount,
      averageLeadsPerCategory: allCategories.length > 0 ? 
        Math.round((totalLeads / allCategories.length) * 100) / 100 : 0
    },
    generatedAt: new Date(),
    message: categoriesWithLeadCount > 0 
      ? `Top ${Math.min(limit, allCategories.length)} categories (${categoriesWithLeadCount} with leads)`
      : `Top ${Math.min(limit, allCategories.length)} categories (no leads generated yet)`
  };
  
  res.send(response);
}); 