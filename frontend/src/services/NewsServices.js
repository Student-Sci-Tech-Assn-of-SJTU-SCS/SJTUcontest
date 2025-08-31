import api from "../utils/api";

export const newsAPI = {
  getNews: async () => {
    const response = await api.get("news/get/");
    return response;
  },
};