import api from "../utils/api";
import axios from "axios";
import { getAccessToken } from "../utils/auth"; // 如果需要加 token，也可以统一处理

// 单独使用一个 axios 实例，请求 mock 接口
const mockApi = axios.create({
  baseURL: "http://127.0.0.1:4523/m1/6636447-6344331-default/api/",
  timeout: 10000,
});

// 如果需要带 token，可添加拦截器（可选）
mockApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTeamDetail = async (teamId) => {
  try {
    const response = await mockApi.get(`teams/${teamId}/`);
    return response.data.data;
  } catch (error) {
    console.error("获取队伍详情失败", error);
    throw error;
  }
};

// 队伍相关 API
export const teamAPI = {
  // 获取正在招募中的队伍
  getRecruitingTeams: async (page_index, page_size) => {
    const response = await api.post("teams/", { page_index, page_size });
    return response;
  },

  // 获取某个比赛正在招募中的队伍
  getRecruitingTeamsOfContest: async (match_id, page_index, page_size) => {
    const response = await api.post(`matches/${match_id}/teams/`, {
      page_index,
      page_size,
    });
    return response;
  },

  // 获取队伍详情
  getTeamDetail: async (team_id) => {
    const response = await api.get(`teams/${team_id}/`);
    return response;
  },

  // 获取队伍邀请码
  getTeamInvitationCode: async (team_id) => {
    const response = await api.get(`teams/${team_id}/invitation/`);
    return response;
  },

  // 加入队伍
  joinTeam: async (team_id, invitation_code) => {
    const response = await api.post(`teams/${team_id}/join/`, {
      invitation_code,
    });
    return response;
  },

  // 创建队伍
  createTeam: async (
    contest,
    name,
    introduction,
    expected_members,
    recuitment_deadline,
  ) => {
    const response = await api.post("teams/create/", {
      contest,
      name,
      introduction,
      expected_members,
      recuitment_deadline,
    });
    return response;
  },

  // 更新队伍信息
  updateTeam: async (
    team_id,
    name,
    introduction,
    expected_members,
    recuitment_deadline,
  ) => {
    const response = await api.post(`teams/${team_id}/update/`, {
      name,
      introduction,
      expected_members,
      recuitment_deadline,
    });
    return response;
  },

  // 退出队伍
  leaveTeam: async (team_id) => {
    const response = await api.post(`teams/${team_id}/quit/`);
    return response;
  },

  // 删除队伍
  deleteTeam: async (team_id) => {
    const response = await api.post(`teams/${team_id}/delete/`);
    return response;
  },
};
