import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
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
        <CircularProgress size="lg" value={25} />
      </Box>
    );
  }

  if (!match) {
    return (
      <Typography color="error" align="center" sx={{ mt: 5 }}>
        未能加载比赛信息。
      </Typography>
    );
  }

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
            {match.name}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />

          <Box
            sx={{
              mr: 2,
              textAlign: "center",
              ml: { xs: "auto", sm: 0 },
              alignSelf: { xs: "flex-end", sm: "auto" },
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                width: "fit-content",
                whiteSpace: "nowrap",
              }}
              onClick={() => navigate(`/matches/${match.id}/teams`)}
            >
              寻找参赛团队
            </Button>
          </Box>
        </Box>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="body1"
              noWrap
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <strong>报名时间：</strong>{" "}
              {getRegTime(match.registration_start, match.registration_end)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="body1"
              noWrap
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <strong>地点：</strong> {match.place}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="body1"
              noWrap
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <strong>赛事级别：</strong> {nameToTag(match.level).description}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="body1"
              noWrap
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <strong>素拓等级：</strong> {nameToTag(match.quality).description}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <SectionTitle variant="h6">关键词</SectionTitle>
          <Box sx={{ width: "fit-content" }}>
            <TagGroup
              tags={match.keywords.map((keyword) => nameToTag(keyword))}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <SectionTitle variant="h6">简介</SectionTitle>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {match.description}
          </Typography>
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
      </CardContent>
    </Card>
  );
}
