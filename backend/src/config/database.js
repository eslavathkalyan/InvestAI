import mongoose from "mongoose";

// Connects to MongoDB using the URI from environment variables.
// If the connection fails, the app can't do anything useful, so we
// log the reason and exit instead of running in a half-broken state.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
