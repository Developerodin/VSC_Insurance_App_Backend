import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as notificationValidation from '../../validations/notification.validation.js';
import * as notificationController from '../../controllers/notification.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageNotifications'), validate(notificationValidation.createNotification), notificationController.createNotification)
  .get(auth('getNotifications'), validate(notificationValidation.getNotifications), notificationController.getNotifications);

router
  .route('/:notificationId')
  .get(auth('getNotifications'), validate(notificationValidation.getNotification), notificationController.getNotification)
  .patch(auth('manageNotifications'), validate(notificationValidation.updateNotification), notificationController.updateNotification)
  .delete(auth('manageNotifications'), validate(notificationValidation.deleteNotification), notificationController.deleteNotification);

router
  .route('/:notificationId/read')
  .post(auth('manageNotifications'), validate(notificationValidation.markAsRead), notificationController.markAsRead);

router
  .route('/read-all')
  .post(auth('manageNotifications'), validate(notificationValidation.markAllAsRead), notificationController.markAllAsRead);

router
  .route('/unread/count')
  .get(auth('getNotifications'), validate(notificationValidation.getUnreadCount), notificationController.getUnreadCount);

router
  .route('/stats')
  .get(auth('getNotifications'), validate(notificationValidation.getNotificationStats), notificationController.getNotificationStats);

export default router; 