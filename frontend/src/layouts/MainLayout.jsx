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
      window.location.href = data.data.jaccount_logout_url;
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
        position="static"
        elevation={2}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              mr: 4,
              cursor: "pointer",
              fontWeight: "bold",
              color: "white",
              "&:hover": {
                color: alpha(theme.palette.common.white, 0.8),
              },
            }}
            onClick={() => navigate("/")}
          >
            🏆 SJTU Contest
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate("/matches")}
              startIcon={<ContestIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                backgroundColor: isCurrentPage("/matches")
                  ? alpha(theme.palette.common.white, 0.2)
                  : "transparent",
                borderBottom: isCurrentPage("/matches")
                  ? `2px solid ${theme.palette.secondary.light}`
                  : "2px solid transparent",
                "&:hover": {
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
              赛事列表
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/teams")}
              startIcon={<TeamsIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                backgroundColor: isCurrentPage("/teams")
                  ? alpha(theme.palette.common.white, 0.2)
                  : "transparent",
                borderBottom: isCurrentPage("/teams")
                  ? `2px solid ${theme.palette.secondary.light}`
                  : "2px solid transparent",
                "&:hover": {
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
              组队
            </Button>
            {user && user.is_staff && (
              <Button
                color="inherit"
                onClick={() => navigate("/admin")}
                startIcon={<AdminIcon />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  backgroundColor: isCurrentPage("/admin")
                    ? alpha(theme.palette.secondary.main, 0.4)
                    : alpha(theme.palette.secondary.main, 0.2),
                  borderBottom: isCurrentPage("/admin")
                    ? `2px solid ${theme.palette.secondary.light}`
                    : "2px solid transparent",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.3),
                    transform: "translateY(-1px)",
                  },
                  "&:focus": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.7)}`,
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <Chip
                  label="管理员"
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
