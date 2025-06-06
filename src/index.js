import mongoose from 'mongoose';
import app from './app.js';
import * as config from './config/config.js';
import logger from './config/logger.js';
import { testS3Connection } from './utils/s3Connection.js';

let server;

const startServer = async () => {
  try {
    // Test S3 connection
   

    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    // Start server
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
    const s3Connected = await testS3Connection();
    if (!s3Connected) {
      logger.error('Failed to connect to AWS S3. Server startup aborted.');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Error during server startup:', error);
    process.exit(1);
  }
};

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
