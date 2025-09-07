import api from "../utils/api";

export const newsAPI = {
  getNews: async () => {
    const response = await api.get("news/get/");
    return response;
  },
  CreateNews: async (data) => {
    const response = await api.post("news/create/", data);
    return response;
  },
};