// CSRF Token 处理工具
// 这个文件展示了如何在前端正确处理Django的CSRF防护

/**
 * 从Cookie中获取CSRF令牌
 * @param {string} name - Cookie名称
 * @returns {string|null} CSRF令牌值
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * 获取CSRF令牌
 * @returns {string} CSRF令牌
 */
function getCSRFToken() {
  return getCookie("csrftoken");
}

/**
 * 从后端API获取CSRF令牌
 * @returns {Promise<string>} CSRF令牌
 */
async function fetchCSRFToken() {
  try {
    const response = await fetch("http://localhost:8000/api/csrf/", {
      method: "GET",
      credentials: "include", // 重要：包含Cookie
    });

    if (response.ok) {
      const data = await response.json();
      return data.csrfToken;
    } else {
      throw new Error("Failed to fetch CSRF token");
    }
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
}

/**
 * 配置fetch请求以包含CSRF令牌
 * @param {string} url - 请求URL
 * @param {object} options - fetch选项
 * @returns {Promise<Response>} fetch响应
 */
async function csrfFetch(url, options = {}) {
  // 确保有CSRF令牌
  let csrfToken = getCSRFToken();

  // 如果没有找到令牌，尝试从API获取
  if (!csrfToken) {
    try {
      csrfToken = await fetchCSRFToken();
    } catch (error) {
      console.error("Failed to get CSRF token:", error);
      throw error;
    }
  }

  // 设置默认选项
  const defaultOptions = {
    credentials: "include", // 包含Cookie
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken, // 在请求头中包含CSRF令牌
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
}

/**
 * 示例：用户登录
 */
async function loginUser(username, password) {
  try {
    const response = await csrfFetch("http://localhost:8000/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Login successful:", data);
      return data;
    } else {
      const errorData = await response.json();
      console.error("Login failed:", errorData);
      throw new Error("Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * 示例：用户注册
 */
async function registerUser(userData) {
  try {
    const response = await csrfFetch(
      "http://localhost:8000/api/auth/register/",
      {
        method: "POST",
        body: JSON.stringify(userData),
      },
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Registration successful:", data);
      return data;
    } else {
      const errorData = await response.json();
      console.error("Registration failed:", errorData);
      throw new Error("Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * 示例：获取用户数据
 */
async function getUserData() {
  try {
    const response = await csrfFetch("http://localhost:8000/api/auth/user/", {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("User data:", data);
      return data;
    } else {
      throw new Error("Failed to fetch user data");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// 使用axios的示例配置
// 如果你使用axios而不是fetch，可以使用以下配置：

/*
import axios from 'axios';

// 配置axios实例
const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    withCredentials: true, // 包含Cookie
});

// 请求拦截器 - 自动添加CSRF令牌
api.interceptors.request.use(
    async (config) => {
        let csrfToken = getCookie('csrftoken');
        
        // 如果没有令牌，先获取一个
        if (!csrfToken) {
            try {
                const response = await axios.get('http://localhost:8000/api/csrf/', {
                    withCredentials: true
                });
                csrfToken = response.data.csrfToken;
            } catch (error) {
                console.error('Failed to get CSRF token:', error);
            }
        }
        
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理CSRF错误
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403 && error.response?.data?.error === 'CSRF verification failed') {
            // CSRF令牌无效，重新获取
            try {
                await fetchCSRFToken();
                // 重试原请求
                return api.request(error.config);
            } catch (retryError) {
                console.error('Failed to retry request after CSRF error:', retryError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
*/

// 导出工具函数
export {
  getCookie,
  getCSRFToken,
  fetchCSRFToken,
  csrfFetch,
  loginUser,
  registerUser,
  getUserData,
};
