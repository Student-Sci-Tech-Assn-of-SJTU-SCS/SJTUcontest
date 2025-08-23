import React from "react";
import { 
  Typography, 
  Button, 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EmojiEvents as ContestIcon,
  Groups as TeamsIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon,
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

  const features = [
    {
      icon: <ContestIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "丰富赛事",
      description: "快速找到加分加素拓加劳动学时的比赛"
    },
    {
      icon: <TeamsIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: "团队协作",
      description: "找到志同道合的队友"
    },
    {
      icon: <TrendingIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      title: "能力提升",
      description: "在竞赛中锻炼技能，提升综合素质"
    }
  ];

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
            <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ mb: 2, color: "#424242" }}>
              上海交通大学计算机学院科创赛事平台
            </Typography>
            <Typography variant="h5" sx={{ color: "text.secondary", mb: 5, maxWidth: "600px", mx: "auto", mt: 5 }}>
              寻找比赛、组建团队、劳动学时 All in One
            </Typography>
            
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", mb: 4, mt: 4 }}>
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
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
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

      {/* 特色功能区域 */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
            平台特色
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: "600px", mx: "auto" }}>
            提供全方位的竞赛服务体验
          </Typography>
        </Box>
        
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index} sx={{ display: 'flex' }}>
              <Card 
                sx={{ 
                  height: "100%",
                  width: "100%",
                  textAlign: "center",
                  p: 3,
                  borderRadius: 3,
                  boxShadow: theme.shadows[4],
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[12],
                  },
                  transition: "all 0.3s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 新闻轮播区域 */}
      <Box sx={{ backgroundColor: "white", py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
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
