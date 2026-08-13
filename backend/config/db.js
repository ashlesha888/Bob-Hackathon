const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!connStr) {
      console.warn('⚠️ WARNING: MONGO_URI is missing in .env file. Database operations will fail until MONGO_URI is set.');
      return;
    }

    console.log('⏳ Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.warn('ℹ️ Server will continue running in offline/in-memory mode for health check and API endpoints.');
  }
};

module.exports = connectDB;
