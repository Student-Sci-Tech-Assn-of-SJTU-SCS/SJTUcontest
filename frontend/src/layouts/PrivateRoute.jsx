import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const location = useLocation();

  // 检查用户是否已登录
  const isAuthenticated = () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return false;

      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  };

  if (!isAuthenticated()) {
    // 保存用户尝试访问的页面，登录后可以重定向回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
