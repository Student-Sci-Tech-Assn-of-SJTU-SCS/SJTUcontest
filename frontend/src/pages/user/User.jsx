import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Pagination,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from "@mui/material";
import { InfoOutline } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useConfirm } from "material-ui-confirm";
import { userAPI } from "../../services/UserServices";
import { getCurrentUser } from "../../utils/auth";
import TeamCard from "../../components/team/TeamCard";
import { styleInnerScrollBar } from "../../styles/styles";
import showMessage from "../../utils/message";

export default function User() {
  const { user_id } = useParams();
  const theme = useTheme();
  const confirm = useConfirm();

  const [userIdentity, setUserIdentity] = useState("");
  const [userNickname, setNickname] = useState("");
  const [userExperience, setExperience] = useState("");
  const [userSpecialty, setSpecialty] = useState("");

  const [userTeams, setUserTeams] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 受控 tooltip 状态（focus 显示，blur 隐藏）
  const [expTooltipOpen, setExpTooltipOpen] = useState(false);
  const [specTooltipOpen, setSpecTooltipOpen] = useState(false);

  useEffect(() => {
    if (user_id == getCurrentUser().id) {
      setUserIdentity("me");
      console.log(`This is me.`);
    } else {
      setUserIdentity("other");
      console.log(`This is someone else.`);
    }
  }, [user_id]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const controller = new AbortController();
      setLoading(true);

      try {
        const res = await userAPI.getUserProfile(user_id, {
          signal: controller.signal,
        });

        if (res.success) {
          setNickname(res.data.nick_name);
          setExperience(res.data.experience);
          setSpecialty(res.data.advantage);
        } else {
          showMessage(
            `获取用户信息失败：${res.message || "未知错误。"}`,
            "error",
          );
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage(`网络错误，请稍后再试：${err}`, "error");
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    };

    fetchUserProfile();
  }, [user_id]);

  useEffect(() => {
    if (userIdentity !== "me") {
      setUserTeams([]);
      return;
    }

    const fetchUserTeams = async () => {
      const controller = new AbortController();
      setLoading(true);

      try {
        const res = await userAPI.getUserTeams(pageIndex, pageSize, {
          signal: controller.signal,
        });

        if (res.success) {
          setUserTeams(res.data.teams || []);
          console.log(userTeams);
          setPageCount(res.data.total_pages);
          console.log(pageCount);
        } else {
          showMessage(
            `获取用户队伍失败：${res.message || "未知错误。"}`,
            "error",
          );
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage(`网络错误，请稍后再试：${err}`, "error");
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    };

    fetchUserTeams();
  }, [userIdentity]);

  const handleSave = async () => {
    const { confirmed, reason } = await confirm({
      title: "确认保存",
      description: `确定要保存修改吗？每 1 小时仅能修改一次。`,
      confirmationText: "保存",
      cancellationText: "取消",
    });

    if (!confirmed) {
      console.log("用户取消保存");
      return;
    }
    console.log("用户确认保存");

    const updateProfile = async () => {
      const controller = new AbortController();
      setSaving(true);

      try {
        const res = await userAPI.updateProfile(
          userNickname,
          userExperience,
          userSpecialty,
          {
            signal: controller.signal,
            validateStatus(status) {
              return (status >= 200 && status < 300) || status === 400;
            },
          },
        );
        console.log(res.message);
        if (res.success) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedStoredUser = JSON.parse(storedUser);
            const updatedUser = {
              ...parsedStoredUser,
              nick_name: userNickname,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
          showMessage("用户信息已更新！", "success");
          location.reload();
        } else {
          showMessage(
            `更新用户信息失败：${res.message || "未知错误。"}`,
            "error",
          );
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage(`网络错误，请稍后再试：${err}`, "error");
      } finally {
        setSaving(false);
      }

      return () => controller.abort();
    };

    updateProfile();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size="lg" value={25} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
      }}
    >
      <Card
        elevation={6}
        sx={{
          maxWidth: 700,
          mx: "auto",
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.08)}`,
          backdropFilter: "blur(10px)",
          position: "relative",
        }}
      >
        <CardContent>
          {/* 标题区域 */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: `linear-gradient(135deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 2,
                mb: 2,
                textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.12)}`,
              }}
            >
              {userIdentity === "me" ? "个人" : "用户"}主页
            </Typography>
            <Divider
              sx={{
                my: 2,
                mx: "auto",
                width: 80,
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.light}, 
                  ${theme.palette.secondary.main})`,
              }}
            />
          </Box>

          {/* 信息表单区域 */}
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              mt: 2,
              mb: 2,
            }}
          >
            <TextField
              label="昵称"
              value={userNickname || ""}
              placeholder="您的昵称不能为空哦！"
              onChange={(e) => setNickname(e.target.value)}
              variant="outlined"
              fullWidth
              slotProps={{
                input: {
                  readOnly: userIdentity !== "me",
                },
              }}
              sx={{
                borderRadius: 3,
                background: alpha(theme.palette.primary.main, 0.02),
              }}
            />
            <Tooltip
              title={
                <Box
                  component="div"
                  sx={{
                    display: "block",
                    whiteSpace: "pre-line",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  在这里填写您的参赛经历和获奖情况吧！
                  {"\n"}
                  已输入 {userExperience?.length || 0}/500 字
                </Box>
              }
              placement="right"
              arrow
              enterDelay={0}
              disableHoverListener
              disableTouchListener
              slotProps={{
                popper: {
                  modifiers: [
                    { name: "flip", enabled: false },
                    { name: "preventOverflow", options: { padding: 8 } },
                  ],
                },
              }}
              open={expTooltipOpen}
            >
              <TextField
                label="参赛经历 / 获奖情况"
                value={userExperience || ""}
                placeholder="空空如也……"
                onChange={(e) => setExperience(e.target.value)}
                onFocus={() => {
                  if (userIdentity === "me")
                    setExpTooltipOpen(true);
                }}
                onBlur={() => {
                  if (userIdentity === "me")
                    setExpTooltipOpen(false);
                }}
                multiline
                minRows={3}
                maxRows={10}
                variant="outlined"
                fullWidth
                // disabled={userIdentity !== "me"}
                slotProps={{
                  input: {
                    readOnly: userIdentity !== "me",
                  },
                  htmlInput: {
                    maxLength: 500,
                  }
                }}
                sx={{
                  borderRadius: 3,
                  background: alpha(theme.palette.primary.main, 0.02),
                  ...styleInnerScrollBar(theme),
                }}
              />
            </Tooltip>
            <Tooltip
              title={
                <Box
                  component="div"
                  sx={{
                    display: "block",
                    whiteSpace: "pre-line",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  在这里展示您的优势和特长吧！
                  {"\n"}
                  已输入 {userSpecialty?.length || 0}/500 字
                </Box>
              }
              placement="right"
              arrow
              enterDelay={0}
              disableHoverListener
              disableTouchListener
              slotProps={{
                popper: {
                  modifiers: [
                    { name: "flip", enabled: false },
                    { name: "preventOverflow", options: { padding: 8 } },
                  ],
                },
              }}
              open={specTooltipOpen}
            >
              <TextField
                label="特长"
                value={userSpecialty || ""}
                placeholder="空空如也……"
                onChange={(e) => setSpecialty(e.target.value)}
                onFocus={() => {
                  if (userIdentity === "me")
                    setSpecTooltipOpen(true);
                }}
                onBlur={() => {
                  if (userIdentity === "me")
                    setSpecTooltipOpen(false);
                }}
                multiline
                minRows={3}
                maxRows={10}
                variant="outlined"
                fullWidth
                // disabled={userIdentity !== "me"}
                slotProps={{
                  input: {
                    readOnly: userIdentity !== "me",
                  },
                  htmlInput: {
                    maxLength: 500,
                  }
                }}
                sx={{
                  borderRadius: 3,
                  background: alpha(theme.palette.primary.main, 0.02),
                  ...styleInnerScrollBar(theme),
                }}
              />
            </Tooltip>

            {/* 保存按钮 */}
            {userIdentity === "me" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                size="medium"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  mx: "auto",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.15)}`,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main} 0%, 
                    ${theme.palette.primary.dark} 100%)`,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.22)}`,
                  },
                }}
              >
                保存修改
              </Button>
            )}
          </Box>

          {/* 队伍区域 */}
          {userIdentity === "me" && (
            <>
              <Divider
                sx={{
                  my: 4,
                  mx: "auto",
                  width: 120,
                  height: 4,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, 
                    ${theme.palette.primary.light}, 
                    ${theme.palette.secondary.main})`,
                }}
              />

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, 
                        ${theme.palette.primary.main} 0%, 
                        ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    我参加的队伍
                  </Typography>
                  <Tooltip title="仅自己可见" placement="right">
                    <InfoOutline
                      sx={{
                        fontSize: "1.3rem",
                        color: theme.palette.primary.main,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          color: theme.palette.secondary.main,
                          transform: "scale(1.15)",
                        },
                      }}
                    />
                  </Tooltip>
                </Box>
                <Grid container spacing={3}>
                  {userTeams.length === 0 ? (
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
                          sx={{ fontSize: "1.1rem" }}
                        >
                          没有参加的队伍
                        </Typography>
                      </Box>
                    </Grid>
                  ) : (
                    userTeams.map((team) => (
                      <Grid size={12} key={team.id}>
                        <TeamCard team={team} />
                      </Grid>
                    ))
                  )}
                </Grid>
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
        </CardContent>
      </Card>
    </Box>
  );
}
