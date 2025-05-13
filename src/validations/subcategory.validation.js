import Joi from 'joi';

const createSubcategory = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    status: Joi.string().valid('active', 'inactive').default('active'),
    metadata: Joi.object().pattern(Joi.string(), Joi.any()),
  }),
};

const getSubcategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    category: Joi.string(),
    status: Joi.string().valid('active', 'inactive'),
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
      status: Joi.string().valid('active', 'inactive'),
      metadata: Joi.object().pattern(Joi.string(), Joi.any()),
    })
    .min(1),
};

const deleteSubcategory = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().required(),
  }),
};

export {
  createSubcategory,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
}; 