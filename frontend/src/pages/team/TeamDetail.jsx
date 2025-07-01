// src/pages/TeamDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  Chip,
} from "@mui/material";

const TeamDetail = () => {
  const { match_id, team_id } = useParams(); // 从 URL 获取参数
  const [teamInfo, setTeamInfo] = useState(null); // 队伍信息
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    // TODO: 替换为后端接口
    const fetchTeamInfo = async () => {
      try {
        // 预留真实接口
        // const res = await fetch(`/api/teams/${match_id}/${team_id}`);
        // const data = await res.json();
        // setTeamInfo(data);

        // 当前使用 mock 数据
        const mockData = {
          name: "你说得不队",
          description: "我们是最厉害的队伍",
          matchName: "3025校赛",
          currentMembers: 3,
          expectedMembers: 5,
          deadline: "2025-07-15",
          leaderContact: "alpha@example.com",
          members: [
            { id: 1, name: "小明" },
            { id: 2, name: "小红" },
            { id: 3, name: "小李" },
          ],
        };
        setTeamInfo(mockData);
      } catch (error) {
        console.error("队伍信息加载失败:", error);
      }
    };

    fetchTeamInfo();
  }, [match_id, team_id]);

  if (!teamInfo) return <Typography>加载中...</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">{teamInfo.name}</Typography>
      <Typography variant="subtitle1" gutterBottom>
        {teamInfo.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body1">
        <strong>参赛赛事：</strong>
        {teamInfo.matchName}
      </Typography>
      <Typography variant="body1">
        <strong>人数：</strong>
        {teamInfo.currentMembers} / {teamInfo.expectedMembers}
      </Typography>
      <Typography variant="body1">
        <strong>招募截止日期：</strong>
        {teamInfo.deadline}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">队员列表：</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {teamInfo.members.map((member) => (
          <Chip
            key={member.id}
            label={member.name}
            clickable
            component="a"
            href={`/uuid:${member.id}`} // 跳转到用户主页
          />
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6">加入队伍：</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        <TextField
          label="邀请码"
          size="small"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <Button variant="contained" onClick={() => alert("模拟加入成功")}>
          加入
        </Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => alert("模拟退出成功")}
        >
          退出队伍
        </Button>
      </Box>
    </Box>
  );
};

export default TeamDetail;
