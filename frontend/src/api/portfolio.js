import api from "./axios";

export const getPortfolio = () => api.get("/portfolio");
export const addPortfolioItem = (itemData) => api.post("/portfolio", itemData);
export const deletePortfolioItem = (id, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/portfolio/${id}?${query}` : `/portfolio/${id}`;
  return api.delete(url);
};
