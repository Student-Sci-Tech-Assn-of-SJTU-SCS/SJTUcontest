import React from "react";
import { Typography, Button, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h2" gutterBottom>
        欢迎来到 SJTU Contest
      </Typography>
      <Typography variant="h5" color="text.secondary">
        在这里，你可以参与比赛，组建团队，展示你的实力
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mx: 2 }}
          onClick={() => navigate("/matches")}
        >
          浏览赛事列表
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mx: 2 }}
          onClick={() => navigate("/teams")}
        >
          寻找团队
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mx: 2 }}
          onClick={() => navigate(`/users/${user.id}`)}
        >
          个人主页
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
