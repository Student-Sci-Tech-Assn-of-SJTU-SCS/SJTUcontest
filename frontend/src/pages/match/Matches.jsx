import { Typography, Box, Grid, Divider } from "@mui/material";
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
          "name": "第十八届全国大学生信息安全竞赛—作品赛",
          "logo": "",
          "keywords": [
            "IS", "CS"
          ]
        }, {
          "id": 11,
          "name": "第十八届全国大学生信息安全竞赛（创新实践能力赛）暨第二届“长城杯”铁人三项赛（防护赛）初赛",
          "logo": "",
          "keywords": [
            "IS", "CS"
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
    <Box sx={{ py: 5, px: { xs: 1, sm: 2, md: 4 }, minHeight: '100vh', background: '#f7f9fb' }}>
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
      >
        比赛列表
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />
      <Grid
        container
        spacing={{ xs: 2, sm: 3, md: 4 }}
        justifyContent="center"
        alignItems="stretch"
      >
        {matches.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
              暂无比赛信息
            </Typography>
          </Grid>
        ) : (
          matches.map((match) => (
            <Grid
              item
              key={match.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={2}
              display="flex"
              justifyContent="center"
            >
              <MatchCard match={match} />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Matches;
