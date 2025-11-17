import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, logout } from "./auth.js";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  timeout: 10000,
});

// 请求拦截器 - 自动添加access token到请求头
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    // console.log("当前请求的token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理401错误和token刷新
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 如果收到401错误且不是重试请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // 没有refresh token，直接跳转到登录页
        logout();
        return Promise.reject(error);
      }

      try {
        // 尝试使用refresh token获取新的access token
        const refreshResponse = await axios.post(
          "http://localhost:8000/api/users/token/refresh/",
          {
            refresh: refreshToken,
          },
        );

        const newAccessToken = refreshResponse.data.access;
        const newRefreshToken = refreshResponse.data.refresh;

        // 保存新的tokens
        saveTokens(newAccessToken, newRefreshToken);

        // 更新原始请求的Authorization头并重新发送
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // refresh token也过期了，清除所有token并跳转到登录页
        console.error("Token refresh failed:", refreshError);
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
