process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_at_least_32_characters_long_12345';
process.env.MONGO_URI = 'mongodb://localhost:27017/coachkush_test';
process.env.ADMIN_USERNAME = 'admin_test';
process.env.ADMIN_PASSWORD = 'AdminTestPassword123!';
process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_1234567890';
process.env.RAZORPAY_KEY_SECRET = 'mock_secret_key_1234567890';
process.env.RAZORPAY_WEBHOOK_SECRET = 'mock_webhook_secret_12345';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const setupTestDB = () => {
  beforeAll(async () => {

    try {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
    } catch (err) {
      console.warn('MongoMemoryServer initialization fallback to local test DB:', err.message);
      const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/coachkush_test';
      await mongoose.connect(uri);
    }
  });

  afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
};

module.exports = { setupTestDB };
