import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().valid('insurance', 'banking').required(),
    category: Joi.string().required(),
    subCategory: Joi.string(),
    description: Joi.string().required(),
    features: Joi.array().items(Joi.string()),
    terms: Joi.array().items(Joi.string()),
    eligibility: Joi.string(),
    commission: Joi.object().keys({
      percentage: Joi.number().min(0).max(100).required(),
      minAmount: Joi.number().min(0),
      maxAmount: Joi.number().min(0),
      bonus: Joi.number().min(0),
    }).required(),
    pricing: Joi.object().keys({
      basePrice: Joi.number().required(),
      currency: Joi.string().default('INR'),
      discounts: Joi.array().items(Joi.object().keys({
        type: Joi.string().valid('percentage', 'fixed'),
        value: Joi.number(),
        validUntil: Joi.date(),
      })),
    }).required(),
    coverage: Joi.string().when('type', {
      is: 'insurance',
      then: Joi.required(),
    }),
    duration: Joi.string().when('type', {
      is: 'insurance',
      then: Joi.required(),
    }),
    interestRate: Joi.number().when('type', {
      is: 'banking',
      then: Joi.required(),
    }),
    loanAmount: Joi.object().keys({
      min: Joi.number(),
      max: Joi.number(),
    }).when('type', {
      is: 'banking',
      then: Joi.required(),
    }),
    tenure: Joi.object().keys({
      min: Joi.number(),
      max: Joi.number(),
    }).when('type', {
      is: 'banking',
      then: Joi.required(),
    }),
    status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
    })),
    images: Joi.array().items(Joi.object().keys({
      url: Joi.string().required(),
      alt: Joi.string(),
    })),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    type: Joi.string().valid('insurance', 'banking'),
    category: Joi.string(),
    status: Joi.string().valid('active', 'inactive', 'draft'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    category: Joi.string(),
    subCategory: Joi.string(),
    description: Joi.string(),
    features: Joi.array().items(Joi.string()),
    terms: Joi.array().items(Joi.string()),
    eligibility: Joi.string(),
    commission: Joi.object().keys({
      percentage: Joi.number().min(0).max(100),
      minAmount: Joi.number().min(0),
      maxAmount: Joi.number().min(0),
      bonus: Joi.number().min(0),
    }),
    pricing: Joi.object().keys({
      basePrice: Joi.number(),
      currency: Joi.string(),
      discounts: Joi.array().items(Joi.object().keys({
        type: Joi.string().valid('percentage', 'fixed'),
        value: Joi.number(),
        validUntil: Joi.date(),
      })),
    }),
    coverage: Joi.string(),
    duration: Joi.string(),
    interestRate: Joi.number(),
    loanAmount: Joi.object().keys({
      min: Joi.number(),
      max: Joi.number(),
    }),
    tenure: Joi.object().keys({
      min: Joi.number(),
      max: Joi.number(),
    }),
    status: Joi.string().valid('active', 'inactive', 'draft'),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
    })),
    images: Joi.array().items(Joi.object().keys({
      url: Joi.string().required(),
      alt: Joi.string(),
    })),
  }),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const getProductCategories = {
  query: Joi.object().keys({
    type: Joi.string().valid('insurance', 'banking'),
  }),
};

const getProductStats = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
};

const searchProducts = {
  query: Joi.object().keys({
    query: Joi.string().required(),
    type: Joi.string().valid('insurance', 'banking'),
    category: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateProductStatus = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('active', 'inactive', 'draft').required(),
  }),
};

const getProductCommission = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

export {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getProductStats,
  searchProducts,
  updateProductStatus,
  getProductCommission,
}; 