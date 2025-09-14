import React from "react";
import {
  Typography,
  Button,
  Box,
  Container,
  alpha,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EmojiEvents as ContestIcon,
  Groups as TeamsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import NewsCarousel from "../components/NewsCarousel";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const theme = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", py: 0 }}>
      {/* 英雄区域 */}
      <Box
        sx={{
          py: 8,
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              gutterBottom
              fontWeight="bold"
              sx={{ mb: 2, color: "#424242" }}
            >
              上海交通大学计算机学院 科创赛事平台
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                mb: 5,
                maxWidth: "600px",
                mx: "auto",
                mt: 5,
              }}
            >
              寻找比赛、组建团队、劳动学时 All in One
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 4,
                mt: 4,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ContestIcon />}
                onClick={() => navigate("/matches")}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  boxShadow: theme.shadows[8],
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[12],
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                浏览赛事列表
              </Button>
              {user.id ? (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<TeamsIcon />}
                    onClick={() => navigate("/teams")}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "1.1rem",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    寻找团队
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate(`/users/${user.id}`)}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "1.1rem",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.secondary.main,
                          0.1,
                        ),
                        borderColor: theme.palette.secondary.main,
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    个人主页
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    boxShadow: theme.shadows[4],
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[8],
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  立即登录
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 新闻轮播区域 */}
      <Box sx={{ backgroundColor: "white", py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="bold"
              color="primary"
            >
              最新资讯
            </Typography>
            <Typography variant="body1" color="text.secondary">
              掌握最新竞赛动态和平台更新
            </Typography>
          </Box>
          <Box sx={{ mx: "auto", width: "fit-content" }}>
            <NewsCarousel />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
