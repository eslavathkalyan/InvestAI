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
      select: false, // excluded from queries unless explicitly requested
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
    // Separate from isVerified on purpose: isVerified proves the
    // person owns the email address they signed up with. isApproved
    // is the admin's own decision about who actually gets to use the
    // platform (e.g. a closed beta / waitlist model) - two different
    // gates, not a duplicate of the same check. The first user ever
    // created is auto-approved as an admin (see authController.js),
    // since otherwise there'd be no way to approve anyone at all.
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
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Runs before every save. Only re-hashes the password if it was
// actually changed, so updating e.g. a user's name doesn't
// accidentally re-hash an already-hashed password.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compares the plain text password from a login request against
// the hashed password stored in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generates a random token, stores its HASH on the user document,
// and returns the plain token so it can be put in an email link.
// We store the hash (not the plain token) so that if the database
// were ever exposed, the tokens inside it couldn't be used directly.
userSchema.methods.generateVerificationToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return plainToken;
};

// Same hashed-token pattern, used for the forgot-password flow.
// Shorter expiry than email verification since a reset link is more
// sensitive if intercepted.
userSchema.methods.generateResetPasswordToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  return plainToken;
};

const User = mongoose.model("User", userSchema);

export default User;
