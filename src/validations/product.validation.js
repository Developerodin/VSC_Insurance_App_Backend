import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    type: Joi.string().valid('insurance', 'banking').required(),
    categories: Joi.array().items(Joi.string().custom(objectId)).required(),
    description: Joi.string().required(),
    features: Joi.array().items(Joi.string()),
    terms: Joi.array().items(Joi.string()),
    eligibility: Joi.string(),
    commission: Joi.object().keys({
      percentage: Joi.number().min(0).max(100).required(),
      minAmount: Joi.number().min(0).default(0),
      maxAmount: Joi.number().min(0),
      bonus: Joi.number().min(0).default(0),
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
    metadata: Joi.object().pattern(Joi.string(), Joi.any()),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    type: Joi.string().valid('insurance', 'banking'),
    categories: Joi.array().items(Joi.string().custom(objectId)),
    status: Joi.string().valid('active', 'inactive', 'draft'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      type: Joi.string().valid('insurance', 'banking'),
      categories: Joi.array().items(Joi.string().custom(objectId)),
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
      metadata: Joi.object().pattern(Joi.string(), Joi.any()),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
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
    categories: Joi.array().items(Joi.string().custom(objectId)),
    status: Joi.string().valid('active', 'inactive', 'draft'),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateProductStatus = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('active', 'inactive', 'draft').required(),
  }),
};

const getProductCommission = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
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