import api from "./axios";

export const createResearch = (company) => api.post("/research", { company });
export const getMyReports = () => api.get("/research");
export const getReportById = (id) => api.get(`/research/${id}`);
export const shareReport = (id, isShared) => api.put(`/research/${id}/share`, { isShared });
export const getSharedReports = () => api.get("/research/community/shared");
