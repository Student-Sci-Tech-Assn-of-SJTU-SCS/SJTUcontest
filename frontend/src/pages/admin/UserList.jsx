import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../services/UserServices";
import showMessage from "../../utils/message";
import dayjs from "dayjs";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(
    async (isSearch = false) => {
      try {
        if (isSearch) {
          setSearching(true);
        } else {
          setLoading(true);
        }

        const response = await userAPI.getUserList(1, 20, debouncedSearchTerm);

        if (response.success) {
          setUsers(response.data.users);
          setError(null);
        } else {
          setError(response.message || "获取用户列表失败");
        }
      } catch (err) {
        setError("获取用户列表失败");
        showMessage("获取用户列表失败", "error");
      } finally {
        if (isSearch) {
          setSearching(false);
        } else {
          setLoading(false);
        }
      }
    },
    [debouncedSearchTerm],
  );

  // 初始加载
  useEffect(() => {
    fetchUsers(false);
  }, []);

  // 搜索时重新获取数据
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      fetchUsers(true);
    }
  }, [debouncedSearchTerm]);

  // 搜索完成后恢复焦点
  useEffect(() => {
    if (!searching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searching]);

  const getStatusChip = (isActive, isStaff) => {
    if (isStaff) {
      return (
        <Chip
          label="管理员"
          color="primary"
          icon={<AdminIcon />}
          size="small"
        />
      );
    }
    return isActive ? (
      <Chip
        label="正常"
        color="success"
        icon={<CheckCircleIcon />}
        size="small"
      />
    ) : (
      <Chip label="已封禁" color="error" icon={<CancelIcon />} size="small" />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "未设置";
    return dayjs(dateString).format("YYYY-MM-DD");
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/user-detail/${userId}`);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
    return <Alert severity="error">{error}</Alert>;
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
          用户管理
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box mb={3}>
            <TextField
              ref={searchInputRef}
              fullWidth
              placeholder="搜索用户（用户名、昵称、邮箱）"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searching && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>用户</TableCell>
                  <TableCell>邮箱</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>注册时间</TableCell>
                  <TableCell>最后登录</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {user.nick_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {getStatusChip(user.is_active, user.is_staff)}
                    </TableCell>
                    <TableCell>{formatDate(user.date_joined)}</TableCell>
                    <TableCell>{formatDate(user.last_login)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewUser(user.id)}
                        title="查看详情"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {users.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? "没有找到匹配的用户" : "暂无用户数据"}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserList;
