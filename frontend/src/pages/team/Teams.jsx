import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  Box,
  CircularProgress,
  Pagination,
  Divider,
  Button,
  TextField,
  Stack,
} from "@mui/material";

import { useMediaQuery } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { teamAPI } from "../../services/TeamServices";
import EditTeamDialog from "../../components/team/EditTeamDialog";
import TeamCard from "../../components/team/TeamCard";
import { getCurrentUser } from "../../utils/auth";

function getNowDateTimeString() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

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
  const currentUser = getCurrentUser();
  const myId = currentUser?.id;

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
              filters,
            )
          : await teamAPI.getRecruitingTeams(pageIndex, pageSize, filters);

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
    setSelectedStatus((prev) => (prev === statusId ? null : statusId));
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
        name === "expected_members"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleCreateTeam = async (form) => {
    try {
      setCreateError("");

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
        const res = await teamAPI.getRecruitingTeams(pageIndex, pageSize);
        if (res.success) {
          setTeams(res.data.teams || []);
          setPageCount(res.data.total_pages);
        }
      }

      return null;
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "创建失败";
      return msg;
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
            variant="contained"
            onClick={() => setShowCreateForm(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            创建新队伍
          </Button>
        </Stack>
      </Stack>

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
          <Box>
            {teams.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 6 }}>
                {search.trim() || selectedStatus
                  ? "没有找到匹配的队伍"
                  : "当前没有正在招募的队伍"}
              </Typography>
            ) : (
              teams.map((team) => {
                const isMeInTeam = team.members?.some((m) => m.id === myId);
                return (
                  <TeamCard key={team.id} team={team} highlight={isMeInTeam} />
                );
              })
            )}
          </Box>

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

      <EditTeamDialog
        open={showCreateForm}
        initialValues={{
          name: "",
          introduction: "",
          expected_members: 1,
          recruitment_deadline: getNowDateTimeString(),
        }}
        // [ADDED] 自定义标题与确认按钮文案（可选）
        title="创建新队伍"
        confirmText="创建"
        cancelText="取消"
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateTeam}
      />
    </Box>
  );
};

export default Teams;
