import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import "../css/Login.css";
import { userAPI } from "../services/UserServices";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 获取用户原本想要访问的页面
  const from = location.state?.from?.pathname || "/";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 清除错误信息
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 简单的用户名密码验证
      if (
        formData.username === "username" &&
        formData.password === "password"
      ) {
        // 模拟登录成功，保存用户信息到 localStorage
        const userInfo = {
          id: "1",
          username: formData.username,
          nick_name: "nick name",
        };

        localStorage.setItem("user", JSON.stringify(userInfo));

        // 跳转到首页
        navigate("/");
      } else {
        setError("用户名或密码错误");
      }
    } catch (err) {
      setError("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>登录</h2>
          <p>欢迎来到 SJTU 竞赛平台</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="请输入用户名"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-hint">测试账号: username / password</p>
        </div>

        <Button
          variant="contained"
          onClick={async () => {
            const data = await userAPI.getjAccountAuthURL();
            // console.log("jAccount login URL response:", body);
            const auth_url = data.data.auth_url;
            // console.log("jAccount auth URL:", auth_url);
            localStorage.setItem("pre_auth_path", from);
            window.location.href = auth_url;
          }}
        >
          使用 jAccount 登录
        </Button>
      </div>
    </div>
  );
};

export default Login;
