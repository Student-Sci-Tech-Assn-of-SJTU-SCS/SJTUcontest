import api from "../utils/api";

export const newsAPI = {
  getNews: async (config = {}) => {
    const response = await api.get("news/all/", config);
    return response;
  },
  createNews: async (data, config = {}) => {
    const response = await api.post("news/create/", data, config);
    return response;
  },
  deleteNews: async (newsId, config = {}) => {
    const response = await api.delete(`news/delete/${newsId}/`, config);
    return response;
  },
  getAllContestsForNews: async (config = {}) => {
    const response = await api.get("news/contests/", config);
    return response;
  },
};
