import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { newsAPI } from "../../services/NewsServices";
import showMessage from "../../utils/message";
import axios from "axios";

const ManageNews = () => {
  const [news, setNews] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedContest, setSelectedContest] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 获取新闻列表
  const fetchNews = async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      const response = await newsAPI.getNews({ signal: controller.signal });
      if (response.success) {
        setNews(response.data || []);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      showMessage(`获取新闻列表失败：${err}`, "error");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  // 获取所有比赛列表
  const fetchContests = async () => {
    const controller = new AbortController();

    try {
      const response = await newsAPI.getAllContestsForNews({
        signal: controller.signal,
      });
      if (response.success) {
        setContests(response.data || []);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      showMessage(`获取比赛列表失败：${err}`, "error");
    }

    return () => controller.abort();
  };

  useEffect(() => {
    fetchNews();
    fetchContests();
  }, []);

  // 删除新闻
  const handleDelete = async (newsId) => {
    if (!window.confirm("确定要从新闻展示中移除这个比赛吗？")) {
      return;
    }

    const controller = new AbortController();

    try {
      const response = await newsAPI.deleteNews(newsId, {
        signal: controller.signal,
      });
      if (response.success) {
        showMessage(`删除成功！`, "success");
        fetchNews();
        fetchContests(); // 刷新比赛列表状态
      } else {
        showMessage(`删除失败：${response.message || "未知错误。"}`, "error");
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      showMessage(`删除失败：${err}`, "error");
      // showSnackbar("删除失败", "error");
    }

    return () => controller.abort();
  };

  // 添加新闻
  const handleAdd = async () => {
    if (!selectedContest) {
      showMessage(`请选择一个比赛`, "warning");
      return;
    }

    const controller = new AbortController();

    try {
      const response = await newsAPI.createNews(
        { contest: selectedContest },
        { signal: controller.signal },
      );
      if (response.success) {
        showMessage("添加成功", "success");
        setOpenAddDialog(false);
        setSelectedContest("");
        fetchNews();
        fetchContests(); // 刷新比赛列表状态
      } else {
        showMessage(`添加失败：${response.message || "未知错误。"}`, "error");
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      showMessage(`添加失败：${err}`, "error");
    }

    return () => controller.abort();
  };

  // 过滤比赛列表
  const filteredContests = contests.filter(
    (contest) =>
      !contest.in_news && // 只显示未添加到新闻的比赛
      contest.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 获取级别标签颜色
  const getLevelColor = (level) => {
    const levelColors = {
      国际级: "error",
      国家级: "warning",
      省市级: "info",
      校级: "success",
      院级: "default",
    };
    return levelColors[level] || "default";
  };

  // 获取素拓类别颜色
  const getQualityColor = (quality) => {
    const qualityColors = {
      创新创业: "primary",
      社会实践: "secondary",
      体育活动: "success",
      文艺活动: "warning",
      学术科技: "info",
      思想成长: "error",
    };
    return qualityColors[quality] || "default";
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        新闻轮播管理
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        管理首页展示的推荐比赛，这些比赛将在首页轮播展示
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">当前展示比赛 ({news.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          disabled={loading}
        >
          添加比赛到轮播
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : news.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            暂无展示的比赛，点击上方按钮添加
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>比赛名称</TableCell>
                <TableCell>年份</TableCell>
                <TableCell>级别</TableCell>
                <TableCell>素拓类别</TableCell>
                <TableCell>比赛时间</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {news.map((item) => {
                const contest = item.contest;
                const monthsText =
                  contest.months?.length > 0
                    ? `${contest.months.join("、")}月`
                    : "时间未定";

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {contest.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{contest.year}</TableCell>
                    <TableCell>
                      <Chip
                        label={contest.level}
                        size="small"
                        color={getLevelColor(contest.level)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contest.quality}
                        size="small"
                        color={getQualityColor(contest.quality)}
                      />
                    </TableCell>
                    <TableCell>{monthsText}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(item.id)}
                        title="从轮播中移除"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 添加比赛对话框 */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>添加比赛到轮播</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="搜索比赛名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth>
              <InputLabel>选择比赛</InputLabel>
              <Select
                value={selectedContest}
                onChange={(e) => setSelectedContest(e.target.value)}
                label="选择比赛"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {filteredContests.length === 0 ? (
                  <MenuItem disabled>
                    <Typography color="text.secondary">
                      {searchTerm ? "没有找到匹配的比赛" : "所有比赛都已添加"}
                    </Typography>
                  </MenuItem>
                ) : (
                  filteredContests.map((contest) => (
                    <MenuItem key={contest.id} value={contest.id}>
                      <Box sx={{ width: "100%" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography>{contest.name}</Typography>
                          {contest.in_news && (
                            <Chip
                              icon={<CheckIcon />}
                              label="已添加"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          <Chip
                            label={contest.year}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={contest.level}
                            size="small"
                            color={getLevelColor(contest.level)}
                          />
                          <Chip
                            label={contest.quality}
                            size="small"
                            color={getQualityColor(contest.quality)}
                          />
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {selectedContest && (
              <Alert severity="info" sx={{ mt: 2 }}>
                该比赛将在首页轮播区域展示
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddDialog(false);
              setSelectedContest("");
              setSearchTerm("");
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={!selectedContest}
          >
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageNews;
