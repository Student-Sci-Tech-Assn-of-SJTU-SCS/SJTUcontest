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
  Typography,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI } from "../../services/UserServices";
import { getCurrentUser } from "../../utils/auth";

export default function User() {
  const { user_id } = useParams();
  const [userIdentity, setUserIdentity] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [userNickname, setNickname] = useState("");
  const [userExperience, setExperience] = useState("");
  const [userSpecialty, setSpecialty] = useState("");

  const [userTeams, setUserTeams] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user_id == getCurrentUser().id) {
      setUserIdentity("me");
    } else {
      setUserIdentity("other");
    }
    console.log(userIdentity);
  }, [user_id]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const controller = new AbortController();
      setLoading(true);
      setError("");

      try {
        const res = await userAPI.getUserProfile(user_id);

        if (res.success) {
          // setUserProfile(res.data);
          setNickname(res.data.nick_name);
          setExperience(res.data.experience);
          setSpecialty(res.data.advantage);
        } else {
          setError(res.message || "Unknown error.");
          console.log(error);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("Network error.");
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
      setError("");

      try {
        const res = await userAPI.getUserTeams(pageIndex, pageSize);

        console.log(res.data.teams);

        if (res.success) {
          setUserTeams(res.data.teams || []);
          console.log(userTeams);
          setPageCount(res.data.total_pages);
          console.log(pageCount);
        } else {
          setError(res.message || "Unknown error.");
          console.log(error);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("Network error.");
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
      setError("");

      try {
        const res = await userAPI.updateProfile(
          userNickname,
          userExperience,
          userSpecialty
        );
        if (res.success) {
          console.log("User profile successfully updated!");
        } else {
          console.log(res.message || "User profile update failed!");
        }
      } catch {
        console.log("Network error!");
      } finally {
        setSaving(false);
        // location.reload(true);
      }

      return () => controller.abort();
    }

    updateProfile();
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size="lg" value={25} />
      </Box>
    );
  }

  // if (!loading && !userProfile) {
  //   return (
  //     <Typography color="error" align="center" sx={{ mt: 5 }}>
  //       未能加载用户信息。
  //     </Typography>
  //   );
  // }

  return (
    <Card elevation={3} sx={{ p: 2, my: 5 }}>
      <CardContent>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            flexDirection: "row",
            flexWrap: {
              xs: "wrap",
              sm: "nowrap",
            },
            rowGap: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mr: 2,
              width: "fit-content",
              fontWeight: 700,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            个人主页
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />
        </Box>

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 4,
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
          />
          <TextField
            label="参赛经历 / 所获奖项"
            value={userExperience || ""}
            placeholder="在这里填写您的参赛经历吧！"
            onChange={(e) => setExperience(e.target.value)}
            multiline
            minRows={3}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="特长"
            value={userSpecialty || ""}
            placeholder="在这里填写您的特长吧！"
            onChange={(e) => setSpecialty(e.target.value)}
            multiline
            minRows={2}
            variant="outlined"
            fullWidth
          />
        </Box>

        {userIdentity === "me" && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ alignSelf: "flex-start", mt: 1 }}
          >
            保存修改
          </Button>
        )}

        {userIdentity === "me" &&
          <>
            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                我参加的队伍
              </Typography>
              <Grid container spacing={2}>
                {userTeams.length === 0 ? (
                  <Grid key={"no_team"} size={12}>
                    <Typography
                      key={"no_team"}
                      color="text.secondary"
                      align="center"
                      sx={{ mt: 8 }}
                    >
                      没有参加的队伍
                    </Typography>
                  </Grid>
                ) : (
                  userTeams.map((team) => (
                    <Grid key={team.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      {/* TeamCard 待设计 */}
                      <Card elevation={2} sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            noWrap
                            sx={{
                              mb: 1,
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {team.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1.6 }}
                          >
                            {team.introduction}
                          </Typography>
                        </CardContent>
                      </Card>
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
        }
      </CardContent>
    </Card>
  );
}
