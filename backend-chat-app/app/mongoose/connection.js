import mongoose from 'mongoose';

let reconnectTimeout = null;

const connectMongoose = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Mongoose connected');
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  } catch (err) {
    console.error('❌ Mongoose connection error:', err);
    process.exit(1);
  }
};

// Reconnect on error
mongoose.connection.on('disconnected', () => {
  console.error('❌ Mongoose disconnected! Trying to reconnect in 5 seconds...');
  if (!reconnectTimeout) {
    reconnectTimeout = setTimeout(() => {
      connectMongoose();
    }, 5000);
  }
});

export default connectMongoose;
