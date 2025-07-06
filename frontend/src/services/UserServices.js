import api from "../utils/api";
import {
  saveTokens,
  saveUser,
  clearAuth,
  getRefreshToken,
} from "../utils/auth";

// 用户相关API
export const userAPI = {
  // 登录
  login: async (credentials) => {
    try {
      const response = await api.post("users/login/", credentials);
      const { access, refresh, user } = response.data;

      // 保存tokens和用户信息
      saveTokens(access, refresh);
      saveUser(user);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 注册
  register: async (userData) => {
    try {
      const response = await api.post("users/register/", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取用户资料
  getUserProfile: async (user_id) => {
    try {
      const response = await api.get(`users/${user_id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新用户资料
  updateProfile: async (userData) => {
    try {
      const response = await api.post("users/profile/update/", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 登出
  logout: async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post("users/logout/", { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // 无论API调用是否成功，都清除本地认证数据
      clearAuth();
    }
  },
};
