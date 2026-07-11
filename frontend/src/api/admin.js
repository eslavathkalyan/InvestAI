import api from "./axios";

export const getAllUsers = () => api.get("/admin/users");
export const approveUser = (id) => api.put(`/admin/users/${id}/approve`);
export const blockUser = (id) => api.put(`/admin/users/${id}/block`);
export const unblockUser = (id) => api.put(`/admin/users/${id}/unblock`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAnalytics = () => api.get("/admin/analytics");
export const getUserPortfolio = (id) => api.get(`/admin/users/${id}/portfolio`);
export const getUserReports = (id) => api.get(`/admin/users/${id}/reports`);
