import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  Avatar,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI } from "../../services/UserServices";
import showMessage from "../../utils/message";
import dayjs from "dayjs";

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserTotalInfo(userId);

        if (response.success) {
          setUserInfo(response.data);
        } else {
          setError(response.message || "获取用户信息失败");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "获取用户信息失败",
        );
        showMessage("获取用户信息失败", "error");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return "未设置";
    return dayjs(dateString).format("YYYY-MM-DD HH:mm:ss");
  };

  const getStatusChip = (isActive, isStaff) => {
    if (isStaff) {
      return <Chip label="管理员" color="primary" icon={<AdminIcon />} />;
    }
    return isActive ? (
      <Chip label="正常" color="success" icon={<CheckCircleIcon />} />
    ) : (
      <Chip label="已封禁" color="error" icon={<CancelIcon />} />
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          返回
        </Button>
      </Box>
    );
  }

  if (!userInfo) {
    return (
      <Box>
        <Alert severity="warning">用户信息不存在</Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          返回
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          用户详情
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          返回
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* 基本信息卡片 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                基本信息
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{userInfo.nick_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{userInfo.username}
                  </Typography>
                </Box>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="邮箱"
                    secondary={userInfo.email || "未设置"}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="注册时间"
                    secondary={formatDate(userInfo.date_joined)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="最后登录"
                    secondary={formatDate(userInfo.last_login)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="最后更新"
                    secondary={formatDate(userInfo.updated_at)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="状态"
                    secondary={getStatusChip(
                      userInfo.is_active,
                      userInfo.is_staff,
                    )}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 个人资料卡片 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                个人资料
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box mb={2}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  参赛经历
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, minHeight: 80 }}>
                  <Typography variant="body2">
                    {userInfo.experience || "暂无参赛经历"}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  特长
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, minHeight: 80 }}>
                  <Typography variant="body2">
                    {userInfo.advantage || "暂无特长信息"}
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 队伍信息卡片 */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  参与的队伍
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {userInfo.teams && userInfo.teams.length > 0 ? (
                <Grid container spacing={2}>
                  {userInfo.teams.map((team) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team.id}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {team.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {team.introduction || "暂无介绍"}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip
                            label={team.is_active ? "活跃" : "非活跃"}
                            color={team.is_active ? "success" : "default"}
                            size="small"
                          />
                          <Chip
                            label={`${team.team_users?.length || 0} 成员`}
                            color="info"
                            size="small"
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    该用户尚未加入任何队伍
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetail;
