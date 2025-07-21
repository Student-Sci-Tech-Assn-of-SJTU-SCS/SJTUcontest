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
