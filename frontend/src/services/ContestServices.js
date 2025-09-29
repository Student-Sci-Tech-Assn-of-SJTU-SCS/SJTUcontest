import api from "../utils/api";

// 赛事相关API
export const contestAPI = {
  // 获取赛事列表
  getContests: async (page_index, page_size, options = {}) => {
    const response = await api.post("matches/", {
      page_index,
      page_size,
      options,
    });
    return response;
  },

  // 获取赛事详情
  getContestDetail: async (match_id) => {
    const response = await api.get(`matches/${match_id}/`);
    return response;
  },

  // 管理员 API
  // 创建比赛
  createContest: async (contestData) => {
    const response = await api.post("matches/create/", contestData);
    return response;
  },

  // 修改比赛
  updateContest: async (match_id, contestData) => {
    const response = await api.post(`matches/${match_id}/update/`, contestData);
    return response;
  },

  // 删除比赛
  deleteContest: async (match_id) => {
    const response = await api.delete(`matches/${match_id}/delete/`);
    return response;
  },
};
