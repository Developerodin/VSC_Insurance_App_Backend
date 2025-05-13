import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as categoryValidation from '../../validations/category.validation.js';
import * as categoryController from '../../controllers/category.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageCategories'), validate(categoryValidation.createCategory), categoryController.createCategory)
  .get(auth('getCategories'), validate(categoryValidation.getCategories), categoryController.getCategories);

router
  .route('/:categoryId')
  .get(auth('getCategories'), validate(categoryValidation.getCategory), categoryController.getCategory)
  .patch(auth('manageCategories'), validate(categoryValidation.updateCategory), categoryController.updateCategory)
  .delete(auth('manageCategories'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

router
  .route('/:categoryId/status')
  .patch(auth('manageCategories'), validate(categoryValidation.updateCategoryStatus), categoryController.updateCategoryStatus);

export default router; 