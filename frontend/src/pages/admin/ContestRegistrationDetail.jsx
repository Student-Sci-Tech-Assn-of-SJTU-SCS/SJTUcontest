import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import { contestAPI } from "../../services/ContestServices";

const getErrorMessage = (error, fallback) => {
  const resp = error?.response?.data;
  if (resp?.data && typeof resp.data === "object") {
    const firstKey = Object.keys(resp.data)[0];
    const firstVal = resp.data[firstKey];
    if (Array.isArray(firstVal) && firstVal.length > 0) {
      return `${resp.message || fallback}：${firstVal[0]}`;
    }
    if (typeof firstVal === "string") {
      return `${resp.message || fallback}：${firstVal}`;
    }
  }
  return resp?.message || resp?.detail || error?.message || fallback;
};

const formatDateTime = (value) => {
  if (!value) return "未设置";
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ContestRegistrationDetail = () => {
  const { contest_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contest, setContest] = useState(null);
  const [teams, setTeams] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const fetchRegistrationTeams = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await contestAPI.getContestRegistrationTeams(
          contest_id,
          pageIndex,
          pageSize,
        );

        if (res.success) {
          setContest(res.data?.contest || null);
          setTeams(res.data?.teams || []);
          setPageCount(res.data?.total_pages || 0);
        } else {
          setError(res.message || "获取报名详情失败");
        }
      } catch (err) {
        setError(getErrorMessage(err, "获取报名详情失败"));
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationTeams();
  }, [contest_id, pageIndex]);

  return (
    <Box
      sx={{
        px: 5,
        py: 5,
        transition: "width 0.5s ease",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/view-contests")}
        >
          返回比赛管理
        </Button>
      </Box>

      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
      >
        报名详情
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />

      {contest && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <EmojiEventsIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {contest.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                当前展示正在报名/招募且尚未满员的队伍
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : teams.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            color: "text.secondary",
          }}
        >
          <GroupsIcon sx={{ fontSize: 56, opacity: 0.35, mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            暂无正在报名/招募的队伍
          </Typography>
          <Typography variant="body2">
            当前没有符合“招募截止时间未过且队伍未满员”的队伍。
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {teams.map((team) => {
            const completed = Boolean(team.official_registration_completed);
            const members = team.members || [];

            return (
              <Card
                key={team.id}
                elevation={0}
                sx={{
                  position: "relative",
                  border: "1px solid",
                  borderColor: completed ? "success.light" : "divider",
                  bgcolor: completed ? "rgba(46, 125, 50, 0.04)" : "white",
                  borderRadius: 2,
                }}
              >
                {completed && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="已报名"
                    color="success"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      fontWeight: 600,
                    }}
                  />
                )}

                <CardContent sx={{ p: 3, pr: completed ? 12 : 3 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {team.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.75,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {team.introduction || "暂无队伍简介"}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        icon={<GroupsIcon />}
                        label={`${team.existing_members} / ${team.expected_members} 人`}
                        variant="outlined"
                        color="primary"
                        size="small"
                      />
                      <Chip
                        icon={<EventIcon />}
                        label={`招募截止：${formatDateTime(team.recruitment_deadline)}`}
                        variant="outlined"
                        size="small"
                      />
                      {!completed && (
                        <Chip
                          label="未标记官网报名"
                          size="small"
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      )}
                    </Stack>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        队长/成员
                      </Typography>
                      {members.length > 0 ? (
                        <Stack spacing={1}>
                          {members.map((member) => {
                            const accountText =
                              member.email || member.username || "未填写邮箱";

                            return (
                              <Paper
                                key={member.id}
                                elevation={0}
                                sx={{
                                  p: 1.25,
                                  border: "1px solid",
                                  borderColor: member.is_leader
                                    ? "primary.light"
                                    : "divider",
                                  borderRadius: 1.5,
                                  bgcolor: member.is_leader
                                    ? "rgba(25, 118, 210, 0.04)"
                                    : "grey.50",
                                }}
                              >
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1}
                                  alignItems={{ xs: "flex-start", sm: "center" }}
                                  justifyContent="space-between"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{ minWidth: 0 }}
                                  >
                                    <PersonIcon
                                      fontSize="small"
                                      color={member.is_leader ? "primary" : "action"}
                                    />
                                    <Typography
                                      variant="body2"
                                      fontWeight={member.is_leader ? 600 : 500}
                                      sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {member.nick_name || "未命名用户"}
                                    </Typography>
                                    {member.is_leader && (
                                      <Chip
                                        label="队长"
                                        color="primary"
                                        size="small"
                                        sx={{ height: 22 }}
                                      />
                                    )}
                                  </Stack>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      fontFamily: "monospace",
                                      wordBreak: "break-all",
                                    }}
                                  >
                                    {member.email
                                      ? `邮箱：${accountText}`
                                      : `用户名：${accountText}`}
                                  </Typography>
                                </Stack>
                              </Paper>
                            );
                          })}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          暂无成员信息
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}

          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
              <Pagination
                count={pageCount}
                page={pageIndex}
                color="primary"
                onChange={(_, value) => setPageIndex(value)}
              />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ContestRegistrationDetail;
