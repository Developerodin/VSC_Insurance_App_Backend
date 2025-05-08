
import httpStatus from 'http-status';
import { Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';
const createNotification = catchAsync(async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(httpStatus.CREATED).send(notification);
});

const getNotifications = catchAsync(async (req, res) => {
  const filter = { recipient: req.user.id };
  const options = {};

  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;

  const notifications = await Notification.paginate(filter, options);
  res.send(notifications);
});

const getNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  res.send(notification);
});

const updateNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  Object.assign(notification, req.body);
  await notification.save();
  res.send(notification);
});

const deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await notification.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  notification.status = 'read';
  notification.readAt = new Date();
  await notification.save();
  res.send(notification);
});

const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, status: 'unread' },
    { status: 'read', readAt: new Date() }
  );
  res.status(httpStatus.NO_CONTENT).send();
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user.id,
    status: 'unread',
  });
  res.send({ count });
});

const getNotificationStats = catchAsync(async (req, res) => {
  const stats = await Notification.aggregate([
    { $match: { recipient: req.user.id } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unread: {
          $sum: {
            $cond: [{ $eq: ['$status', 'unread'] }, 1, 0],
          },
        },
      },
    },
  ]);
  res.send(stats);
});

export{
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getNotificationStats,
}; 