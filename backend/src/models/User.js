import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, 
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    watchlist: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true } 
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; 

  return plainToken;
};

userSchema.methods.generateResetPasswordToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; 

  return plainToken;
};

userSchema.post("save", async function (doc) {
  try {
    const { query: pgQuery } = await import("../config/postgres.js");
    await pgQuery(
      `INSERT INTO users (id, name, email, role, is_approved, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (id) DO UPDATE SET 
       name = EXCLUDED.name, 
       email = EXCLUDED.email, 
       role = EXCLUDED.role, 
       is_approved = EXCLUDED.is_approved, 
       is_verified = EXCLUDED.is_verified`,
      [
        doc._id.toString(),
        doc.name,
        doc.email,
        doc.role,
        doc.isApproved || false,
        doc.isVerified || false
      ]
    );
  } catch (err) {
    console.error("🐘 PostgreSQL user sync error:", err.message);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
