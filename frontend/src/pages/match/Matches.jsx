import React from "react";
import { Typography, Box, Grid } from "@mui/material";
import MatchCard from "../../components/MatchCard";

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

const Matches = () => {
  // 请求比赛列表
  // const formData = new FormData();
  // formData.append("page", 1);
  // formData.append("num", 15);
  // const res = api.post("/matches", formData);
  const res = {
    "success": true,
    "message": "string",
    "data": {
      "page": 1,
      "num": 2,
      "matches": [
        {
          "id": 1,
          "name": "2026年SJTU野外生存挑战赛",
          "logo": "",
          "keywords": [
            "AI", "others"
          ]
        }, {
          "id": 2,
          "name": "2026年SJTU编程马拉松",
          "logo": "",
          "keywords": [
            "CS", "math"
          ]
        }, {
          "id": 3,
          "name": "2026年SJTU机器人竞赛",
          "logo": "",
          "keywords": [
            "EE"
          ]
        }, {
          "id": 4,
          "name": "2026年SJTU电子竞技大赛",
          "logo": "",
          "keywords": [
            "others"
          ]
        }, {
          "id": 5,
          "name": "2026年SJTU人工智能挑战赛",
          "logo": "",
          "keywords": [
            "AI", "CS"
          ]
        }, {
          "id": 6,
          "name": "2026年SJTU数学建模竞赛",
          "logo": "",
          "keywords": [
            "math"
          ]
        }, {
          "id": 7,
          "name": "2026年SJTU物理实验竞赛",
          "logo": "",
          "keywords": [
            "others"
          ]
        }, {
          "id": 8,
          "name": "2026年SJTU化学实验竞赛",
          "logo": "",
          "keywords": [
            "others"
          ]
        }, {
          "id": 9,
          "name": "2026年SJTU生物实验竞赛",
          "logo": "",
          "keywords": [
            "others"
          ]
        }, {
          "id": 10,
          "name": "2026年SJTU地理信息系统竞赛",
          "logo": "",
          "keywords": [
            "others"
          ]
        }, {
          "id": 11,
          "name": "2026年SJTU环境科学竞赛",
          "logo": "",
          "keywords": [
            "others"
          ]
        }, {
          "id": 12,
          "name": "2026年SJTU操作系统原理知识竞赛",
          "logo": "",
          "keywords": [
            "CS"
          ]
        }, {
          "id": 13,
          "name": "2026年SJTU计算机网络知识竞赛",
          "logo": "",
          "keywords": [
            "CS"
          ]
        }, {
          "id": 14,
          "name": "2026年SJTU数据库系统知识竞赛",
          "logo": "",
          "keywords": [
            "CS"
          ]
        }, {
          "id": 15,
          "name": "2026年SJTU软件工程知识竞赛",
          "logo": "",
          "keywords": [
            "CS"
          ]
        }
      ]
    }
  };

  // 如果请求失败，显示错误信息
  if (!res.success) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          无法加载比赛列表: {res.message}
        </Typography>
      </Box>
    );
  }

  const matches = res.data.matches;

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        比赛列表
      </Typography>
      <Grid container spacing={3} sx={{
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
      }}>
        {matches.map((match) => (
          <Grid item xs={12} md={6} key={match.id}>
            <MatchCard match={match} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Matches;
