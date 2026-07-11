import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  const user = await User.findOne({ email: "eslavathkalyan143rn@gmail.com" });
  console.log("Admin User record:", user);
  await mongoose.disconnect();
};

run().catch(console.error);
