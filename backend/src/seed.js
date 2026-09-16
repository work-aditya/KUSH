const { connectDB, disconnectDB } = require('./config/db');
const { runBootstrap } = require('./services/bootstrapService');
const logger = require('./config/logger');

const execute = async () => {
  try {
    await connectDB();
    await runBootstrap();
    logger.info('Database seeding completed successfully');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed', { error: error.message });
    process.exit(1);
  }
};

execute();
