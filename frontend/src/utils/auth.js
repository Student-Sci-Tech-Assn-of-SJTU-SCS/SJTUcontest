// 认证相关的工具函数

/**
 * 获取access token
 */
export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

/**
 * 获取refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

/**
 * 保存tokens到localStorage
 */
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

/**
 * 清除所有认证相关的数据
 */
export const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const user = localStorage.getItem("user");
  return !!(accessToken && user);
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * 保存用户信息
 */
export const saveUser = (userInfo) => {
  localStorage.setItem("user", JSON.stringify(userInfo));
};

/**
 * 登出函数
 */
export const logout = () => {
  clearAuth();
  window.location.href = "/login";
};
