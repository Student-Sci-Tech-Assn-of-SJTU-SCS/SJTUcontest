import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Link,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { contestAPI } from "../../services/MatchServices";
import TagGroup from "../../components/TagGroup";
import { nameToTag } from "../../components/Tag";

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

export default function MatchDetail() {
  const { match_id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regTime, setRegTime] = useState("");
  const navigate = useNavigate();

  const getTimeStr = (t) =>
    `${t.getFullYear()}年${t.getMonth()}月${t.getDate()}日${t.getHours()}:${t.getMinutes()}`;

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
    const fetchMatchDetail = async () => {
      const controller = new AbortController();
      setLoading(true);
      setError("");

      try {
        const res = await contestAPI.getContestDetail(match_id);

        if (res.success) {
          setMatch(res.data);
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

    fetchMatchDetail();
  }, [match_id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!match) {
    return (
      <Typography color="error" align="center" sx={{ mt: 4 }}>
        未能加载比赛信息。
      </Typography>
    );
  }

  return (
    <Card elevation={3} sx={{ p: 2, my: 5 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {match.name}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body1">
              <strong>报名时间:</strong>{" "}
              {getRegTime(match.registration_start, match.registration_end)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body1">
              <strong>地点:</strong> {match.place}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body1">
              <strong>赛事级别:</strong> {nameToTag(match.level).description}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body1">
              <strong>素拓等级:</strong> {nameToTag(match.quality).description}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <SectionTitle variant="h6">简介</SectionTitle>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {match.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <SectionTitle variant="h6">关键词</SectionTitle>
          <Box sx={{ width: "fit-content" }}>
            <TagGroup
              tags={match.keywords.map((keyword) => nameToTag(keyword))}
            />
          </Box>
        </Box>

        {match.website && (
          <Box sx={{ mb: 3 }}>
            <SectionTitle variant="h6">官网链接</SectionTitle>
            <Link href={match.website} target="_blank" rel="noopener">
              {match.website}
            </Link>
          </Box>
        )}

        {match.materials.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <SectionTitle variant="h6">学习资料</SectionTitle>
            <Stack spacing={1}>
              {match.materials.map((m) => (
                <Link
                  key={m.url}
                  href={m.url}
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                >
                  {m.name}
                </Link>
              ))}
            </Stack>
          </Box>
        )}

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(`/teams/${match.id}/`)}
          >
            寻找参赛团队
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
