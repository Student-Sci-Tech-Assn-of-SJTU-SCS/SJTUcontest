import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  EmojiEvents as ContestIcon,
  Groups as TeamsIcon,
} from "@mui/icons-material";
import { userAPI } from "../services/UserServices";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  const open = Boolean(anchorEl);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate(`/users/${user.id}`);
    handleUserMenuClose();
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
      const data = await userAPI.logout();
      const loginType = localStorage.getItem("login_type");
      if (loginType === "jAccount") {
        window.location.href = data.data.jaccount_logout_url;
      }
    } catch (error) {
      console.error("登出失败:", error);
      // 即使请求失败，也清除本地状态
      localStorage.removeItem("user");
      setUser(null);
    }
    handleUserMenuClose();
  };

  // 判断当前页面是否匹配路径
  const isCurrentPage = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* 顶部导航栏 */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.92)} 0%, 
            ${alpha(theme.palette.primary.dark, 0.95)} 50%,
            ${alpha(theme.palette.primary.main, 0.92)} 100%)`,
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          boxShadow: `
            0 4px 30px ${alpha(theme.palette.primary.dark, 0.12)},
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
          `,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            right: "-100%",
            height: "200%",
            background: `linear-gradient(115deg,
              transparent 20%,
              ${alpha(theme.palette.secondary.light, 0.05)} 40%,
              ${alpha(theme.palette.secondary.light, 0.08)} 50%,
              ${alpha(theme.palette.secondary.light, 0.05)} 60%,
              transparent 80%
            )`,
            animation: "shimmer 8s ease-in-out infinite",
            "@keyframes shimmer": {
              "0%": { transform: "translateX(-100%) rotate(35deg)" },
              "100%": { transform: "translateX(100%) rotate(35deg)" },
            },
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg,
              transparent 0%,
              ${alpha(theme.palette.secondary.light, 0.4)} 20%,
              ${alpha(theme.palette.secondary.light, 0.6)} 50%,
              ${alpha(theme.palette.secondary.light, 0.4)} 80%,
              transparent 100%
            )`,
            opacity: 0.5,
          },
        }}
      >
        {/* 装饰性网格背景 */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                ${alpha(theme.palette.common.white, 0.01)} 0px,
                transparent 1px,
                transparent 20px,
                ${alpha(theme.palette.common.white, 0.01)} 21px
              ),
              repeating-linear-gradient(
                0deg,
                ${alpha(theme.palette.common.white, 0.01)} 0px,
                transparent 1px,
                transparent 20px,
                ${alpha(theme.palette.common.white, 0.01)} 21px
              )
            `,
            pointerEvents: "none",
          }}
        />

        {/* 顶部光晕效果 */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "100%",
            background: `radial-gradient(ellipse at top center,
              ${alpha(theme.palette.secondary.light, 0.12)} 0%,
              transparent 50%
            )`,
            pointerEvents: "none",
            opacity: 0.8,
          }}
        />

        {/* 左侧装饰光效 */}
        <Box
          sx={{
            position: "absolute",
            left: -100,
            top: "50%",
            transform: "translateY(-50%)",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle,
              ${alpha(theme.palette.secondary.main, 0.15)} 0%,
              transparent 70%
            )`,
            filter: "blur(40px)",
            pointerEvents: "none",
            animation: "glow 4s ease-in-out infinite alternate",
            "@keyframes glow": {
              "0%": { opacity: 0.4 },
              "100%": { opacity: 0.8 },
            },
          }}
        />

        {/* 右侧装饰光效 */}
        <Box
          sx={{
            position: "absolute",
            right: -100,
            top: "50%",
            transform: "translateY(-50%)",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle,
              ${alpha(theme.palette.primary.light, 0.15)} 0%,
              transparent 70%
            )`,
            filter: "blur(40px)",
            pointerEvents: "none",
            animation: "glow 4s ease-in-out infinite alternate-reverse",
          }}
        />
        <Toolbar
          sx={{
            py: 1,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              ml: 4,
              mr: 4,
              cursor: "pointer",
              fontWeight: "bold",
              color: "white",
              textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`,
              display: "flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                color: alpha(theme.palette.common.white, 0.9),
                transform: "scale(1.02)",
              },
              transition: "all 0.2s ease",
            }}
            onClick={() => navigate("/")}
          >
            科创平台
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mr: 2,
              px: 2,
              py: 0.5,
              borderRadius: 10,
              background: alpha(theme.palette.common.white, 0.05),
              backdropFilter: "blur(10px)",
            }}
          >
            <Button
              color="inherit"
              onClick={() => navigate("/matches")}
              startIcon={<ContestIcon />}
              sx={{
                borderRadius: 8,
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                color: isCurrentPage("/matches")
                  ? theme.palette.common.white
                  : alpha(theme.palette.common.white, 0.9),
                backgroundColor: isCurrentPage("/matches")
                  ? alpha(theme.palette.common.white, 0.15)
                  : "transparent",
                border: isCurrentPage("/matches")
                  ? `1px solid ${alpha(theme.palette.common.white, 0.3)}`
                  : "1px solid transparent",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: isCurrentPage("/matches") ? 0 : "-100%",
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(90deg, 
                    transparent, 
                    ${alpha(theme.palette.common.white, 0.1)}, 
                    transparent)`,
                  transition: "left 0.3s ease",
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                  "&::before": {
                    left: 0,
                  },
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: "none",
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.5)}`,
                },
                transition: "all 0.3s ease",
              }}
            >
              赛事列表
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/teams")}
              startIcon={<TeamsIcon />}
              sx={{
                borderRadius: 8,
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                color: isCurrentPage("/teams")
                  ? theme.palette.common.white
                  : alpha(theme.palette.common.white, 0.9),
                backgroundColor: isCurrentPage("/teams")
                  ? alpha(theme.palette.common.white, 0.15)
                  : "transparent",
                border: isCurrentPage("/teams")
                  ? `1px solid ${alpha(theme.palette.common.white, 0.3)}`
                  : "1px solid transparent",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: isCurrentPage("/teams") ? 0 : "-100%",
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(90deg, 
                    transparent, 
                    ${alpha(theme.palette.common.white, 0.1)}, 
                    transparent)`,
                  transition: "left 0.3s ease",
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                  "&::before": {
                    left: 0,
                  },
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: "none",
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.5)}`,
                },
                transition: "all 0.3s ease",
              }}
            >
              组队
            </Button>
            {user && user.is_staff && (
              <Button
                color="inherit"
                onClick={() => navigate("/admin")}
                startIcon={
                  <AdminIcon sx={{ color: theme.palette.warning.light }} />
                }
                sx={{
                  borderRadius: 8,
                  px: 2.5,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  color: theme.palette.warning.light,
                  backgroundColor: isCurrentPage("/admin")
                    ? alpha(theme.palette.warning.light, 0.2)
                    : alpha(theme.palette.warning.light, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.light, 0.3)}`,
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: isCurrentPage("/admin") ? 0 : "-100%",
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(90deg, 
                      transparent, 
                      ${alpha(theme.palette.warning.light, 0.15)}, 
                      transparent)`,
                    transition: "left 0.3s ease",
                  },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.warning.light, 0.25),
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                    "&::before": {
                      left: 0,
                    },
                  },
                  "&:focus": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.warning.main, 0.5)}`,
                  },
                  transition: "all 0.3s ease",
                }}
              >
                管理员面板
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleUserMenuOpen}
                sx={{
                  borderColor: alpha(theme.palette.common.white, 0.5),
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    transform: "translateY(-1px)",
                  },
                  "&:focus": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.5)}`,
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                你好，{user.nick_name}！
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    borderRadius: 2,
                    mt: 1,
                    minWidth: 180,
                  },
                }}
              >
                <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
                  <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
                  个人主页
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ py: 1.5, color: "error.main" }}
                >
                  <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                  退出登录
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/login")}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[8],
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: theme.shadows[4],
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: `${theme.shadows[4]}, 0 0 0 2px ${alpha(theme.palette.secondary.main, 0.5)}`,
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              立即登录
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* 主要内容区域 */}
      <Box
        component="main"
        sx={{
          flex: 1,
          backgroundColor: "#fafafa",
          minHeight: "calc(100vh - 120px)",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            background: `radial-gradient(ellipse at center, 
              ${alpha(theme.palette.primary.light, 0.08)} 0%, 
              transparent 70%)`,
          }}
        >
          <Outlet />
        </Container>
      </Box>

      {/* 页脚 */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: "auto",
          background: `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`,
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="grey.500">
              © {new Date().getFullYear()} SJTU Contest Platform. All rights
              reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
