const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB database with connection state monitoring
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // In development, log the error without killing the process immediately to allow API health monitoring
    if (config.isProduction) {
      process.exit(1);
    }
  }
};

// Monitor MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost / disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Connection re-established');
});

module.exports = connectDB;
