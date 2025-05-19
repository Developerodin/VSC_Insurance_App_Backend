import express from 'express';
import authRoute from './auth.route.js';
import userRoute from './user.route.js';
import docsRoute from './docs.route.js';
import productRoute from './product.route.js';
import leadRoute from './lead.route.js';
import commissionRoute from './commission.route.js';
import bankAccountRoute from './bankAccount.route.js';
import notificationRoute from './notification.route.js';
import transactionRoute from './transaction.route.js';
import adminRoute from './admin.route.js';
import categoryRoute from './category.route.js';
import subcategoryRoute from './subcategory.route.js';
import roleRoute from './role.route.js';
import permissionRoute from './permission.route.js';
import rolePermissionRoute from './rolePermission.route.js';
import * as config from '../../config/config.js';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/products',
    route: productRoute,
  },
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/subcategories',
    route: subcategoryRoute,
  },
  {
    path: '/leads',
    route: leadRoute,
  },
  {
    path: '/commissions',
    route: commissionRoute,
  },
  {
    path: '/bank-accounts',
    route: bankAccountRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/transactions',
    route: transactionRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/roles',
    route: roleRoute,
  },
  {
    path: '/permissions',
    route: permissionRoute,
  },
  {
    path: '/role-permissions',
    route: rolePermissionRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
