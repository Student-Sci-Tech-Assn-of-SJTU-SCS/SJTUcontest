import api from "../utils/api";

// 赛事相关API
export const contestAPI = {
  // 获取赛事列表
  getContests: async (params = {}) => {
    try {
      const response = await api.post("matches/", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取赛事详情
  getContestDetail: async (match_id) => {
    try {
      const response = await api.get(`matches/${match_id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // （管理员）创建赛事
};
