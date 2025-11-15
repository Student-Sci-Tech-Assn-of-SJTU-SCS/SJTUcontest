import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Container,
  CssBaseline,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Slideshow as SlideshowIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: "概览",
      icon: <DashboardIcon />,
      path: "/admin",
    },
    {
      text: "创建比赛",
      icon: <AddCircleIcon />,
      path: "/admin/create-contest",
    },
    {
      text: "创建用户",
      icon: <AddCircleIcon />,
      path: "/admin/create-user",
    },
    {
      text: "用户管理",
      icon: <PeopleIcon />,
      path: "/admin/user-list",
    },
    {
      text: "管理比赛",
      icon: <EditIcon />,
      path: "/admin/view-contests",
    },
    {
      text: "轮播管理",
      icon: <SlideshowIcon />,
      path: "/admin/manage-news",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* 侧边导航栏 */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "relative",
            height: "100%",
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: "primary.main",
            color: "white",
          }}
        >
          <Typography variant="h6" component="div" fontWeight="bold">
            管理员面板
          </Typography>
        </Box>

        <Divider />

        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color:
                      location.pathname === item.path ? "white" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* 主要内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#fafafa",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminPanel;
