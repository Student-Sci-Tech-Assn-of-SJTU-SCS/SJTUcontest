import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
  Fade,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { teamAPI } from "../../services/TeamServices";
import { contestAPI } from "../../services/ContestServices";

import EditTeamDialog from "../../components/team/EditTeamDialog";
import showMessage from "../../utils/message";

const TeamDetail = () => {
  const { team_id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [contestName, setContestName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [inputCode, setInputCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [quitting, setQuitting] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    introduction: "",
    expected_members: 0,
    recruitment_deadline: "",
  });

  // 计算招募进度百分比
  const getProgressPercent = () => {
    if (!team) return 0;
    return Math.min((team.existing_members / team.expected_members) * 100, 100);
  };

  // 判断是否已过截止日期
  const isDeadlinePassed = () => {
    if (!team?.recruitment_deadline) return false;
    return new Date(team.recruitment_deadline) < new Date();
  };

  // const [snackbar, setSnackbar] = useState({
  //   open: false,
  //   message: "",
  //   severity: "info",
  // });

  const formatDatetimeLocal = (isoString) => {
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const fetchTeamData = async () => {
    try {
      const teamRes = await teamAPI.getTeamDetail(team_id);
      const data = teamRes.data;
      setTeam(data);

      if (data.contest) {
        const contestRes = await contestAPI.getContestDetail(data.contest);
        setContestName(contestRes.data?.name || "");
      }

      const currentUserJSON = localStorage.getItem("user");
      const currentUser = currentUserJSON ? JSON.parse(currentUserJSON) : null;
      const currentUserId = currentUser?.id;

      let memberFlag = false;
      let leaderFlag = false;

      if (currentUserId && data.members) {
        data.members.forEach((m) => {
          if (m.id === currentUserId) {
            memberFlag = true;
            if (m.is_leader) {
              leaderFlag = true;
            }
          }
        });
      }

      setIsMember(memberFlag);
      setIsLeader(leaderFlag);
    } catch (error) {
      showMessage("加载队伍信息失败", "error");
      // setSnackbar({
      //   open: true,
      //   message: "加载队伍信息失败",
      //   severity: "error",
      // });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [team_id]);

  const handleJoin = async () => {
    try {
      await teamAPI.joinTeam(team_id, inputCode);
      showMessage("成功加入队伍", "success");
      // setSnackbar({ open: true, message: "成功加入队伍", severity: "success" });
      await fetchTeamData();
    } catch (error) {
      showMessage("加入队伍失败", "error");
      // setSnackbar({ open: true, message: "加入队伍失败", severity: "error" });
    }
  };

  const handleQuit = async () => {
    try {
      await teamAPI.leaveTeam(team_id);
      showMessage("已退出队伍", "success");
      // setSnackbar({ open: true, message: "已退出队伍", severity: "success" });
      setIsMember(false);
      await fetchTeamData();
    } catch (error) {
      showMessage("退出失败", "error");
      // setSnackbar({ open: true, message: "退出失败", severity: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await teamAPI.deleteTeam(team_id);
      showMessage("队伍已删除", "success");
      // setSnackbar({ open: true, message: "队伍已删除", severity: "success" });
      const target = team?.contest
        ? `/contests/${team.contest}/teams`
        : "/teams";
      navigate(target, { replace: true });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "删除失败";
      showMessage(msg, "error");
      // setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleSubmitEdit = async (editForm) => {
    const isoDeadline = new Date(editForm.recruitment_deadline).toISOString();

    await teamAPI.updateTeam(
      team_id,
      editForm.name,
      editForm.introduction,
      editForm.expected_members,
      isoDeadline,
    );

    showMessage("更新成功", "success");
    // setSnackbar({
    //   open: true,
    //   message: "更新成功",
    //   severity: "success",
    // });

    const updated = await teamAPI.getTeamDetail(team_id);
    setTeam(updated.data);

    return null;
  };

  // const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleFetchInvitationCode = async () => {
    try {
      const res = await teamAPI.getTeamInvitationCode(team_id);
      setInvitationCode(res.data?.invitation_code || "");
      setDialogOpen(true);
    } catch (error) {
      showMessage("获取邀请码失败", "error");
      // setSnackbar({
      //   open: true,
      //   message: "获取邀请码失败",
      //   severity: "error",
      // });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(invitationCode);
    showMessage("邀请码已复制到剪贴板", "success");
    // setSnackbar({
    //   open: true,
    //   message: "邀请码已复制",
    //   severity: "success",
    // });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          加载队伍信息中...
        </Typography>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <PeopleIcon sx={{ fontSize: 64, color: "grey.400" }} />
        <Typography variant="h6" color="text.secondary">
          未找到队伍信息
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          返回上一页
        </Button>
      </Box>
    );
  }

  return (
    <Box maxWidth="lg" mx="auto" mt={4} mb={6} px={{ xs: 2, sm: 3 }}>
      {/* 页面头部 - 队伍名称和操作按钮 */}
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 3,
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(25, 118, 210, 0.12), rgba(156, 39, 176, 0.08))",
            border: "1px solid",
            borderColor: "primary.light",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 背景装饰 */}
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(25, 118, 210, 0.06)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(156, 39, 176, 0.05)",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* 操作按钮区域 */}
            {(isLeader || (isMember && !isLeader)) && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {isLeader && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setEditForm({
                          name: team.name || "",
                          introduction: team.introduction || "",
                          expected_members: team.expected_members || 0,
                          recruitment_deadline: team.recruitment_deadline
                            ? formatDatetimeLocal(team.recruitment_deadline)
                            : "",
                        });
                        setEditDialogOpen(true);
                      }}
                      sx={{
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteOpen(true)}
                      disabled={deleting}
                      sx={{
                        bgcolor: "error.main",
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                    >
                      删除队伍
                    </Button>
                  </>
                )}
                {isMember && !isLeader && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={() => setQuitOpen(true)}
                    sx={{
                      bgcolor: "error.main",
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    退出队伍
                  </Button>
                )}
              </Box>
            )}

            {/* 队伍名称 */}
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary.dark"
              sx={{
                mb: 2,
                pr: isLeader || isMember ? 15 : 0,
                wordBreak: "break-word",
                lineHeight: 1.3,
              }}
            >
              {team.name}
            </Typography>

            {/* 队伍简介 */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: "800px",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {team.introduction || "暂无队伍简介"}
            </Typography>
          </Box>
        </Paper>
      </Fade>

      {/* 主要内容区域 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* 左侧 - 队伍信息 */}
        <Fade in timeout={700}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="600"
              sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
            >
              <InfoOutlinedIcon color="primary" />
              队伍信息
            </Typography>

            <Stack spacing={3}>
              {/* 比赛名称 */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  参加比赛
                </Typography>
                <Chip
                  icon={<EmojiEventsIcon />}
                  label={contestName || team.contest || "未知比赛"}
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    team.contest && navigate(`/contests/${team.contest}`)
                  }
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                    "& .MuiChip-label": {
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      py: 1,
                    },
                    cursor: team.contest ? "pointer" : "default",
                  }}
                />
              </Box>

              {/* 队伍人数进度 */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 1,
                  }}
                >
                  <PeopleIcon fontSize="small" />
                  招募进度
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getProgressPercent()}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "grey.200",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          background:
                            getProgressPercent() >= 100
                              ? "linear-gradient(90deg, #81c784, #a5d6a7)"
                              : "linear-gradient(90deg, #4db6ac, #26a69a)",
                        },
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    sx={{ minWidth: "fit-content" }}
                  >
                    {team.existing_members} / {team.expected_members} 人
                  </Typography>
                </Box>
              </Box>

              {/* 截止日期 */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <EventIcon fontSize="small" />
                  招募截止日期
                </Typography>
                <Chip
                  label={new Date(team.recruitment_deadline).toLocaleDateString(
                    "zh-CN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                  size="small"
                  color={isDeadlinePassed() ? "error" : "success"}
                  variant="filled"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              {/* 队长获取邀请码 */}
              {isLeader && (
                <Box sx={{ pt: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<VpnKeyIcon />}
                    onClick={handleFetchInvitationCode}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      borderWidth: 2,
                      "&:hover": { borderWidth: 2 },
                    }}
                  >
                    获取邀请码
                  </Button>
                </Box>
              )}

              {/* 非成员加入队伍 */}
              {!isMember && !isLeader && (
                <Box
                  sx={{
                    pt: 2,
                    mt: 1,
                    borderTop: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    输入邀请码加入队伍
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      size="small"
                      label="邀请码"
                      placeholder="请输入邀请码"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<GroupAddIcon />}
                      onClick={handleJoin}
                      disabled={!inputCode.trim()}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        whiteSpace: "nowrap",
                        background:
                          "linear-gradient(135deg, #4db6ac 0%, #26a69a 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #3d9e94 0%, #1e8e82 100%)",
                        },
                      }}
                    >
                      加入队伍
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Paper>
        </Fade>

        {/* 右侧 - 队伍成员 */}
        <Fade in timeout={900}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="600"
              sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
            >
              <PeopleIcon color="primary" />
              队伍成员
              <Chip
                label={`${team.members?.length || 0} 人`}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            </Typography>

            {team.members && team.members.length > 0 ? (
              <Stack spacing={1.5}>
                {team.members.map((member, index) => (
                  <Fade in timeout={300 + index * 100} key={member.id}>
                    <Paper
                      elevation={0}
                      onClick={() => navigate(`/users/${member.id}`)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: member.is_leader
                          ? "primary.light"
                          : "grey.200",
                        bgcolor: member.is_leader ? "primary.50" : "grey.50",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateX(4px)",
                          boxShadow: 2,
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: member.is_leader
                            ? "primary.main"
                            : "grey.400",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {member.is_leader ? <StarIcon /> : <PersonIcon />}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body1"
                          fontWeight={member.is_leader ? 600 : 400}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {member.nick_name || "未命名用户"}
                        </Typography>
                        {member.is_leader && (
                          <Typography variant="caption" color="primary.main">
                            队长
                          </Typography>
                        )}
                      </Box>
                      {member.is_leader && (
                        <Chip
                          icon={<StarIcon />}
                          label="队长"
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Paper>
                  </Fade>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <PeopleIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">暂无成员信息</Typography>
              </Box>
            )}
          </Paper>
        </Fade>
      </Box>

      {/* 邀请码弹窗 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            pb: 1,
            pt: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 56,
              height: 56,
              mb: 1,
            }}
          >
            <VpnKeyIcon fontSize="large" />
          </Avatar>
          队伍邀请码
        </DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            mt={1}
            mb={2}
          >
            {invitationCode ? (
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  border: "2px dashed",
                  borderColor: "primary.light",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "primary.50",
                    borderColor: "primary.main",
                  },
                }}
                onClick={handleCopy}
              >
                <Typography
                  variant="h6"
                  sx={{
                    wordBreak: "break-all",
                    flex: 1,
                    fontFamily: "monospace",
                    letterSpacing: 2,
                    fontWeight: 600,
                  }}
                >
                  {invitationCode}
                </Typography>
                <Tooltip title="点击复制">
                  <IconButton color="primary" sx={{ ml: 1 }}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Paper>
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <CircularProgress size={24} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  暂无可用邀请码，请稍后重试
                </Typography>
              </Box>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, textAlign: "center" }}
            >
              将此邀请码分享给队友，即可加入队伍
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(false)}
            sx={{
              borderRadius: 2,
              px: 4,
              background: "linear-gradient(135deg, #4db6ac 0%, #26a69a 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #3d9e94 0%, #1e8e82 100%)",
              },
            }}
          >
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteIcon color="error" />
          确认删除队伍
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            删除后将无法恢复，确定要删除该队伍吗？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={deleting}
            sx={{ borderRadius: 2 }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {deleting ? "删除中..." : "确认删除"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 退出确认弹窗 */}
      <Dialog
        open={quitOpen}
        onClose={() => !quitting && setQuitOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LogoutIcon color="warning" />
          确认退出队伍
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            退出后需要重新输入邀请码才能加入，确定要退出该队伍吗？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setQuitOpen(false)}
            disabled={quitting}
            sx={{ borderRadius: 2 }}
          >
            取消
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={async () => {
              setQuitting(true);
              await handleQuit();
              setQuitting(false);
              setQuitOpen(false);
            }}
            disabled={quitting}
            sx={{ borderRadius: 2 }}
          >
            {quitting ? "正在退出..." : "确认退出"}
          </Button>
        </DialogActions>
      </Dialog>

      <EditTeamDialog
        open={editDialogOpen}
        initialValues={editForm}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleSubmitEdit}
      />

      {/* 提示框 */}
      {/* <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar> */}
    </Box>
  );
};

export default TeamDetail;
