import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Chip, Button, Stack, Link, CircularProgress } from '@mui/material';

import api from "../../utils/api";

export default function MatchDetail() {
  const { match_id } = useParams();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/matches/${match_id}/`)
      .then(res => {
        if (res.success) {
          setMatch(res.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch match:", err);
      })
      .finally(() => setLoading(false));
  }, [match_id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!match) {
    return <Typography color="error">未能加载比赛信息。</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        {match.name}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        时间：{match.registration_start} - {match.registration_end}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        地点：{match.place}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        赛事级别：{match.level} | 素拓等级：{match.quality}
      </Typography>

      <Box sx={{ my: 2 }}>
        <Typography variant="h6">简介</Typography>
        <Typography variant="body1">{match.description}</Typography>
      </Box>

      <Box sx={{ my: 2 }}>
        <Typography variant="h6">关键词</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {match.keywords.map((kw) => (
            <Chip key={kw} label={kw} variant="outlined" />
          ))}
        </Stack>
      </Box>

      {match.website && (
        <Box sx={{ my: 2 }}>
          <Typography variant="h6">官网链接</Typography>
          <Link href={match.website} target="_blank" rel="noopener">
            {match.website}
          </Link>
        </Box>
      )}

      {match.materials.length > 0 && (
        <Box sx={{ my: 2 }}>
          <Typography variant="h6">学习资料</Typography>
          <Stack spacing={1}>
            {match.materials.map((m) => (
              <Link key={m.url} href={m.url} target="_blank" rel="noopener">
                {m.name}
              </Link>
            ))}
          </Stack>
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/teams/${match.id}/`)}
        >
          寻找参赛团队
        </Button>
      </Box>
    </Box>
  );
}