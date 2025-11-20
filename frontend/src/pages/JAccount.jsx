import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userAPI } from "../services/UserServices";

const JAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 解析URL参数
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const error = params.get("error");

        if (error) {
          throw new Error(`${error}`);
        }

        // 发送授权码到后端API
        await userAPI.loginByjAccount(code);

        // 重定向到原始请求页面或首页
        const redirectPath = localStorage.getItem("pre_auth_path") || "/";
        localStorage.removeItem("pre_auth_path");
        localStorage.setItem("login_type", "jAccount");
        navigate(redirectPath);
      } catch (error) {
        console.error("jAccount登录失败:", error);
        navigate("/login", { state: { error: error.message } });
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="callback-container">
      <h2>正在处理jAccount登录...</h2>
      <h3>首次登录耗时较长，请稍后...</h3>
      <div className="spinner"></div>
    </div>
  );
};

export default JAccount;
