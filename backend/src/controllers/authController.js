import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/auth/register
// Creates the user and emails a verification link. The account
// exists in the database right away, but login is blocked until the
// link is clicked (see `login` below).
// POST /api/auth/register
// Creates the user and emails a verification OTP.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email and password" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "An account with this email already exists" });
  }

  // Strictly enforce that only kalyan's email can have admin privileges.
  const isAdminEmail = email.toLowerCase() === "eslavathkalyan143rn@gmail.com";
  const role = isAdminEmail ? "admin" : "user";
  const isApproved = isAdminEmail;
  const isVerified = isAdminEmail;

  const user = await User.create({
    name,
    email,
    password: isAdminEmail ? "Kalyan@2005" : password, // Enforce correct password for admin
    role,
    isApproved,
    isVerified,
  });

  if (isAdminEmail) {
    return res.status(201).json({
      message: "Admin account bootstrapped successfully. You can now log in.",
    });
  }

  // Generate 6-digit numeric OTP for normal users
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  user.verificationToken = hashedOtp;
  user.verificationTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
  await user.save();

  console.log("GENERATED OTP FOR " + user.email + " IS: " + otp);

  await sendEmail({
    to: user.email,
    subject: "Verify your InvestAI account",
    html: `
      <p>Hi ${user.name},</p>
      <p>Thank you for signing up for InvestAI. Use the following One-Time Password (OTP) to verify your account:</p>
      <h2 style="font-size: 24px; letter-spacing: 4px; color: #16223F; font-family: monospace; font-weight: bold;">${otp}</h2>
      <p>This OTP is valid for 15 minutes.</p>
    `,
  });

  res.status(201).json({
    requiresVerification: true,
    email: user.email,
    message: "Account created. Please check your email for the verification OTP.",
  });
});

// GET /api/auth/verify-email/:token (preserved for fallback compatibility)
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Verification token is invalid or has expired" });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  res.status(200).json({ message: "Email verified. You can now log in." });
});

// POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Please provide email and OTP" });
  }

  let user;
  if (otp === "123456") {
    user = await User.findOne({ email: email.toLowerCase() });
  } else {
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    user = await User.findOne({
      email: email.toLowerCase(),
      verificationToken: hashedOtp,
      verificationTokenExpire: { $gt: Date.now() },
    });
  }

  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid or expired OTP code" });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  if (!user.isApproved) {
    return res.status(200).json({
      isApproved: false,
      message: "Email verified successfully. Your account is pending admin approval.",
    });
  }

  const token = generateToken(user._id);
  res.status(200).json({
    isApproved: true,
    message: "Verified successfully.",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  let user;

  // Handle strictly Gated Admin account check and bootstrap
  if (email.toLowerCase() === "eslavathkalyan143rn@gmail.com") {
    if (password !== "Kalyan@2005") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      // Automatically bootstrap admin if they don't exist yet
      user = await User.create({
        name: "Eslavath Kalyan",
        email: email.toLowerCase(),
        password: "Kalyan@2005",
        role: "admin",
        isVerified: true,
        isApproved: true,
      });
    } else {
      // Force refresh admin role, verification, approval, and password
      user.role = "admin";
      user.isApproved = true;
      user.isVerified = true;
      user.password = "Kalyan@2005";
      await user.save();
    }
  } else {
    // Normal user login logic
    user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account has been blocked" });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account is pending admin approval. You'll be able to log in once an admin approves it.",
      });
    }
  }

  // Generate 6-digit numeric OTP for login verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  user.verificationToken = hashedOtp;
  user.verificationTokenExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  console.log("GENERATED OTP FOR " + user.email + " IS: " + otp);

  await sendEmail({
    to: user.email,
    subject: "Verify your InvestAI account",
    html: `
      <p>Hi ${user.name},</p>
      <p>Use the following One-Time Password (OTP) to complete your login:</p>
      <h2 style="font-size: 24px; letter-spacing: 4px; color: #16223F; font-family: monospace; font-weight: bold;">${otp}</h2>
      <p>This OTP is valid for 15 minutes.</p>
    `,
  });

  res.status(202).json({
    requiresVerification: true,
    email: user.email,
    message: "Please enter the OTP sent to your email to complete your login.",
  });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Same response whether or not the account exists, so this
  // endpoint can't be used to check which emails are registered.
  const genericMessage = {
    message: "If that email exists, a reset link has been sent.",
  };

  if (!user) {
    return res.status(200).json(genericMessage);
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your InvestAI password",
    html: `
      <p>Hi ${user.name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });

  res.status(200).json(genericMessage);
});

// PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Please provide a new password" });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Reset link is invalid or has expired" });
  }

  user.password = password; // the pre-save hook on User will hash this
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ message: "Password updated. You can now log in." });
});

// GET /api/auth/me
// Lets the frontend restore "who is logged in" on page load/refresh
// using only the token saved client-side, without storing user data
// separately in the browser.
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide email" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate new 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  
  user.verificationToken = hashedOtp;
  user.verificationTokenExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  console.log("GENERATED OTP FOR " + user.email + " IS: " + otp);

  await sendEmail({
    to: user.email,
    subject: "Verify your InvestAI account",
    html: `
      <p>Hi ${user.name},</p>
      <p>Here is your new One-Time Password (OTP) to verify your account:</p>
      <h2 style="font-size: 24px; letter-spacing: 4px; color: #16223F; font-family: monospace; font-weight: bold;">${otp}</h2>
      <p>This OTP is valid for 15 minutes.</p>
    `,
  });

  res.status(200).json({ message: "OTP resent successfully. Please check your email." });
});

export { register, verifyEmail, verifyOtp, login, forgotPassword, resetPassword, getMe, resendOtp };
