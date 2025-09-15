import api from "../utils/api";

export const newsAPI = {
  getNews: async () => {
    const response = await api.get("news/all/");
    return response;
  },
  createNews: async (data) => {
    const response = await api.post("news/create/", data);
    return response;
  },
  deleteNews: async (newsId) => {
    const response = await api.delete(`news/delete/${newsId}/`);
    return response;
  },
  getAllContestsForNews: async () => {
    const response = await api.get("news/contests/");
    return response;
  },
};
