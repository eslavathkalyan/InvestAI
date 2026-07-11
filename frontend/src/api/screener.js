import api from "./axios";

export const getScreenerCompanies = () => api.get("/screener");
