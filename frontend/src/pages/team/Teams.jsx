import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Pagination,
  Divider,
  Button,
  TextField,
  Stack,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { teamAPI } from "../../services/TeamServices";
import TeamCard from "../../components/TeamCard";
import { useMediaQuery } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// 状态标签定义
const statusOptions = [
  { id: "full", name: "full", description: "已满员" },
  { id: "available", name: "available", description: "未满员" },
];

const Teams = () => {
  const { match_id } = useParams();
  const [teams, setTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const navigate = useNavigate();
  
  const theme = createTheme();
  const sm = useMediaQuery(theme.breakpoints.down("md"));
  const pageSize = sm ? 6 : 12;

  // 创建队伍表单状态
  const [form, setForm] = useState({
    name: "",
    introduction: "",
    expected_members: 0,
    recruitment_deadline: "",
  });

  useEffect(() => {
    const fetchTeams = async () => {
      const controller = new AbortController();
      setLoading(true);
      setError("");

      try {
        const filters = {
          query: search.trim(),
          status: selectedStatus ? [selectedStatus] : [],
        };

        const res = match_id
          ? await teamAPI.getRecruitingTeamsOfContest(
              match_id,
              pageIndex,
              pageSize,
              filters
            )
          : await teamAPI.getRecruitingTeams(
              pageIndex,
              pageSize,
              filters
            );

        if (res.success) {
          setTeams(res.data.teams || []);
          setPageCount(res.data.total_pages);
        } else {
          setError(res.message || "获取队伍列表失败");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("网络错误，请稍后重试");
          console.error("获取队伍列表出错:", err);
        }
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    };

    fetchTeams();
  }, [match_id, pageIndex, pageSize, search, selectedStatus]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPageIndex(1);
  };

  const handleStatusChange = (statusId) => {
    setSelectedStatus(prev => 
      prev === statusId ? null : statusId
    );
    setPageIndex(1);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === "expected_members" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleCreateTeam = async () => {
    try {
      setCreateError("");

      // 基本校验
      if (!form.name) {
        setCreateError("请填写队伍名称");
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(form.recruitment_deadline))) {
        setCreateError("请填写 YYYY-MM-DD 格式的招募截止日期");
        return;
      }
      if (form.expected_members === "" || Number(form.expected_members) < 0) {
        setCreateError("请填写非负的预期人数");
        return;
      }

      setSubmitting(true);

      const resp = await teamAPI.createTeam({
        contest: match_id,
        name: form.name,
        introduction: form.introduction,
        expected_members: Number(form.expected_members),
        recruitment_deadline: form.recruitment_deadline,
      });

      // 兼容两种返回：ApiResponse{data} 或直接对象
      const data = resp?.data ?? resp;

      setShowCreateForm(false);
      setPageIndex(1); // 刷新列表到第一页

      // 如果后端返回了 id，则跳转详情
      if (data?.id) {
        navigate(`/teams/${data.id}`);
      } else {
        // 重新加载队伍列表
        const res = await teamAPI.getRecruitingTeams(pageIndex, pageSize);
        if (res.success) {
          setTeams(res.data.teams || []);
          setPageCount(res.data.total_pages);
        }
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "创建失败";
      setCreateError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 5 },
        py: 5,
        transition: "width 0.5s ease",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
      >
        {match_id ? "赛事队伍" : "队伍列表"}
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />

      {/* 搜索和筛选控制区域 */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          label="搜索队伍"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={toggleExpand}
            size="small"
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ width: "110px", height: "40px" }}
          >
            {expanded ? "收起筛选" : "展开筛选"}
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowCreateForm(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            创建新队伍
          </Button>
        </Stack>
      </Stack>

      {/* 可展开的筛选区域 */}
      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        sx={{
          mb: 3,
          borderRadius: 2,
          bgcolor: "#f0f0f0",
          p: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
          队伍状态:
        </Typography>
        <Stack direction="row" spacing={1}>
          {statusOptions.map((status) => (
            <Chip
              key={status.id}
              label={status.description}
              variant={selectedStatus === status.id ? "filled" : "outlined"}
              color="primary"
              onClick={() => handleStatusChange(status.id)}
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Stack>
      </Collapse>

      {/* 队伍列表 */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 5 }}>
          {error}
        </Typography>
      ) : (
        <>
          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
          >
            {teams.length === 0 ? (
              <Grid
                size={{ xs: 12 }}
                sx={{
                  width: "100%",
                  height: "150px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 5,
                  bgcolor: "#eee",
                }}
              >
                <Typography color="text.secondary" align="center">
                  {search.trim() || selectedStatus
                    ? "没有找到匹配的队伍"
                    : "当前没有正在招募的队伍"}
                </Typography>
              </Grid>
            ) : (
              teams.map((team) => (
                <Grid
                  key={team.id}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  display="flex"
                  justifyContent="center"
                >
                  <TeamCard team={team} />
                </Grid>
              ))
            )}
          </Grid>

          {pageCount > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pageCount}
                page={pageIndex}
                onChange={(_, value) => setPageIndex(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* 创建队伍对话框 */}
      <Dialog
        open={showCreateForm}
        onClose={() => !submitting && setShowCreateForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>创建新队伍</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createError && <Alert severity="error">{createError}</Alert>}

            <TextField
              label="队伍名称"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="队伍简介"
              name="introduction"
              value={form.introduction}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={3}
              margin="normal"
            />
            <TextField
              label="预期人数"
              name="expected_members"
              type="number"
              value={form.expected_members}
              onChange={handleFormChange}
              inputProps={{ min: 1 }}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="招募截止日期 (YYYY-MM-DD)"
              name="recruitment_deadline"
              type="date"
              value={form.recruitment_deadline}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateForm(false)} disabled={submitting}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTeam}
            disabled={submitting}
          >
            {submitting ? "提交中..." : "创建"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;