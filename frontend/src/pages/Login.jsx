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
import axios from "axios";

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

    const controller = new AbortController();

    try {
      // 调用 UserServices 中的 login 方法
      await userAPI.login(formData.username, formData.password, {
        signal: controller.signal,
      });

      // 登录成功，跳转到用户原本想要访问的页面
      navigate(from);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError(
        "登录失败，请检查用户名和密码：" +
          (err.response.data.detail || "未知错误"),
      );
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 200, 150, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 220, 180, 0.15) 0%, transparent 50%)
          `,
        },
        animation: "backgroundShift 20s ease infinite",
        "@keyframes backgroundShift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        "@keyframes float": {
          "0%, 100%": {
            transform: "translateY(0) translateX(0) rotate(0deg)",
          },
          "33%": {
            transform: "translateY(-30px) translateX(20px) rotate(120deg)",
          },
          "66%": {
            transform: "translateY(20px) translateX(-20px) rotate(240deg)",
          },
        },
        "@keyframes floatReverse": {
          "0%, 100%": {
            transform: "translateY(0) translateX(0) rotate(360deg)",
          },
          "33%": {
            transform: "translateY(30px) translateX(-30px) rotate(240deg)",
          },
          "66%": {
            transform: "translateY(-20px) translateX(30px) rotate(120deg)",
          },
        },
        "@keyframes slideUp": {
          "0%": {
            transform: "translateY(100vh) translateX(0)",
            opacity: 0,
          },
          "10%": {
            opacity: 0.5,
          },
          "90%": {
            opacity: 0.5,
          },
          "100%": {
            transform: "translateY(-100vh) translateX(100px)",
            opacity: 0,
          },
        },
        "@keyframes slideDown": {
          "0%": {
            transform: "translateY(-100vh) translateX(0)",
            opacity: 0,
          },
          "10%": {
            opacity: 0.3,
          },
          "90%": {
            opacity: 0.3,
          },
          "100%": {
            transform: "translateY(100vh) translateX(-100px)",
            opacity: 0,
          },
        },
        "@keyframes pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: 0.6,
          },
          "50%": {
            transform: "scale(1.2)",
            opacity: 0.8,
          },
        },
        "@keyframes drift": {
          "0%": {
            transform: "translateX(-100px) translateY(0) rotate(0deg)",
          },
          "25%": {
            transform: "translateX(30px) translateY(-50px) rotate(90deg)",
          },
          "50%": {
            transform: "translateX(-20px) translateY(30px) rotate(180deg)",
          },
          "75%": {
            transform: "translateX(60px) translateY(-20px) rotate(270deg)",
          },
          "100%": {
            transform: "translateX(-100px) translateY(0) rotate(360deg)",
          },
        },
        backgroundSize: "200% 200%",
      }}
    >
      {/* 动画圆球 */}
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: [40, 60, 80, 100, 50, 70, 90, 45, 35, 55, 65, 75][i],
            height: [40, 60, 80, 100, 50, 70, 90, 45, 35, 55, 65, 75][i],
            borderRadius: "50%",
            background: [
              "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.1) 70%)",
              "radial-gradient(circle at 40% 40%, rgba(255, 200, 150, 0.7) 0%, rgba(255, 200, 150, 0) 70%)",
              "radial-gradient(circle at 35% 35%, rgba(252, 182, 159, 0.6) 0%, rgba(252, 182, 159, 0) 70%)",
              "radial-gradient(circle at 45% 45%, rgba(255, 236, 210, 0.8) 0%, rgba(255, 236, 210, 0) 70%)",
              "radial-gradient(circle at 30% 30%, rgba(255, 220, 180, 0.7) 0%, rgba(255, 220, 180, 0) 70%)",
              "radial-gradient(circle at 40% 40%, rgba(255, 245, 235, 0.9) 0%, rgba(255, 245, 235, 0) 70%)",
              "radial-gradient(circle at 35% 35%, rgba(255, 195, 160, 0.6) 0%, rgba(255, 195, 160, 0) 70%)",
              "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 70%)",
              "radial-gradient(circle at 40% 40%, rgba(255, 210, 170, 0.7) 0%, rgba(255, 210, 170, 0) 70%)",
              "radial-gradient(circle at 35% 35%, rgba(255, 225, 190, 0.8) 0%, rgba(255, 225, 190, 0) 70%)",
              "radial-gradient(circle at 45% 45%, rgba(255, 240, 220, 0.6) 0%, rgba(255, 240, 220, 0) 70%)",
              "radial-gradient(circle at 30% 30%, rgba(255, 205, 165, 0.75) 0%, rgba(255, 205, 165, 0) 70%)",
            ][i],
            boxShadow: [
              "0 4px 15px rgba(255, 255, 255, 0.3), inset 0 -2px 5px rgba(255, 255, 255, 0.5)",
              "0 4px 20px rgba(255, 200, 150, 0.3), inset 0 -2px 5px rgba(255, 200, 150, 0.4)",
              "0 4px 25px rgba(252, 182, 159, 0.3), inset 0 -2px 5px rgba(252, 182, 159, 0.4)",
              "0 4px 30px rgba(255, 236, 210, 0.3), inset 0 -2px 5px rgba(255, 236, 210, 0.4)",
              "0 4px 18px rgba(255, 220, 180, 0.3), inset 0 -2px 5px rgba(255, 220, 180, 0.4)",
              "0 4px 22px rgba(255, 245, 235, 0.3), inset 0 -2px 5px rgba(255, 245, 235, 0.4)",
              "0 4px 28px rgba(255, 195, 160, 0.3), inset 0 -2px 5px rgba(255, 195, 160, 0.4)",
              "0 4px 16px rgba(255, 255, 255, 0.4), inset 0 -2px 5px rgba(255, 255, 255, 0.5)",
              "0 4px 12px rgba(255, 210, 170, 0.3), inset 0 -2px 5px rgba(255, 210, 170, 0.4)",
              "0 4px 18px rgba(255, 225, 190, 0.3), inset 0 -2px 5px rgba(255, 225, 190, 0.4)",
              "0 4px 20px rgba(255, 240, 220, 0.3), inset 0 -2px 5px rgba(255, 240, 220, 0.4)",
              "0 4px 15px rgba(255, 205, 165, 0.3), inset 0 -2px 5px rgba(255, 205, 165, 0.4)",
            ][i],
            left: [
              "5%",
              "85%",
              "75%",
              "15%",
              "90%",
              "10%",
              "50%",
              "65%",
              "25%",
              "45%",
              "70%",
              "30%",
            ][i],
            top: [
              "10%",
              "70%",
              "20%",
              "80%",
              "40%",
              "50%",
              "90%",
              "5%",
              "60%",
              "30%",
              "85%",
              "15%",
            ][i],
            animation: [
              "float 15s ease-in-out infinite",
              "floatReverse 18s ease-in-out infinite",
              "float 20s ease-in-out infinite 2s",
              "floatReverse 16s ease-in-out infinite 1s",
              "slideUp 25s linear infinite",
              "drift 22s ease-in-out infinite 3s",
              "slideDown 30s linear infinite 2s",
              "floatReverse 17s ease-in-out infinite 4s",
              "pulse 3s ease-in-out infinite",
              "drift 28s ease-in-out infinite 5s",
              "float 19s ease-in-out infinite 3s",
              "pulse 4s ease-in-out infinite 2s",
            ][i],
            zIndex: 1,
            filter: "blur(0.5px)",
            opacity: [
              0.9, 0.7, 0.6, 0.8, 0.5, 0.9, 0.4, 0.95, 0.6, 0.7, 0.5, 0.8,
            ][i],
            "&::after": {
              content: '""',
              position: "absolute",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.6)",
              filter: "blur(8px)",
              top: "10%",
              left: "20%",
            },
          }}
        />
      ))}

      {/* 回到首页按钮 */}
      <Button
        onClick={() => navigate("/")}
        startIcon={<HomeIcon />}
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          color: "#ff6b6b",
          border: "2px solid rgba(255, 107, 107, 0.2)",
          borderRadius: 3,
          px: 2.5,
          py: 1,
          fontSize: "0.95rem",
          fontWeight: 500,
          textTransform: "none",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            borderColor: "#ff9999",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(255, 107, 107, 0.15)",
          },
          transition: "all 0.3s ease",
          zIndex: 1000,
        }}
      >
        回到首页
      </Button>

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            width: "100%",
            maxWidth: 460,
            margin: "0 auto",
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 182, 193, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow:
                "0 25px 70px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 182, 193, 0.2)",
            },
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: "2.2rem",
                background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                mb: 1.5,
              }}
            >
              欢迎回来
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#6c757d",
                fontSize: "1.05rem",
                fontWeight: 400,
              }}
            >
              登录 SCS 科创平台
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
                  borderRadius: 3,
                  backgroundColor: "#fafbfc",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#f6f8fa",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "#fff",
                    boxShadow: "0 0 0 3px rgba(255, 107, 107, 0.1)",
                  },
                  "& fieldset": {
                    borderColor: "#e1e4e8",
                    borderWidth: "1.5px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#ff9999",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ff6b6b",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.95rem",
                  "&.Mui-focused": {
                    color: "#ff6b6b",
                  },
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
                  borderRadius: 3,
                  backgroundColor: "#fafbfc",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#f6f8fa",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "#fff",
                    boxShadow: "0 0 0 3px rgba(255, 107, 107, 0.1)",
                  },
                  "& fieldset": {
                    borderColor: "#e1e4e8",
                    borderWidth: "1.5px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#ff9999",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ff6b6b",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.95rem",
                  "&.Mui-focused": {
                    color: "#ff6b6b",
                  },
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
                py: 1.8,
                borderRadius: 3,
                background: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                boxShadow: "0 4px 15px rgba(255, 107, 107, 0.2)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #ff5252 0%, #ff6b6b 100%)",
                  boxShadow: "0 6px 20px rgba(255, 107, 107, 0.3)",
                  transform: "translateY(-2px)",
                },
                fontSize: "1.05rem",
                fontWeight: "600",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                textTransform: "none",
              }}
              disabled={loading}
              startIcon={
                loading && <CircularProgress size={20} color="inherit" />
              }
            >
              {loading ? "登录中..." : "登录账户"}
            </Button>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 107, 107, 0.05)",
                  color: "#d32f2f",
                  border: "1px solid rgba(211, 47, 47, 0.2)",
                  "& .MuiAlert-icon": {
                    color: "#ff6b6b",
                  },
                }}
              >
                {error}
              </Alert>
            )}
          </Box>

          <Divider
            sx={{
              mb: 3,
              mt: 2,
              "&::before, &::after": {
                borderColor: "rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#9ca3af",
                fontSize: "0.875rem",
                px: 2,
              }}
            >
              或者
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              py: 1.8,
              borderRadius: 3,
              borderColor: "#e11d48",
              borderWidth: "2px",
              color: "#e11d48",
              backgroundColor: "transparent",
              fontSize: "1.05rem",
              fontWeight: "600",
              letterSpacing: "0.5px",
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#e11d48",
                borderWidth: "2px",
                backgroundColor: "#e11d48",
                color: "white",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(225, 29, 72, 0.2)",
              },
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
            使用 jAccount 快速登录
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
