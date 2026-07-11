import api from "./axios";

export const getWatchlist = () => api.get("/user/watchlist");
export const addToWatchlist = (company) => api.post("/user/watchlist", { company });
export const removeFromWatchlist = (company) => api.delete(`/user/watchlist/${company}`);
export const updateProfile = (profileData) => api.put("/user/profile", profileData);
