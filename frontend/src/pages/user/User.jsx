import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
} from "@mui/material";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export default function User() {
  const [nickname, setNickname] = useState("张三");
  const [experience, setExperience] = useState(
    "2023年校赛一等奖，2024年省赛二等奖",
  );
  const [specialty, setSpecialty] = useState("算法设计、前端开发");

  //   const teams = api.get("/user/teams");
  const teams = [
    {
      id: 1,
      name: "逐梦队",
      description: "2024年校赛参赛队伍，成员：张三、李四、王五",
    },
    {
      id: 2,
      name: "创新者",
      description: "2023年省赛参赛队伍，成员：张三、赵六、钱七",
    },
  ];

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        个人主页
      </Typography>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          variant="outlined"
        />
        <TextField
          label="参赛经历/经验（所获奖项）"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          multiline
          minRows={3}
          variant="outlined"
        />
        <TextField
          label="特长"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          multiline
          minRows={2}
          variant="outlined"
        />
      </Box>
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        我参加的队伍
      </Typography>
      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{team.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {team.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
