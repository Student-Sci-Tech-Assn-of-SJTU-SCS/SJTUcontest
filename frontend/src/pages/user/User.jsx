import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Pagination,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useTheme, alpha } from "@mui/material";
import { userAPI } from "../../services/UserServices";
import { getCurrentUser } from "../../utils/auth";
import TeamCard from "../../components/team/TeamCard";
import { styleInnerScrollBar } from "../../styles/styles";
import showMessage from "../../utils/message";

export default function User() {
  const { user_id } = useParams();
  const theme = useTheme();

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
  // const [message, setMessage] = useState({
  //   open: false,
  //   text: "",
  //   severity: "success",
  // });

  useEffect(() => {
    if (user_id == getCurrentUser().id) {
      setUserIdentity("me");
    } else {
      setUserIdentity("other");
    }
    console.log(`This is ${userIdentity}`);
  }, [user_id]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const controller = new AbortController();
      setLoading(true);

      try {
        const res = await userAPI.getUserProfile(user_id);

        if (res.success) {
          setNickname(res.data.nick_name);
          setExperience(res.data.experience);
          setSpecialty(res.data.advantage);
        } else {
          showMessage(`获取用户信息失败：${res.message || "未知错误。"}`, "error");
          // setMessage({
          //   open: true,
          //   text: `获取用户信息失败：${res.message || "未知错误。"}`,
          //   severity: "error",
          // });
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage(`网络错误，请稍后再试：${err}`, "error");
        // setMessage({
        //   open: true,
        //   text: `网络错误，请稍后再试。`,
        //   severity: "error",
        // });
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
        const res = await userAPI.getUserTeams(pageIndex, pageSize);

        if (res.success) {
          setUserTeams(res.data.teams || []);
          console.log(userTeams);
          setPageCount(res.data.total_pages);
          console.log(pageCount);
        } else {
          showMessage(`获取用户队伍失败：${res.message || "未知错误。"}`, "error");
          // setMessage({
          //   open: true,
          //   text: `获取用户队伍失败：${res.message || "未知错误。"}`,
          //   severity: "error",
          // });
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage(`网络错误，请稍后再试：${err}`, "error");
        // setMessage({
        //   open: true,
        //   text: `网络错误，请稍后再试。`,
        //   severity: "error",
        // });
        // console.log(`${message.severity}: ${message.text}`);
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    };

    fetchUserTeams();
  }, [userIdentity]);

  const handleSave = async () => {
    const updateProfile = async () => {
      const controller = new AbortController();
      setSaving(true);

      try {
        const res = await userAPI.updateProfile(
          userNickname,
          userExperience,
          userSpecialty,
        );
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
          // setMessage({
          //   open: true,
          //   text: `用户信息已更新！`,
          //   severity: "success",
          // });
        } else {
          showMessage(`更新用户信息失败：${res.message || "未知错误。"}`, "error");
          // setMessage({
          //   open: true,
          //   text: `更新用户信息失败：${res.message || "未知错误。"}`,
          //   severity: "error",
          // });
        }
      } catch (err) {
        showMessage(`网络错误，请稍后再试：${err}`, "error");
        // setMessage({
        //   open: true,
        //   text: `网络错误，请稍后再试。`,
        //   severity: "error",
        // });
      } finally {
        setSaving(false);
        location.reload(true);
      }

      return () => controller.abort();
    };

    updateProfile();
  };

  // const handleCloseMessage = () => {
  //   setMessage({ ...message, open: false });
  // };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size="lg" value={25} />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          py: 6,
          background: `linear-gradient(180deg,
            ${theme.palette.background.paper} 0%,
            ${alpha(theme.palette.primary.main, 0.03)} 50%,
            ${theme.palette.background.paper} 100%)`,
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
                个人主页
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
              <TextField
                label="参赛经历 / 所获奖项"
                value={userExperience || ""}
                placeholder={
                  userIdentity === "me"
                    ? "在这里填写您的参赛经历吧！"
                    : "空空如也……"
                }
                onChange={(e) => setExperience(e.target.value)}
                multiline
                minRows={3}
                maxRows={10}
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
                  ...styleInnerScrollBar(theme),
                }}
              />
              <TextField
                label="特长"
                value={userSpecialty || ""}
                placeholder={
                  userIdentity === "me"
                    ? "在这里填写您的特长吧！"
                    : "空空如也……"
                }
                onChange={(e) => setSpecialty(e.target.value)}
                multiline
                minRows={2}
                maxRows={8}
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
                  ...styleInnerScrollBar(theme),
                }}
              />
            </Box>

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
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
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
                  <Grid container spacing={3}>
                    {userTeams.length === 0 ? (
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          color="text.secondary"
                          align="center"
                          sx={{ mt: 8, fontSize: "1.1rem" }}
                        >
                          没有参加的队伍
                        </Typography>
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
      {/* <Snackbar
        open={message.open}
        autoHideDuration={6000}
        onClose={handleCloseMessage}
      >
        <Alert
          onClose={handleCloseMessage}
          severity={message.severity}
          sx={{ width: "100%" }}
        >
          {message.text}
        </Alert>
      </Snackbar> */}
    </>
  );

  // return (
  //   <>
  //     <Card elevation={3} sx={{ p: 2, my: 5 }}>
  //       <CardContent>
  //         <Box
  //           sx={{
  //             mb: 2,
  //             display: "flex",
  //             flexDirection: "row",
  //             flexWrap: {
  //               xs: "wrap",
  //               sm: "nowrap",
  //             },
  //             rowGap: 1,
  //           }}
  //         >
  //           <Typography
  //             variant="h4"
  //             sx={{
  //               mr: 2,
  //               width: "fit-content",
  //               fontWeight: 700,
  //               whiteSpace: "nowrap",
  //               textOverflow: "ellipsis",
  //               overflow: "hidden",
  //             }}
  //           >
  //             个人主页
  //           </Typography>

  //           <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />
  //         </Box>

  //         <Box
  //           component="form"
  //           sx={{
  //             display: "flex",
  //             flexDirection: "column",
  //             gap: 2,
  //             mt: 4,
  //             mb: 2,
  //           }}
  //         >
  //           <TextField
  //             label="昵称"
  //             value={userNickname || ""}
  //             placeholder="您的昵称不能为空哦！"
  //             onChange={(e) => setNickname(e.target.value)}
  //             variant="outlined"
  //             fullWidth
  //             contentEditable={userIdentity === "me"}
  //           />
  //           <TextField
  //             label="参赛经历 / 所获奖项"
  //             value={userExperience || ""}
  //             placeholder={
  //               userIdentity === "me"
  //                 ? "在这里填写您的参赛经历吧！"
  //                 : "空空如也……"
  //             }
  //             onChange={(e) => setExperience(e.target.value)}
  //             multiline
  //             minRows={3}
  //             variant="outlined"
  //             fullWidth
  //             contentEditable={userIdentity === "me"}
  //           />
  //           <TextField
  //             label="特长"
  //             value={userSpecialty || ""}
  //             placeholder={
  //               userIdentity === "me" ? "在这里填写您的特长吧！" : "空空如也……"
  //             }
  //             onChange={(e) => setSpecialty(e.target.value)}
  //             multiline
  //             minRows={2}
  //             variant="outlined"
  //             fullWidth
  //             contentEditable={userIdentity === "me"}
  //           />
  //         </Box>

  //         {userIdentity === "me" && (
  //           <Button
  //             variant="contained"
  //             color="primary"
  //             onClick={handleSave}
  //             sx={{ alignSelf: "flex-start", mt: 1 }}
  //           >
  //             保存修改
  //           </Button>
  //         )}

  //         {userIdentity === "me" && (
  //           <>
  //             <Divider sx={{ my: 3 }} />

  //             <Box sx={{ mb: 3 }}>
  //               <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
  //                 我参加的队伍
  //               </Typography>
  //               <Grid container spacing={2}>
  //                 {userTeams.length === 0 ? (
  //                   <Grid key={"no_team"} size={12}>
  //                     <Typography
  //                       key={"no_team"}
  //                       color="text.secondary"
  //                       align="center"
  //                       sx={{ mt: 8 }}
  //                     >
  //                       没有参加的队伍
  //                     </Typography>
  //                   </Grid>
  //                 ) : (
  //                   userTeams.map((team) => (
  //                     <Grid key={team.id} size={{ xs: 12, sm: 6, md: 4 }}>
  //                       <TeamCard team={team} />
  //                     </Grid>
  //                   ))
  //                 )}
  //               </Grid>
  //             </Box>

  //             {pageCount > 1 && (
  //               <Box display="flex" justifyContent="center" mt={4}>
  //                 <Pagination
  //                   count={pageCount}
  //                   page={pageIndex}
  //                   onChange={(_, value) => setPageIndex(value)}
  //                   color="primary"
  //                   shape="rounded"
  //                 />
  //               </Box>
  //             )}
  //           </>
  //         )}
  //       </CardContent>
  //     </Card>
  //     <Snackbar
  //       open={message.open}
  //       autoHideDuration={6000}
  //       onClose={handleCloseMessage}
  //     >
  //       <Alert
  //         onClose={handleCloseMessage}
  //         severity={message.severity}
  //         sx={{ width: "100%" }}
  //       >
  //         {message.text}
  //       </Alert>
  //     </Snackbar>
  //   </>
  // );
}
