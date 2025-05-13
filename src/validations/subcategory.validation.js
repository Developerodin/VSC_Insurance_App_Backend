import Joi from 'joi';

const createSubcategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    categoryId: Joi.string().required(),
    isActive: Joi.boolean(),
  }),
};

const getSubcategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    categoryId: Joi.string(),
    isActive: Joi.boolean(),
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
      name: Joi.string(),
      description: Joi.string(),
      categoryId: Joi.string(),
      isActive: Joi.boolean(),
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