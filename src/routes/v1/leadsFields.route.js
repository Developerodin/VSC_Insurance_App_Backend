import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as leadsFieldsController from '../../controllers/leadsFields.controller.js';

const router = express.Router();

router
  .route('/')
  .post(
    leadsFieldsController.createLeadsFields
  )
  .get(
    leadsFieldsController.getLeadsFields
  );

router
  .route('/product/:productId/category/:categoryId')
  .get(
    leadsFieldsController.getLeadsFieldsByProductCategory
  );

router
  .route('/:leadsFieldsId')
  .get(
    leadsFieldsController.getLeadsFieldsById
  )
  .patch(
    leadsFieldsController.updateLeadsFields
  )
  .delete(
    leadsFieldsController.deleteLeadsFields
  );

// Field management routes
router
  .route('/:leadsFieldsId/fields')
  .post(
    leadsFieldsController.addField
  );

router
  .route('/:leadsFieldsId/fields/reorder')
  .patch(
    leadsFieldsController.reorderFields
  );

router
  .route('/:leadsFieldsId/fields/:fieldIndex')
  .patch(
    leadsFieldsController.updateField
  )
  .delete(
    leadsFieldsController.removeField
  );

router
  .route('/:leadsFieldsId/fields/name/:fieldName')
  .delete(
    leadsFieldsController.removeFieldByName
  );

export default router; 