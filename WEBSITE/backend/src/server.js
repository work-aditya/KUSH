const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { runBootstrap } = require('./services/bootstrapService');
const logger = require('./config/logger');

let server;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Run Database Bootstrap (Admin account & initial pricing seeds)
    await runBootstrap();

    // 3. Listen on Port
    server = app.listen(env.PORT, () => {
      logger.info('CoachKush Backend REST API Running', {
        port: env.PORT,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
      });
    });
  } catch (error) {
    logger.error('Failed to start CoachKush server', { error: error.message });
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Gracefully shutting down...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });

    // Force exit after 10s if connections fail to close
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

startServer();
