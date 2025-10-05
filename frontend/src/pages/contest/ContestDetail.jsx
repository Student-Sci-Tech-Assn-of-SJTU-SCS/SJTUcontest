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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { contestAPI } from "../../services/ContestServices";
import TagGroup from "../../components/TagGroup";
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
    return `${getTimeStr(start)} — ${getTimeStr(end)}`;
  };

  useEffect(() => {
    const fetchContestDetail = async () => {
      const controller = new AbortController();
      setLoading(true);

      try {
        const res = await contestAPI.getContestDetail(contest_id, { signal: controller.signal });

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
        py: 0 /*background: alpha(theme.palette.background.paper, 0.98)*/,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={8}
          sx={{
            borderRadius: 6,
            p: { xs: 2, sm: 4 },
            mt: 8,
            mb: 6,
            boxShadow: `
              0 10px 40px ${alpha(theme.palette.primary.main, 0.1)},
              inset 0 1px 0 ${alpha(theme.palette.common.white, 0.5)}
            `,
            backdropFilter: "blur(10px)",
            position: "relative",
          }}
        >
          {/* 标题区 */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 2,
                textShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                mb: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {contest.name}
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 20,
                px: 5,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1.05rem",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-2px) scale(1.03)",
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
              }}
              onClick={() => navigate(`/contests/${contest.id}/teams`)}
            >
              寻找参赛团队
            </Button>
          </Box>

          {/* 赛事主要信息 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                <strong>报名时间：</strong>{" "}
                {getRegTime(
                  contest.registration_start,
                  contest.registration_end,
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                <strong>地点：</strong> {contest.place}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                <strong>赛事级别：</strong>{" "}
                {nameToTag(contest.level).description}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                <strong>素拓等级：</strong>{" "}
                {nameToTag(contest.quality).description}
              </Typography>
            </Grid>
          </Grid>

          <Divider
            sx={{
              my: 3,
              borderColor: alpha(theme.palette.primary.main, 0.15),
            }}
          />

          {/* 关键词区 */}
          <Box sx={{ mb: 3 }}>
            <SectionTitle variant="h6">关键词</SectionTitle>
            <Box sx={{ width: "fit-content" }}>
              <TagGroup
                tags={contest.keywords.map((keyword) => nameToTag(keyword))}
              />
            </Box>
          </Box>

          {/* 简介区 */}
          <Box sx={{ mb: 3 }}>
            <SectionTitle variant="h6">简介</SectionTitle>
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.7,
                fontSize: "1.08rem",
                color: alpha(theme.palette.text.primary, 0.95),
                mb: 1,
              }}
            >
              {contest.description}
            </Typography>
          </Box>

          {/* 官网链接 */}
          {contest.website && (
            <Box sx={{ mb: 3 }}>
              <SectionTitle variant="h6">官网链接</SectionTitle>
              <Link
                href={contest.website}
                target="_blank"
                rel="noopener"
                underline="hover"
                sx={{
                  fontWeight: 500,
                  fontSize: "1.05rem",
                  color: theme.palette.primary.main,
                  wordBreak: "break-all",
                  "&:hover": {
                    textDecoration: "underline",
                    color: theme.palette.secondary.main,
                  },
                }}
              >
                {contest.website}
              </Link>
            </Box>
          )}

          {/* 学习资料 */}
          {contest.materials.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <SectionTitle variant="h6">学习资料</SectionTitle>
              <Stack spacing={1}>
                {contest.materials.map((m) => (
                  <Link
                    key={m.url}
                    href={m.url}
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.secondary.main,
                      "&:hover": { color: theme.palette.primary.main },
                    }}
                  >
                    {m.name}
                  </Link>
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
