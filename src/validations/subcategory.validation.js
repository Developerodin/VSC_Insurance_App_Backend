import Joi from 'joi';

const createSubcategory = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    features: Joi.array().items(Joi.string()),
    terms: Joi.array().items(Joi.string()),
    eligibility: Joi.string(),
    commission: Joi.object({
      percentage: Joi.number().required().min(0).max(100),
      minAmount: Joi.number().min(0).default(0),
      maxAmount: Joi.number(),
      bonus: Joi.number().min(0).default(0),
    }),
    pricing: Joi.object({
      basePrice: Joi.number().required(),
      currency: Joi.string().default('INR'),
      discounts: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('percentage', 'fixed'),
          value: Joi.number(),
          validUntil: Joi.date(),
        })
      ),
    }),
    coverage: Joi.string(),
    duration: Joi.string(),
    interestRate: Joi.number(),
    loanAmount: Joi.object({
      min: Joi.number(),
      max: Joi.number(),
    }),
    tenure: Joi.object({
      min: Joi.number(),
      max: Joi.number(),
    }),
    status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
    documents: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        url: Joi.string(),
        type: Joi.string(),
      })
    ),
    image: Joi.string().trim(),
    imageKey: Joi.string().trim(),
    metadata: Joi.object().pattern(Joi.string(), Joi.any()),
  }),
};

const getSubcategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    category: Joi.string(),
    status: Joi.string().valid('active', 'inactive', 'draft'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSubcategory = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().required(),
  }),
};

const updateSubcategory = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      description: Joi.string(),
      category: Joi.string(),
      features: Joi.array().items(Joi.string()),
      terms: Joi.array().items(Joi.string()),
      eligibility: Joi.string(),
      commission: Joi.object({
        percentage: Joi.number().min(0).max(100),
        minAmount: Joi.number().min(0),
        maxAmount: Joi.number(),
        bonus: Joi.number().min(0),
      }),
      pricing: Joi.object({
        basePrice: Joi.number(),
        currency: Joi.string(),
        discounts: Joi.array().items(
          Joi.object({
            type: Joi.string().valid('percentage', 'fixed'),
            value: Joi.number(),
            validUntil: Joi.date(),
          })
        ),
      }),
      coverage: Joi.string(),
      duration: Joi.string(),
      interestRate: Joi.number(),
      loanAmount: Joi.object({
        min: Joi.number(),
        max: Joi.number(),
      }),
      tenure: Joi.object({
        min: Joi.number(),
        max: Joi.number(),
      }),
      status: Joi.string().valid('active', 'inactive', 'draft'),
      documents: Joi.array().items(
        Joi.object({
          name: Joi.string(),
          url: Joi.string(),
          type: Joi.string(),
        })
      ),
      image: Joi.string().trim(),
      imageKey: Joi.string().trim(),
      metadata: Joi.object().pattern(Joi.string(), Joi.any()),
    })
    .min(1),
};

const deleteSubcategory = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().required(),
  }),
};

const updateSubcategoryStatus = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('active', 'inactive', 'draft').required(),
  }),
};

const getSubcategoriesByCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    status: Joi.string().valid('active', 'inactive', 'draft'),
  }),
};

export {
  createSubcategory,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
  updateSubcategoryStatus,
  getSubcategoriesByCategory,
};