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
  TextField,
  Grid,
  useTheme,
  alpha,
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SearchIcon from "@mui/icons-material/Search";

import { useMediaQuery } from "@mui/material";
import { createFadeInAnim } from "../../styles/animations";

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
  const { contest_id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentUser = getCurrentUser();
  const myId = currentUser?.id;
  const [haveCreatedTeam, sethaveCreatedTeam] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const sm = useMediaQuery(theme.breakpoints.down("md"));
  const md = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const pageColumns = sm ? 1 : 2;
  const pageRows = 5;
  const pageSize = pageColumns * pageRows;

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
        let res;

        if (searchQuery.trim()) {
          res = await teamAPI.searchTeamsByName(
            searchQuery.trim(),
            pageIndex,
            pageSize,
          );
        } else {
          res = contest_id
            ? await teamAPI.getRecruitingTeamsOfContest(
                contest_id,
                pageIndex,
                pageSize,
              )
            : await teamAPI.getRecruitingTeams(pageIndex, pageSize);
        }

        if (res.success) {
          setTeams(res.data.teams || []);
          setPageCount(res.data.total_pages);
        } else {
          setError(res.message || "获取队伍列表失败");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("网络错误，请稍后重试");
        }
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    };

    fetchTeams();
  }, [contest_id, pageIndex, pageSize, searchQuery]);
  const handleCreateTeam = async (form) => {
    try {
      const resp = await teamAPI.createTeam({
        contest: contest_id,
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
      const resp = e?.response?.data;
      let msg = "";

      // 自定义 ApiResponse: { success: false, message: "...", data: {...} }
      if (resp && resp.data && typeof resp.data === "object") {
        const firstKey = Object.keys(resp.data)[0];
        const firstVal = resp.data[firstKey];
        if (Array.isArray(firstVal) && firstVal.length > 0) {
          msg = firstVal[0]; // ⬅️ 获取队伍名称包含敏感内容，请修改
        }
      }

      if (!msg) {
        msg = resp?.message || e?.message || "创建失败";
      }

      return msg;
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPageIndex(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: { xs: 2, sm: 5 },
        transition: "width 0.5s ease",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{
          letterSpacing: 2,
          textAlign: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 1,
          textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.12)}`,
          animation: "fadeInDown 1s ease-out",
          ...createFadeInAnim({
            name: "fadeInDown",
            direction: "down",
          }),
        }}
      >
        {contest_id ? "赛事队伍" : "队伍列表"}
      </Typography>
      <Divider
        sx={{
          mb: 4,
          mx: "auto",
          width: 120,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
          animation: "fadeInLeft 1s ease-out",
          ...createFadeInAnim({
            name: "fadeInLeft",
            direction: "left",
            distance: 60,
          }),
        }}
      />

      {/* 搜索栏 */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="搜索队伍"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入队伍名称"
            sx={{
              width: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSearch}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <SearchIcon />
          </IconButton>

          {contest_id ? (
            haveCreatedTeam ? (
              <Button
                variant="outlined"
                onClick={() => setShowCreateForm(true)}
                sx={{ borderRadius: 2 }}
              >
                编辑已创建的队伍
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setShowCreateForm(true)}
                sx={{ borderRadius: 2 }}
              >
                创建新队伍
              </Button>
            )
          ) : (
            <Tooltip title="查看帮助">
              <IconButton onClick={() => setHelpOpen(true)} color="primary">
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* 队伍列表 */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress size={20} value={25} />
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
            justifyContent="space-between"
            alignItems="stretch"
            sx={{
              transition: "all ease-in-out 0.5s",
            }}
          >
            {teams.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    mt: 2,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.primary.light, 0.08),
                    boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                  }}
                >
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{
                      fontSize: "1.1rem",
                      animation: "fadeIn 0.8s ease-out",
                      ...createFadeInAnim({ name: "fadeIn" }),
                    }}
                  >
                    当前没有正在招募的队伍
                  </Typography>
                </Box>
              </Grid>
            ) : (
              teams.map((team, idx) => {
                const isMeInTeam = team.members?.some((m) => m.id === myId);
                return (
                  <Grid
                    key={team.id}
                    size={{ sm: 12, md: 6 }}
                    display="flex"
                    justifyContent="center"
                    sx={{
                      animation: `${
                        idx % pageColumns === 0
                          ? "cardFadeInLeft"
                          : idx % pageColumns === pageColumns - 1
                            ? "cardFadeInRight"
                            : "cardFadeInUp"
                      } 0.7s ease-out forwards`,
                      animationDelay: `${idx * 0.08 + 0.2}s`,
                      opacity: 0,
                      ...createFadeInAnim({
                        name: "cardFadeInLeft",
                        direction: "left",
                        distance: 60,
                      }),
                      ...createFadeInAnim({
                        name: "cardFadeInRight",
                        direction: "right",
                        distance: 60,
                      }),
                      ...createFadeInAnim({
                        name: "cardFadeInUp",
                        direction: "up",
                        distance: 30,
                      }),
                    }}
                  >
                    <TeamCard team={team} highlight={isMeInTeam} />
                  </Grid>
                );
              })
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
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 3,
                  },
                }}
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
