import api from "../utils/api";

// 赛事相关API
export const contestAPI = {
  // 获取赛事列表
  getContests: async (page_index, page_size, options = {}, config = {}) => {
    const response = await api.post("matches/", {
      page_index,
      page_size,
      options,
    }, config);
    return response;
  },

  // 获取赛事详情
  getContestDetail: async (match_id, config = {}) => {
    const response = await api.get(`matches/${match_id}/`, config);
    return response;
  },

  // 管理员 API
  // 创建比赛
  createContest: async (contestData, config = {}) => {
    const response = await api.post("matches/create/", contestData, config);
    return response;
  },

  // 修改比赛
  updateContest: async (match_id, contestData, config = {}) => {
    const response = await api.post(`matches/${match_id}/update/`, contestData, config);
    return response;
  },

  // 删除比赛
  deleteContest: async (match_id, config = {}) => {
    const response = await api.delete(`matches/${match_id}/delete/`, config);
    return response;
  },
};
