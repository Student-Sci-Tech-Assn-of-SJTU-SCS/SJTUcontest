import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTeamDetail } from "../../services/TeamServices";
import {
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import dayjs from "dayjs";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const TeamDetail = () => {
  const { team_id } = useParams();
  const [teamInfo, setTeamInfo] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [currentUserId] = useState("user_123"); // 模拟当前用户ID
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 获取队伍详情
  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const data = await getTeamDetail(team_id);
        setTeamInfo(data);
      } catch (err) {
        setError("加载队伍详情失败");
        console.error("加载队伍详情失败:", err);
      }
    };
    fetchTeamInfo();
  }, [team_id]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!teamInfo) return <Typography>加载中...</Typography>;

  // 核心身份判断逻辑
  const currentMember = teamInfo.members.find((m) => m.id === currentUserId);
  const isLeader = currentMember?.is_leader || false;
  const isMember = !!currentMember;
  const isRecruitmentClosed = dayjs().isAfter(dayjs(teamInfo.recruitment_deadline));

  // 复制邀请码
  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(teamInfo.invite_code);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">{teamInfo.name}</Typography>
      <Typography variant="subtitle1" gutterBottom>
        {teamInfo.introduction}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body1">
        <strong>参赛赛事：</strong>
        {teamInfo.contest}
      </Typography>
      <Typography variant="body1">
        <strong>人数：</strong>
        {teamInfo.existing_members} / {teamInfo.expected_members}
      </Typography>
      <Typography variant="body1">
        <strong>招募截止日期：</strong>
        {dayjs(teamInfo.recruitment_deadline).format("YYYY-MM-DD")}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">队员列表：</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {teamInfo.members.map((member) => (
          <Chip
            key={member.id}
            label={`${member.nick_name}${member.is_leader ? "（队长）" : ""}`}
            color={member.id === currentUserId ? "primary" : "default"}
            clickable
            component="a"
            href={`/user/${member.id}`}
          />
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 操作按钮区域 */}
      <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
        {isLeader ? (
          <>
            {!isRecruitmentClosed && (
              <Button variant="contained" onClick={() => setShowInviteCode(true)}>
                获取邀请码
              </Button>
            )}
            <Button variant="contained" onClick={() => alert("跳转编辑页面")}>
              编辑队伍
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (window.confirm("确定要解散队伍吗？")) {
                  alert("解散队伍成功");
                }
              }}
            >
              解散队伍
            </Button>
          </>
        ) : isMember ? (
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (window.confirm("确定要退出队伍吗？")) {
                alert("退出队伍成功");
              }
            }}
          >
            退出队伍
          </Button>
        ) : !isRecruitmentClosed ? (
          <>
            <TextField
              label="邀请码"
              size="small"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              onClick={() => {
                if (!inviteCode) {
                  alert("请输入邀请码");
                  return;
                }
                alert(`使用邀请码 ${inviteCode} 申请加入`);
              }}
            >
              申请加入
            </Button>
          </>
        ) : (
          <Typography color="text.secondary">招募已截止</Typography>
        )}
      </Box>

      {/* 邀请码弹窗（仅队长可见） */}
      <Dialog open={showInviteCode} onClose={() => setShowInviteCode(false)}>
        <DialogTitle>队伍邀请码</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            将此邀请码分享给新成员：
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField value={teamInfo.invite_code} size="small" InputProps={{ readOnly: true }} />
            <Button startIcon={<ContentCopyIcon />} onClick={handleCopyInviteCode}>
              复制
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInviteCode(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="邀请码已复制到剪贴板"
      />
    </Box>
  );
};

export default TeamDetail;
