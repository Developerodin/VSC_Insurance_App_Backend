import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as productValidation from '../../validations/product.validation.js';
import * as productController from '../../controllers/product.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageProducts'), validate(productValidation.createProduct), productController.createProduct)
  .get(auth('getProducts'), validate(productValidation.getProducts), productController.getProducts);

router
  .route('/:productId')
  .get(auth('getProducts'), validate(productValidation.getProduct), productController.getProduct)
  .patch(auth('manageProducts'), validate(productValidation.updateProduct), productController.updateProduct)
  .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

router
  .route('/categories')
  .get(auth('getProducts'), validate(productValidation.getProductCategories), productController.getProductCategories);

router
  .route('/stats')
  .get(auth('getProducts'), validate(productValidation.getProductStats), productController.getProductStats);

router
  .route('/search')
  .get(auth('getProducts'), validate(productValidation.searchProducts), productController.searchProducts);

router
  .route('/:productId/status')
  .patch(auth('manageProducts'), validate(productValidation.updateProductStatus), productController.updateProductStatus);

router
  .route('/:productId/commission')
  .get(auth('getProducts'), validate(productValidation.getProductCommission), productController.getProductCommission);

// Debug route
router
  .route('/debug')
  .get(auth('getProducts'), productController.debugProducts);

export default router; 