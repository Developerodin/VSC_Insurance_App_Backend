import Joi from 'joi';

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    description: Joi.string().required(),
    type: Joi.string().valid('insurance', 'banking', 'capital market', 'it sector', 'project funding').required(),
    status: Joi.string().valid('active', 'inactive').default('active'),
    metadata: Joi.object().pattern(Joi.string(), Joi.any()),
  }),
};

const getCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    type: Joi.string().valid('insurance', 'banking', 'capital market', 'it sector', 'project funding'),
    status: Joi.string().valid('active', 'inactive'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      description: Joi.string(),
      type: Joi.string().valid('insurance', 'banking', 'capital market', 'it sector', 'project funding'),
      status: Joi.string().valid('active', 'inactive'),
      metadata: Joi.object().pattern(Joi.string(), Joi.any()),
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
};

export {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
}; 