import api from "../utils/api";
import {
  saveTokens,
  saveUser,
  clearAuth,
  getRefreshToken,
} from "../utils/auth";

// 用户相关API
export const userAPI = {
  getjAccountAuthURL: async (config = {}) => {
    const response = await api.get("users/jaccount/auth/url/", config);
    return response;
  },

  loginByjAccount: async (code, config = {}) => {
    const response = await api.post("users/jaccount/login/", { code }, config);
    const { access, refresh, user } = response;

    // 保存tokens和用户信息
    saveTokens(access, refresh);
    saveUser(user);

    return response;
  },

  // 登录
  login: async (username, password, config = {}) => {
    const response = await api.post(
      "users/login/",
      { username, password },
      config,
    );
    const { access, refresh, user } = response;

    // 保存tokens和用户信息
    saveTokens(access, refresh);
    saveUser(user);

    return response;
  },

  // 注册
  register: async (username, email, password, config = {}) => {
    const response = await api.post(
      "users/register/",
      {
        username,
        email,
        password,
      },
      config,
    );
    return response;
  },

  // 获取用户资料
  getUserProfile: async (user_id, config = {}) => {
    const response = await api.get(`users/${user_id}/`, config);
    return response;
  },

  // 获取用户参与队伍
  getUserTeams: async (page_index, page_size, config = {}) => {
    const response = await api.post(
      `users/my/teams/`,
      {
        page_index,
        page_size,
      },
      config,
    );
    return response;
  },

  // 更新用户资料
  updateProfile: async (nick_name, experience, advantage, config = {}) => {
    const response = await api.post(
      "users/profile/update/",
      {
        nick_name,
        experience,
        advantage,
      },
      config,
    );
    return response;
  },

  // 登出
  logout: async (config = {}) => {
    const refreshToken = getRefreshToken();
    const response = await api.post(
      "users/logout/",
      { refresh: refreshToken },
      config,
    );
    clearAuth();
    return response;
  },
};
