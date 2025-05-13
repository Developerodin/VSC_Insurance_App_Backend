import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as subcategoryValidation from '../../validations/subcategory.validation.js';
import * as subcategoryController from '../../controllers/subcategory.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageSubcategories'), validate(subcategoryValidation.createSubcategory), subcategoryController.createSubcategory)
  .get(auth('getSubcategories'), validate(subcategoryValidation.getSubcategories), subcategoryController.getSubcategories);

router
  .route('/:subcategoryId')
  .get(auth('getSubcategories'), validate(subcategoryValidation.getSubcategory), subcategoryController.getSubcategory)
  .patch(auth('manageSubcategories'), validate(subcategoryValidation.updateSubcategory), subcategoryController.updateSubcategory)
  .delete(auth('manageSubcategories'), validate(subcategoryValidation.deleteSubcategory), subcategoryController.deleteSubcategory);

router
  .route('/:subcategoryId/status')
  .patch(auth('manageSubcategories'), validate(subcategoryValidation.updateSubcategoryStatus), subcategoryController.updateSubcategoryStatus);

router
  .route('/category/:categoryId')
  .get(auth('getSubcategories'), validate(subcategoryValidation.getSubcategoriesByCategory), subcategoryController.getSubcategoriesByCategory);

export default router; 