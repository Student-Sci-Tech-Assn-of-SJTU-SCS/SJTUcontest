import api from "../utils/api";

// 队伍相关 API
export const teamAPI = {
  // 获取正在招募中的队伍
  getRecruitingTeams: async (page_index, page_size, config = {}) => {
    const response = await api.post("teams/", { page_index, page_size }, config);
    return response;
  },

  // 获取某个比赛正在招募中的队伍
  getRecruitingTeamsOfContest: async (match_id, page_index, page_size, config = {}) => {
    const response = await api.post(`matches/${match_id}/teams/`, {
      page_index,
      page_size,
    }, config);
    return response;
  },

  // 获取队伍详情
  getTeamDetail: async (team_id, config = {}) => {
    const response = await api.get(`teams/${team_id}/`, config);
    return response;
  },

  // 获取队伍邀请码
  getTeamInvitationCode: async (team_id, config = {}) => {
    const response = await api.get(`teams/${team_id}/invitation/`, config);
    return response;
  },

  // 加入队伍
  joinTeam: async (team_id, invitation_code, config = {}) => {
    const response = await api.post(`teams/${team_id}/join/`, {
      invitation_code,
    }, config);
    return response;
  },

  // 创建队伍
  createTeam: async (teamData, config = {}) => {
    const response = await api.post("teams/create/", teamData, config);
    return response;
  },

  // 更新队伍信息
  updateTeam: async (
    team_id,
    name,
    introduction,
    expected_members,
    recruitment_deadline,
    config = {},
  ) => {
    const response = await api.post(`teams/${team_id}/update/`, {
      name,
      introduction,
      expected_members,
      recruitment_deadline,
    }, config);
    return response;
  },

  // 退出队伍
  leaveTeam: async (team_id, config = {}) => {
    const response = await api.post(`teams/${team_id}/quit/`, {}, config);
    return response;
  },

  // 删除队伍
  deleteTeam: async (team_id, config = {}) => {
    const response = await api.delete(`teams/${team_id}/delete/`, config);
    return response;
  },
};
