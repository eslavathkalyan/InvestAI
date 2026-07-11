import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./src/models/User.js";

const approveUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const result = await User.updateMany({}, { 
      $set: { 
        isApproved: true,
        role: "admin"
      } 
    });
    console.log(`Updated ${result.modifiedCount} users to be approved admins.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating users:", error);
    process.exit(1);
  }
};

approveUsers();
