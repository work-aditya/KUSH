const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

let isConnected = false;
let memoryServerInstance = null;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const isPlaceholderUri = !env.MONGO_URI || env.MONGO_URI.includes('USERNAME:PASSWORD');

  if (isPlaceholderUri && env.NODE_ENV !== 'production') {
    logger.warn('Placeholder MONGO_URI detected in .env. Initializing in-memory MongoDB instance for local development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(memUri, {
        autoIndex: true,
      });
      isConnected = true;
      logger.info('In-Memory MongoDB Connected Successfully (Dev Mode)', {
        host: conn.connection.host,
        name: conn.connection.name,
      });
      return;
    } catch (memErr) {
      logger.error('Failed to start in-memory MongoDB fallback', { error: memErr.message });
    }
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    isConnected = true;
    logger.info('MongoDB Connected Successfully', {
      host: conn.connection.host,
      name: conn.connection.name,
    });
  } catch (error) {
    logger.error('MongoDB Connection Failed', {
      error: error.message,
    });

    // Fallback to in-memory in development if remote URI failed
    if (env.NODE_ENV !== 'production') {
      logger.warn('Remote MongoDB unreachable. Falling back to local in-memory database for development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri, {
          autoIndex: true,
        });
        isConnected = true;
        logger.info('In-Memory MongoDB Fallback Connected Successfully (Dev Mode)', {
          host: conn.connection.host,
        });
        return;
      } catch (memErr) {
        logger.error('In-memory MongoDB fallback also failed', { error: memErr.message });
      }
    }

    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB Disconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB Runtime Error', { error: err.message });
});

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
    logger.info('MongoDB Connection Closed via Application');
  }
};

module.exports = { connectDB, disconnectDB, mongoose };
