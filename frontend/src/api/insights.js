import api from "./axios";

export const getMarketInsights = () => api.get("/insights");
