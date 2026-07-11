import api from "./axios";

export const getWalletBalance = () => api.get("/user/wallet");
export const addWalletBalance = (amount) => api.post("/user/wallet", { amount });
export const withdrawWalletBalance = (amount, bankAccount, ifsc) =>
  api.post("/user/wallet/withdraw", { amount, bankAccount, ifsc });
