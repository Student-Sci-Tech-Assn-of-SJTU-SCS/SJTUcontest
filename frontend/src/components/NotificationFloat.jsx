import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
  Announcement as AnnouncementIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";

const NotificationFloat = () => {
  const theme = useTheme();
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // 判断是否在主页
  const isHomePage = location.pathname === "/";

  // 初始化和路由变化时的逻辑
  useEffect(() => {
    // 检查用户是否手动操作过浮窗
    const userInteracted = localStorage.getItem("notificationUserInteracted");
    
    if (userInteracted === "true") {
      // 如果用户手动操作过，使用用户的选择（不再自动根据页面切换）
      setHasUserInteracted(true);
      const savedState = localStorage.getItem("showNotificationFloat");
      setShowNotification(savedState === "true");
    } else {
      // 如果用户没有手动操作过，根据页面决定显示状态
      // 主页默认显示，其他页面默认隐藏
      setShowNotification(isHomePage);
    }
  }, [location.pathname, isHomePage]);

  // 保存状态到localStorage
  const handleToggleNotification = (show) => {
    setShowNotification(show);
    setHasUserInteracted(true);
    localStorage.setItem("showNotificationFloat", show.toString());
    localStorage.setItem("notificationUserInteracted", "true");
  };

  return (
    <>
      {/* 左侧悬浮通知栏 */}
      {showNotification ? (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            left: { xs: 10, sm: 20 },
            top: "40%",
            transform: "translateY(-50%)",
            zIndex: 1200,
            p: { xs: 1.8, sm: 2 },
            borderRadius: 2,
            background: alpha(theme.palette.success.main, 0.08),
            backdropFilter: "blur(10px)",
            border: `2px solid ${alpha(theme.palette.success.dark, 0.8)}`,
            maxWidth: { xs: 240, sm: 260 },
            minWidth: { xs: 200, sm: 220 },
            overflow: "hidden",
            boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.15)}`,
            display: { xs: "none", md: "block" }, // 在小屏幕上隐藏
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.success.light, 0.05)} 0%, 
                transparent 100%)`,
              pointerEvents: "none",
            },
            animation: "slideInLeft 0.5s ease-out",
            "@keyframes slideInLeft": {
              from: {
                left: -320,
                opacity: 0,
              },
              to: {
                left: 20,
                opacity: 1,
              },
            },
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "translateY(-50%) scale(1.02)",
            },
          }}
        >
          {/* 关闭按钮 */}
          <IconButton
            size="small"
            onClick={(e) => {
              // Shift + 点击可以重置用户偏好
              if (e.shiftKey) {
                localStorage.removeItem("notificationUserInteracted");
                localStorage.removeItem("showNotificationFloat");
                setHasUserInteracted(false);
                setShowNotification(false);
              } else {
                handleToggleNotification(false);
              }
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.success.dark,
              opacity: 0.7,
              "&:hover": {
                opacity: 1,
                background: alpha(theme.palette.success.main, 0.1),
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* 文字内容 */}
          <Box sx={{ mb: 1.5, mr: 1 }}>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.success.dark,
                fontWeight: 700,
                fontSize: "1rem",
                lineHeight: 1.4,
                mb: 0.5,
              }}
            >
              竞赛获奖情况填报已开启！
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.success.dark,
                fontWeight: 500,
                fontSize: "0.85rem",
                lineHeight: 1.5,
              }}
            >
              这将作为你劳动学时和素拓的发放凭据，以及评优评先的参考。
            </Typography>
          </Box>

          {/* 按钮 */}
          <Button
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            onClick={() => window.open("https://www.baidu.com", "_blank")}
            sx={{
              borderRadius: 20,
              py: 0.8,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              background: theme.palette.success.main,
              boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.25)}`,
              "&:hover": {
                background: theme.palette.success.dark,
                transform: "translateX(2px)",
                boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.35)}`,
                "& .MuiButton-endIcon": {
                  transform: "translateX(3px)",
                },
              },
              transition: "all 0.3s ease",
              "& .MuiButton-endIcon": {
                transition: "transform 0.3s ease",
                ml: 0.5,
              },
            }}
          >
            立即前往
          </Button>
        </Paper>
      ) : (
        /* 重新显示浮窗的小按钮 */
        <Tooltip 
          title={
            <Box>
              <div>查看竞赛填报通知</div>
              {hasUserInteracted && (
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: 4 }}>
                  按住Shift点击可重置为默认设置
                </div>
              )}
            </Box>
          } 
          placement="right" 
          arrow
        >
          <Paper
            elevation={2}
            sx={{
              position: "fixed",
              left: 0,
              top: "40%",
              transform: "translateY(-50%)",
              zIndex: 1200,
              borderRadius: "0 8px 8px 0",
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.success.dark, 0.95)}, 
                ${alpha(theme.palette.success.main, 0.9)})`,
              overflow: "hidden",
              display: { xs: "none", md: "flex" }, // 在小屏幕上隐藏
              alignItems: "center",
              cursor: "pointer",
              animation: "slideInLeft 0.3s ease-out, pulseRing 1.5s infinite",
              transition: "all 0.3s ease",
              "&:hover": {
                left: 5,
                background: `linear-gradient(135deg, 
                  ${theme.palette.success.dark}, 
                  ${theme.palette.success.main})`,
                boxShadow: `0 4px 20px ${alpha(
                  theme.palette.success.main,
                  0.4
                )}`,
                animation: "slideInLeft 0.3s ease-out",
                "& .arrow-icon": {
                  transform: "translateX(3px)",
                },
              },
              "@keyframes slideInLeft": {
                from: {
                  left: -50,
                  opacity: 0,
                },
                to: {
                  left: 0,
                  opacity: 1,
                },
              },
              "@keyframes pulseRing": {
                "0%": {
                  boxShadow: `0 0 0 0 ${alpha(
                    theme.palette.success.main,
                    0.6
                  )}`,
                },
                "40%": {
                  boxShadow: `0 0 0 8px ${alpha(
                    theme.palette.success.main,
                    0.3
                  )}`,
                },
                "80%": {
                  boxShadow: `0 0 0 12px ${alpha(
                    theme.palette.success.main,
                    0
                  )}`,
                },
                "100%": {
                  boxShadow: `0 0 0 0 ${alpha(
                    theme.palette.success.main,
                    0
                  )}`,
                },
              },
            }}
            onClick={(e) => {
              // Shift + 点击可以重置用户偏好
              if (e.shiftKey) {
                localStorage.removeItem("notificationUserInteracted");
                localStorage.removeItem("showNotificationFloat");
                setHasUserInteracted(false);
                setShowNotification(isHomePage);
              } else {
                handleToggleNotification(true);
              }
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1,
                py: 1.8,
              }}
            >
              <AnnouncementIcon
                sx={{
                  fontSize: 20,
                  color: "white",
                  mr: 0.3,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
              />
              <ChevronRightIcon
                className="arrow-icon"
                sx={{
                  fontSize: 18,
                  color: "white",
                  transition: "transform 0.3s ease",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
              />
            </Box>
          </Paper>
        </Tooltip>
      )}
    </>
  );
};

export default NotificationFloat;
