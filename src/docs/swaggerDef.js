import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../../package.json');
import * as config from '../config/config.js';

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'VSC Insurance App API Documentation',
    version: pkg.version,
    description: 'API documentation for VSC Insurance App - A comprehensive platform for insurance and banking product sales management',
    license: {
      name: 'MIT',
      url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
  tags: [
    {
      name: 'auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'users',
      description: 'User operations',
    },
    {
      name: 'products',
      description: 'Insurance and banking product operations',
    },
    {
      name: 'leads',
      description: 'Lead management operations',
    },
    {
      name: 'commissions',
      description: 'Commission management operations',
    },
    {
      name: 'bank-accounts',
      description: 'Bank account management operations',
    },
    {
      name: 'notifications',
      description: 'Notification management operations',
    },
    {
      name: 'transactions',
      description: 'Transaction management operations',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export default swaggerDefinition;

