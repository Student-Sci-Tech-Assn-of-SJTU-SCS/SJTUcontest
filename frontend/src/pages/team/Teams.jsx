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
  Tooltip,
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { useMediaQuery } from "@mui/material";
import { createTheme } from "@mui/material/styles";

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
  const currentUser = getCurrentUser();
  const myId = currentUser?.id;
  const [haveCreatedTeam, sethaveCreatedTeam] = useState(null);

  const [helpOpen, setHelpOpen] = useState(false);

  const navigate = useNavigate();

  const theme = createTheme();
  const sm = useMediaQuery(theme.breakpoints.down("md"));
  const pageSize = sm ? 6 : 12;

  const handleSubmitEdit = async (editForm) => {
    const isoDeadline = new Date(editForm.recruitment_deadline).toISOString();

    await teamAPI.updateTeam(
      team_id,
      editForm.name,
      editForm.introduction,
      editForm.expected_members,
      isoDeadline,
    );

    setSnackbar({
      open: true,
      message: "更新成功",
      severity: "success",
    });

    const updated = await teamAPI.getTeamDetail(team_id);
    setTeam(updated.data);

    return null;
  };

  useEffect(() => {
    const fetchTeams = async () => {
      const controller = new AbortController();
      setLoading(true);
      setError("");

      try {
        const filters = {
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

          const myTeam = (res.data.teams || []).find((team) =>
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

      return () => controller.abort();
    };

    fetchTeams();
  }, [match_id, pageIndex, pageSize, search, selectedStatus]);

  const handleCreateTeam = async (form) => {
    try {
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
        justifyContent="flex-end"
        alignItems="center"
      >
        <Stack direction="row" spacing={1}>
          {match_id ? (
            // 正常显示创建队伍/编辑队伍逻辑
            haveCreatedTeam ? (
              <Button
                variant="outlined"
                onClick={() => setShowCreateForm(true)}
              >
                编辑已创建的队伍
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setShowCreateForm(true)}
              >
                创建新队伍
              </Button>
            )
          ) : (
            // 非赛事页面：显示问号按钮
            <Tooltip title="查看帮助">
              <IconButton onClick={() => setHelpOpen(true)} color="primary">
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
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
                "当前没有正在招募的队伍"}
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
        initialValues={
          haveCreatedTeam
            ? {
                name: haveCreatedTeam.name,
                introduction: haveCreatedTeam.introduction,
                expected_members: haveCreatedTeam.expected_members,
                recruitment_deadline: haveCreatedTeam.recruitment_deadline,
              }
            : {
                name: "",
                introduction: "",
                expected_members: 1,
                recruitment_deadline: getNowDateTimeString(),
              }
        }
        // [ADDED] 自定义标题与确认按钮文案（可选）
        title={haveCreatedTeam ? "编辑已创建的队伍" : "创建新队伍"}
        confirmText={haveCreatedTeam ? "保存修改" : "创建"}
        cancelText="取消"
        onClose={() => setShowCreateForm(false)}
        onSubmit={haveCreatedTeam ? handleSubmitEdit : handleCreateTeam}
      />

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}>
        <DialogTitle>提示</DialogTitle>
        <DialogContent>
          <Typography>
            队伍列表无法创建队伍，请在「赛事列表 →
            寻找参赛团队」中创建您的队伍。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;
