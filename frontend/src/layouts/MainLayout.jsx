import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
  IconButton,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { userAPI } from "../services/UserServices";

const MainLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
      <AppBar sx={{ display: "flex", flexDirection: "row" }} position="static">
        {
          /* <img src="https://pic.rmb.bdstatic.com/bjh/news/7082e39bdd27dbabeed39d95f807893c.png" alt="SJTU Contest" width={60} /> */
          // 放网站logo
        }
        <Box
          sx={{
            width: 60,
            bgcolor: "#1670c6",
            borderRight: "1px #0d47a1 solid",
            borderBottom: "1px #0d47a1 solid",
          }}
        />
        <Toolbar sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ mr: 4, cursor: "pointer", alignSelf: "center" }}
            onClick={() => navigate("/")}
          >
            SJTU Contest
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate("/matches")}
            sx={{ mr: 2 }}
          >
            赛事列表
          </Button>
          <Button color="inherit" onClick={() => navigate("/teams")}>
            组队
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {user ? (
            <>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(`/users/${user.id}`)}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  "&:hover": {
                    borderColor: "white",
                  },
                }}
              >
                你好，{user.nick_name}！
              </Button>
              <IconButton aria-label="Logout" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate("/login")}
              sx={{
                borderColor: "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                  borderColor: "white",
                },
              }}
            >
              登录
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* 主要内容区域 */}
      <Box component="main" sx={{ flex: 1 /*, py: 4*/ }}>
        {/* <Container maxWidth="lg"> */}
        <Outlet />
        {/* </Container>   */}
      </Box>

      {/* 页脚 */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} SJTU Contest. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
