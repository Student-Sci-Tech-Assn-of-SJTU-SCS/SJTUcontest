import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  Link,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  alpha,
  useTheme,
  Container,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import LanguageIcon from "@mui/icons-material/Language";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import axios from "axios";
import { contestAPI } from "../../services/ContestServices";
import { nameToTag } from "../../components/Tag";
import showMessage from "../../utils/message";

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  fontWeight: 700,
  fontSize: "1.15rem",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  letterSpacing: 1,
}));

const InfoCard = ({ icon, label, value, valueSx }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: 4,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        },
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: "50%",
          bgcolor: "background.paper",
          color: "primary.main",
          display: "flex",
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          component="div"
          fontWeight="600"
          color="text.primary"
          sx={valueSx}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default function ContestDetail() {
  const { contest_id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  const getTimeStr = (t) =>
    `${t.getFullYear()}年${t.getMonth() + 1}月${t.getDate()}日${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;

  const getRegTime = (reg_start, reg_end) => {
    const start = new Date(reg_start);
    const end = new Date(reg_end);

    if (isNaN(start) && isNaN(end)) return "暂无";
    if (isNaN(start)) return `${getTimeStr(end)} 截止`;
    if (isNaN(end)) return `自 ${getTimeStr(start)} 起`;
    if (start.getTime() == end.getTime()) return "暂无";
    return (
      <Box sx={{ lineHeight: 1.5 }}>
        <Box component="span" display="block">
          {getTimeStr(start)} 起
        </Box>
        <Box component="span" display="block">
          {getTimeStr(end)} 止
        </Box>
      </Box>
    );
  };

  useEffect(() => {
    const fetchContestDetail = async () => {
      const controller = new AbortController();
      setLoading(true);

      try {
        const res = await contestAPI.getContestDetail(contest_id, {
          signal: controller.signal,
        });

        if (res.success) {
          setContest(res.data);
        } else {
          showMessage(
            `获取比赛信息失败：${res.message || "未知错误。"}`,
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

    fetchContestDetail();
  }, [contest_id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size="lg" value={25} />
      </Box>
    );
  }

  if (!contest) {
    return (
      <Typography color="error" align="center" sx={{ mt: 5 }}>
        未能加载比赛信息。
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
        // background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        {/* 顶部导航 */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main", bgcolor: "transparent" },
            }}
          >
            返回
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* 左侧主要内容 */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.02)}`,
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: "text.primary",
                  }}
                >
                  {contest.name}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 2 }}
                >
                  {contest.keywords.map((keyword) => (
                    <Chip
                      key={keyword}
                      label={nameToTag(keyword).description}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <SectionTitle
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <MenuBookIcon fontSize="small" /> 简介
                </SectionTitle>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: "text.secondary",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {contest.description}
                </Typography>
              </Box>

              {contest.materials.length > 0 && (
                <Box>
                  <SectionTitle
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <SchoolIcon fontSize="small" /> 参考资料
                  </SectionTitle>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {contest.materials.map((m) => (
                      <Paper
                        key={m.url}
                        component={Link}
                        href={m.url}
                        target="_blank"
                        rel="noopener"
                        underline="none"
                        elevation={0}
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          bgcolor: alpha(theme.palette.background.default, 0.5),
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          borderRadius: 2,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            borderColor: "primary.main",
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: "secondary.main",
                            display: "flex",
                          }}
                        >
                          <MenuBookIcon fontSize="small" />
                        </Box>
                        <Typography fontWeight="500" color="text.primary">
                          {m.name}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* 右侧侧边栏 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* 行动卡片 */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<GroupAddIcon />}
                onClick={() => navigate(`/contests/${contest.id}/teams`)}
                sx={{
                  py: 1.5,
                  borderRadius: 4,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              >
                寻找参赛团队
              </Button>

              {/* 信息网格 */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <InfoCard
                    icon={<CalendarTodayIcon />}
                    label="报名时间"
                    value={getRegTime(
                      contest.registration_start,
                      contest.registration_end,
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoCard
                    icon={<LocationOnIcon />}
                    label="地点"
                    value={contest.place}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoCard
                    icon={<WorkspacePremiumIcon />}
                    label="赛事级别"
                    value={nameToTag(contest.level).description}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoCard
                    icon={<AutoAwesomeIcon />}
                    label="素拓等级"
                    value={nameToTag(contest.quality).description}
                    valueSx={{ fontSize: "0.875rem" }}
                  />
                </Grid>
              </Grid>

              {/* 官网链接 */}
              {contest.website && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                    fontWeight="bold"
                  >
                    官方网站
                  </Typography>
                  <Link
                    href={contest.website}
                    target="_blank"
                    rel="noopener"
                    underline="none"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "primary.main",
                      fontWeight: 500,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    <LanguageIcon fontSize="small" />
                    <Typography noWrap>{contest.website}</Typography>
                  </Link>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
