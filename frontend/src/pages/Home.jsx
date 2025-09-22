import React from "react";
import {
  Typography,
  Button,
  Box,
  Container,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EmojiEvents as ContestIcon,
  Groups as TeamsIcon,
  Person as PersonIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import NewsCarousel from "../components/NewsCarousel";
import { createFadeInAnim } from "../styles/animations";

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
    <Box
      sx={{
        minHeight: "100vh",
        py: 0,
        // background: `linear-gradient(180deg,
        //   ${alpha(theme.palette.background.paper, 1)} 0%,
        //   ${alpha(theme.palette.primary.main, 0.02)} 50%,
        //   ${alpha(theme.palette.background.paper, 1)} 100%)
        // `,
      }}
    >
      {/* 英雄区域 */}
      <Box
        sx={{
          py: 10,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-50%",
            left: "-25%",
            width: "150%",
            height: "200%",
            // background: `radial-gradient(ellipse at center,
            //   ${alpha(theme.palette.primary.light, 0.08)} 0%,
            //   transparent 70%)`,
            // animation: "float 20s ease-in-out infinite",
            // "@keyframes float": {
            //   "0%, 100%": { transform: "rotate(0deg) scale(1)" },
            //   "50%": { transform: "rotate(180deg) scale(1.1)" },
            // },
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                letterSpacing: 2,
                textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.15)}`,
                animation: "fadeInDown 1s ease-out",
                ...createFadeInAnim({
                  name: "fadeInDown",
                  direction: "down",
                }),
              }}
            >
              上海交通大学计算机学院
            </Typography>
            <Typography
              variant="h3"
              gutterBottom
              fontWeight="bold"
              sx={{
                mb: 8,
                background: `linear-gradient(135deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                letterSpacing: 3,
                animation: "fadeInUp 1s ease-out 0.3s backwards",
                ...createFadeInAnim({
                  name: "fadeInUp",
                  direction: "up",
                }),
              }}
            >
              科创赛事平台
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.8),
                mb: 8,
                maxWidth: "600px",
                mx: "auto",
                mt: 5,
                lineHeight: 1.8,
                fontWeight: 400,
                position: "relative",
                animation: "fadeIn 1s ease-out 0.6s backwards",
                ...createFadeInAnim({
                  name: "fadeIn",
                }),
                "&::before, &::after": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  width: 60,
                  height: 1,
                  background: `linear-gradient(90deg, 
                    transparent, 
                    ${alpha(theme.palette.primary.main, 0.3)})`,
                },
                "&::before": {
                  left: -80,
                  transform: "translateY(-50%)",
                },
                "&::after": {
                  right: -80,
                  transform: "translateY(-50%) rotate(180deg)",
                },
              }}
            >
              寻找比赛、组建团队、劳动学时 All in One
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 4,
                mt: 4,
                animation: "fadeInUp 1s ease-out 0.9s backwards",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ContestIcon />}
                onClick={() => navigate("/matches")}
                sx={{
                  borderRadius: 20,
                  px: 5,
                  py: 1.8,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.15rem",
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main} 0%, 
                    ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(90deg, 
                      transparent, 
                      ${alpha(theme.palette.common.white, 0.2)}, 
                      transparent)`,
                    transition: "left 0.5s ease",
                  },
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.02)",
                    boxShadow: `0 15px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                    "&::before": {
                      left: "100%",
                    },
                  },
                  transition: "all 0.3s ease",
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
                      borderRadius: 20,
                      px: 5,
                      py: 1.8,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "1.15rem",
                      borderWidth: 2,
                      borderColor: theme.palette.primary.main,
                      position: "relative",
                      overflow: "hidden",
                      background: alpha(theme.palette.primary.main, 0.02),
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 0,
                        height: 0,
                        borderRadius: "50%",
                        background: alpha(theme.palette.primary.main, 0.1),
                        transform: "translate(-50%, -50%)",
                        transition: "width 0.5s, height 0.5s",
                      },
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.08,
                        ),
                        transform: "translateY(-3px)",
                        borderColor: theme.palette.primary.dark,
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`,
                        "&::before": {
                          width: 300,
                          height: 300,
                        },
                      },
                      transition: "all 0.3s ease",
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
                      borderRadius: 20,
                      px: 5,
                      py: 1.8,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "1.15rem",
                      borderWidth: 2,
                      borderColor: theme.palette.secondary.main,
                      position: "relative",
                      overflow: "hidden",
                      background: alpha(theme.palette.secondary.main, 0.02),
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 0,
                        height: 0,
                        borderRadius: "50%",
                        background: alpha(theme.palette.secondary.main, 0.1),
                        transform: "translate(-50%, -50%)",
                        transition: "width 0.5s, height 0.5s",
                      },
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.secondary.main,
                          0.08,
                        ),
                        borderColor: theme.palette.secondary.dark,
                        transform: "translateY(-3px)",
                        boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.2)}`,
                        "&::before": {
                          width: 300,
                          height: 300,
                        },
                      },
                      transition: "all 0.3s ease",
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
                    borderRadius: 20,
                    px: 5,
                    py: 1.8,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1.15rem",
                    background: `linear-gradient(135deg, 
                      ${theme.palette.secondary.main} 0%, 
                      ${theme.palette.secondary.dark} 100%)`,
                    boxShadow: `0 10px 30px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: `linear-gradient(90deg, 
                        transparent, 
                        ${alpha(theme.palette.common.white, 0.2)}, 
                        transparent)`,
                      transition: "left 0.5s ease",
                    },
                    "&:hover": {
                      transform: "translateY(-3px) scale(1.02)",
                      boxShadow: `0 15px 40px ${alpha(theme.palette.secondary.main, 0.4)}`,
                      "&::before": {
                        left: "100%",
                      },
                    },
                    transition: "all 0.3s ease",
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
      <Box
        sx={{
          py: 8,
          position: "relative",
          // background: `linear-gradient(180deg,
          //   ${alpha(theme.palette.background.default, 0.5)} 0%,
          //   ${alpha(theme.palette.primary.main, 0.03)} 50%,
          //   ${alpha(theme.palette.background.default, 0.5)} 100%)
          // `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            // background: `linear-gradient(90deg,
            //   transparent 0%,
            //   ${alpha(theme.palette.primary.main, 0.15)} 50%,
            //   transparent 100%)`,
          },
        }}
      >
        <Container maxWidth="lg">
          {/* 标题区域 */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, 
                  ${theme.palette.primary.dark} 0%, 
                  ${theme.palette.primary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
                letterSpacing: 1,
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 60,
                  height: 3,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, 
                    ${theme.palette.primary.light}, 
                    ${theme.palette.secondary.main})`,
                },
              }}
            >
              近期赛事
            </Typography>

            {/* 装饰性图标 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
                mt: 4,
              }}
            >
              {[...Array(3)].map((_, i) => (
                <SparkleIcon
                  key={i}
                  sx={{
                    fontSize: 20,
                    color:
                      i === 1
                        ? theme.palette.secondary.main
                        : alpha(theme.palette.primary.main, 0.5),
                    filter: `drop-shadow(0 0 8px ${alpha(
                      i === 1
                        ? theme.palette.secondary.main
                        : theme.palette.primary.main,
                      0.4,
                    )})`,
                    animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    "@keyframes twinkle": {
                      "0%, 100%": {
                        opacity: 0.5,
                        transform: "scale(1) rotate(0deg) translateY(0)",
                      },
                      "50%": {
                        opacity: 1,
                        transform: "scale(1.3) rotate(180deg) translateY(-5px)",
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* 轮播容器 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              mt: 6,
              px: 2, // 添加水平内边距确保左右对称
            }}
          >
            <Box
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                maxWidth: 650, // 设置最大宽度限制
              }}
            >
              {/* 左侧装饰 */}
              <Box
                sx={{
                  position: "absolute",
                  left: -60,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, 
                    ${alpha(theme.palette.primary.light, 0.08)} 0%, 
                    transparent 70%)`,
                  filter: "blur(40px)",
                  animation: "pulse 4s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 0.5 },
                    "50%": { opacity: 0.8 },
                  },
                }}
              />

              {/* 右侧装饰 */}
              <Box
                sx={{
                  position: "absolute",
                  right: -60,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, 
                    ${alpha(theme.palette.secondary.light, 0.08)} 0%, 
                    transparent 70%)`,
                  filter: "blur(40px)",
                  animation: "pulse 4s ease-in-out infinite reverse",
                }}
              />

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  pr: 4,
                  borderRadius: 4,
                  background: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: `
                    0 20px 40px ${alpha(theme.palette.primary.main, 0.08)},
                    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.5)}
                  `,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: -2,
                    borderRadius: 4,
                    padding: 2,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.primary.main, 0.15)}, 
                      ${alpha(theme.palette.secondary.main, 0.15)})`,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                  },
                }}
              >
                <NewsCarousel />
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
