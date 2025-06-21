import React from "react";
import { Typography, Box, Card, CardContent, Grid } from "@mui/material";

const Matches = () => {
  // 这里可以添加获取比赛列表的逻辑
  const matches = [
    { id: 1, title: "示例比赛 1", description: "这是一个示例比赛描述" },
    { id: 2, title: "示例比赛 2", description: "这是另一个示例比赛描述" },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        比赛列表
      </Typography>
      <Grid container spacing={3}>
        {matches.map((match) => (
          <Grid item xs={12} md={6} key={match.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{match.title}</Typography>
                <Typography color="text.secondary">
                  {match.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Matches;
