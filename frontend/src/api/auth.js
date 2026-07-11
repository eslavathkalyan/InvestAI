import api from "./axios";

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);
export const verifyOtp = (email, otp) => api.post("/auth/verify-otp", { email, otp });
export const resendOtp = (email) => api.post("/auth/resend-otp", { email });
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) =>
  api.put(`/auth/reset-password/${token}`, { password });
export const getMe = () => api.get("/auth/me");
