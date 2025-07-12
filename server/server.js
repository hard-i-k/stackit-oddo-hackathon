require('dotenv').config();

// Debug: Check if .env is loaded
console.log('📄 Environment variables loaded:');
console.log('📄 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('📄 PORT:', process.env.PORT);
console.log('📄 NODE_ENV:', process.env.NODE_ENV);

const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('📦 MongoDB URI:', process.env.DATABASE_URL);
  
  // Check if DATABASE_URL is properly set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.error('❌ Please check your .env file and ensure DATABASE_URL is set');
    process.exit(1);
  }
  
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 StackIt API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.disconnect();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer(); 
