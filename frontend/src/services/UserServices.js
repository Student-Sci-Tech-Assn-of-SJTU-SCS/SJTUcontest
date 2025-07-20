import api from "../utils/api";
import {
  saveTokens,
  saveUser,
  clearAuth,
  getRefreshToken,
} from "../utils/auth";

// 用户相关API
export const userAPI = {
  getjAccountAuthURL: async () => {
    const response = await api.get("users/jaccount/auth/url/");
    return response;
  },

  loginByjAccount: async (code) => {
    const response = await api.post("users/jaccount/login/", { code });
    const { access, refresh, user } = response;

    // 保存tokens和用户信息
    saveTokens(access, refresh);
    saveUser(user);
  },

  // 登录
  login: async (username, password) => {
    const response = await api.post("users/login/", { username, password });
    const { access, refresh, user } = response;

    // 保存tokens和用户信息
    saveTokens(access, refresh);
    saveUser(user);
  },

  // 注册
  register: async (username, email, password) => {
    const response = await api.post("users/register/", {
      username,
      email,
      password,
    });
    return response;
  },

  // 获取用户资料
  getUserProfile: async (user_id) => {
    const response = await api.get(`users/${user_id}/`);
    return response;
  },

  // 更新用户资料
  updateProfile: async (nick_name, experience, advantage) => {
    const response = await api.post("users/profile/update/", {
      nick_name,
      experience,
      advantage,
    });
    return response;
  },

  // 登出
  logout: async () => {
    const refreshToken = getRefreshToken();
    const response = await api.post("users/logout/", { refresh: refreshToken });
    clearAuth();
    return response;
  },
};
