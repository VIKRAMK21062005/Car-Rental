// config/db.js - FINAL FIX FOR DEPLOYMENT
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // ✅ Log sanitized URI (hide password)
    const sanitizedUri = uri.replace(/:[^:@]+@/, ':****@');
    console.log(`🔗 Connecting to MongoDB: ${sanitizedUri}`);

    // ✅ FIX: Proper connection options for deployment
    const options = {
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10s
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    const conn = await mongoose.connect(uri, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error(`📋 Error details:`, error);
    
    // ✅ FIX: In production, retry connection instead of crashing
    if (process.env.NODE_ENV === 'production') {
      console.log('⏳ Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      console.error('💡 Make sure MongoDB Atlas network access is configured correctly');
      console.error('💡 Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access');
      process.exit(1);
    }
  }
};

// ✅ Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
  if (process.env.NODE_ENV === 'production') {
    console.log('⏳ Attempting to reconnect...');
    setTimeout(connectDB, 5000);
  }
});

// ✅ Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export default connectDB;