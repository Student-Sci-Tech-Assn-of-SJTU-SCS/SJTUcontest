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
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import { teamAPI } from "../../services/TeamServices";
import { contestAPI } from "../../services/MatchServices";

import EditTeamDialog from "../../components/team/EditTeamDialog";

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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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
      setSnackbar({
        open: true,
        message: "加载队伍信息失败",
        severity: "error",
      });
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
      setSnackbar({ open: true, message: "成功加入队伍", severity: "success" });
      await fetchTeamData();
    } catch (error) {
      setSnackbar({ open: true, message: "加入队伍失败", severity: "error" });
    }
  };

  const handleQuit = async () => {
    try {
      await teamAPI.leaveTeam(team_id);
      setSnackbar({ open: true, message: "已退出队伍", severity: "success" });
      setIsMember(false);
      await fetchTeamData();
    } catch (error) {
      setSnackbar({ open: true, message: "退出失败", severity: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await teamAPI.deleteTeam(team_id);
      setSnackbar({ open: true, message: "队伍已删除", severity: "success" });
      const target = team?.contest
        ? `/matches/${team.contest}/teams`
        : "/teams";
      navigate(target, { replace: true });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "删除失败";
      setSnackbar({ open: true, message: msg, severity: "error" });
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

    setSnackbar({
      open: true,
      message: "更新成功",
      severity: "success",
    });

    const updated = await teamAPI.getTeamDetail(team_id);
    setTeam(updated.data);

    return null;
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleFetchInvitationCode = async () => {
    try {
      const res = await teamAPI.getTeamInvitationCode(team_id);
      setInvitationCode(res.data?.invitation_code || "");
      setDialogOpen(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "获取邀请码失败",
        severity: "error",
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(invitationCode);
    setSnackbar({
      open: true,
      message: "邀请码已复制",
      severity: "success",
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!team) {
    return (
      <Box mt={10} textAlign="center">
        <Typography variant="h6">未找到队伍信息</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={5} px={2}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Card variant="outlined" sx={{ position: "relative" }}>
          {(isLeader || (isMember && !isLeader)) && (
            <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
              <Stack direction="row" spacing={1}>
                {isLeader && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
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
                    >
                      编辑
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteOpen(true)}
                      disabled={deleting}
                    >
                      删除队伍
                    </Button>
                  </>
                )}
                {isMember && !isLeader && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={() => setQuitOpen(true)}
                  >
                    退出
                  </Button>
                )}
              </Stack>
            </Box>
          )}

          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="bold"
              color="primary"
            >
              {team.name}
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              {team.introduction || "暂无队伍简介"}
            </Typography>

            <Box mt={2}>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  比赛名称
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                  {contestName || team.contest}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  当前人数
                </Typography>
                <Typography variant="body1">
                  {team.existing_members} / {team.expected_members}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  截止日期
                </Typography>
                <Typography variant="body1">
                  {new Date(team.recruitment_deadline).toLocaleDateString(
                    "zh-CN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </Typography>
              </Box>
              {isLeader && (
                <Box mb={2}>
                  <Button
                    variant="outlined"
                    onClick={handleFetchInvitationCode}
                  >
                    获取邀请码
                  </Button>
                </Box>
              )}
            </Box>

            {!isMember && !isLeader && (
              <Stack direction="row" spacing={2} flexWrap="wrap" mt={3}>
                <TextField
                  size="small"
                  label="邀请码"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<GroupAddIcon />}
                  onClick={handleJoin}
                >
                  加入队伍
                </Button>
              </Stack>
            )}

            {/* 队伍成员列表 */}
            <Box mt={4}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                队伍成员
              </Typography>

              {team.members && team.members.length > 0 ? (
                <Stack spacing={1}>
                  {team.members.map((member) => (
                    <Box
                      key={member.id}
                      onClick={() => navigate(`/users/${member.id}`)}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                        "&:hover": { backgroundColor: "#eeeeee" },
                      }}
                      aria-label={`查看 ${member.nick_name || "未命名用户"} 的个人资料`}
                      role="button"
                    >
                      <Typography variant="body1">
                        {member.nick_name || "未命名用户"}
                      </Typography>
                      {member.is_leader && (
                        <Typography
                          variant="caption"
                          color="primary"
                          fontWeight="bold"
                        >
                          队长
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暂无成员信息
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Paper>

      {/* 邀请码弹窗 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>队伍邀请码</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" mt={1}>
            <Typography sx={{ wordBreak: "break-all", flex: 1, mr: 2 }}>
              {invitationCode || "暂无邀请码"}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleCopy}
              startIcon={<ContentCopyIcon />}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>删除后将无法恢复，确定要删除该队伍吗？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
            取消
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "删除中..." : "删除"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 退出确认弹窗 */}
      <Dialog open={quitOpen} onClose={() => !quitting && setQuitOpen(false)}>
        <DialogContent>
          <Typography>确定要退出该队伍吗？</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              setQuitting(true);
              await handleQuit();
              setQuitting(false);
              setQuitOpen(false);
            }}
            disabled={quitting}
          >
            {quitting ? "正在退出..." : "退出"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setQuitOpen(false)}
            disabled={quitting}
          >
            取消
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
      <Snackbar
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
      </Snackbar>
    </Box>
  );
};

export default TeamDetail;
