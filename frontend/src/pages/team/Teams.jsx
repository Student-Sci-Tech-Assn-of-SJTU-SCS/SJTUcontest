import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  Box,
  CircularProgress,
  Pagination,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Stack,
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { teamAPI } from "../../services/TeamServices";


// 轻量防抖 Hook
function useDebounce(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const Teams = () => {
  const navigate = useNavigate();
  const { contest_id } = useParams();

  // UI 状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 列表 & 分页
  const [teams, setTeams] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(12);
  const [pageCount, setPageCount] = useState(0);

  // 搜索 & 过滤
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedStatus, setSelectedStatus] = useState(""); // 保留原先的状态筛选

  const myId = Number(localStorage.getItem("user_id"));
  const [haveCreatedTeam, sethaveCreatedTeam] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError("");
      try {
        // 👇 改为优先调用后端“按队伍名搜索”接口
        const options = {};
        let res;
        if (debouncedSearch.trim()) {
          res = await teamAPI.searchTeamsByName(
            debouncedSearch.trim(),
            pageIndex,
            pageSize,
          );
        } else {
          if (selectedStatus) options.status = [selectedStatus];
          res = contest_id
            ? await teamAPI.getRecruitingTeamsOfContest(
                contest_id,
                pageIndex,
                pageSize,
                options,
                {},
              )
            : await teamAPI.getRecruitingTeams(
                pageIndex,
                pageSize,
                options,
                {},
              );
        }

        if (res.success) {
          const data = res.data || {};
          const list = data.teams || [];
          const totalPages = data.total_pages ?? data.total_page ?? 0; // 兼容两种字段

          setTeams(list);
          setPageCount(totalPages);

          const myTeam = list.find((team) =>
            team.members?.some((m) => m.id === myId && m.is_leader),
          );
          sethaveCreatedTeam(myTeam || null);
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
    };

    fetchTeams();
  }, [contest_id, pageIndex, pageSize, debouncedSearch, selectedStatus]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPageIndex(1);
  };

  return (
    <Box
      sx={{ px: { xs: 2, sm: 5 }, py: 5, transition: "width 0.5s ease" }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {contest_id ? "赛事队伍" : "队伍列表"}
      </Typography>

      {/* 搜索和筛选控制区域 */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          label="搜索队伍名称"
          size="small"
          value={search}
          onChange={onSearchChange}
          placeholder="输入关键词，按名称模糊搜索"
        />

        <TextField
          select
          size="small"
          sx={{ minWidth: 160 }}
          label="状态筛选"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPageIndex(1);
          }}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value="recruiting">招募中</MenuItem>
          <MenuItem value="full">已满员</MenuItem>
          <MenuItem value="closed">已截止</MenuItem>
        </TextField>

        <Tooltip title="当输入关键词时，会按队伍名搜索；清空后恢复为招募列表。">
          <IconButton>
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
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
                {debouncedSearch ? "没有匹配的队伍" : "当前没有正在招募的队伍"}
              </Typography>
            ) : (
              teams.map((team) => {
                const isMeInTeam = team.members?.some((m) => m.id === myId);
                return (
                  <Box key={team.id} sx={{ p: 2, borderRadius: 2, border: "1px solid #eee", mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{team.name}</Typography>
                      <Button variant="outlined" onClick={() => navigate(`/teams/${team.id}`)}>
                        查看详情
                      </Button>
                    </Stack>
                    {team.introduction && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {team.introduction}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      人数：{team.existing_members}/{team.expected_members}
                      {team.recruitment_deadline && ` · 截止：${new Date(team.recruitment_deadline).toLocaleString()}`}
                      {team.contest && ` · 赛事：${team.contest}`}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>

          {/* 分页 */}
          {pageCount > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination
                page={pageIndex}
                count={pageCount}
                onChange={(_, page) => setPageIndex(page)}
                color="primary"
              />
            </Stack>
          )}
        </>
      )}

      {/* 不允许在列表页创建队伍的提示对话框（保持原逻辑） */}
      <Dialog open={false} onClose={() => {}}>
        <DialogTitle>提示</DialogTitle>
        <DialogContent>
          <Typography>
            队伍列表无法创建队伍，请在「赛事列表 → 寻找参赛团队」中创建您的队伍。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;
