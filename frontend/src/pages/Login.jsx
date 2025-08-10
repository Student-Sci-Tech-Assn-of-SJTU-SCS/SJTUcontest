import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  Alert,
  Container,
  CircularProgress,
  Divider,
  IconButton,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";
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
      // 调用 UserServices 中的 login 方法
      await userAPI.login(formData.username, formData.password);

      // 登录成功，跳转到用户原本想要访问的页面
      navigate(from);
    } catch (err) {
      setError(
        "登录失败，请检查用户名和密码：" +
          (err.response.data.detail || "未知错误"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
          `,
        },
      }}
    >
      {/* 回到首页按钮 */}
      <IconButton
        onClick={() => navigate("/")}
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
          zIndex: 1000,
        }}
      >
        <HomeIcon />
      </IconButton>

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={12}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              登录
            </Typography>
            <Typography variant="body1" color="text.secondary">
              欢迎来到 SJTU 竞赛平台
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="用户名"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              margin="normal"
              required
              disabled={loading}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="密码"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required
              disabled={loading}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 1,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                },
                fontSize: "1.1rem",
                fontWeight: "600",
              }}
              disabled={loading}
              startIcon={
                loading && <CircularProgress size={20} color="inherit" />
              }
            >
              {loading ? "登录中..." : "登录"}
            </Button>

            {error && (
              <Typography
                variant="body2"
                sx={{
                  color: "#d32f2f",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  mt: 1,
                  mb: 2,
                }}
              >
                {error}
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              或
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #c9151e 0%, #a31419 100%)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #b01318 0%, #8b1015 100%)",
              },
              fontSize: "1rem",
              fontWeight: "600",
            }}
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
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
