import React from 'react';
import { Typography, Box, Card, CardContent, Grid, Button } from '@mui/material';

const Teams = () => {
  // 这里可以添加获取团队列表的逻辑
  const teams = [
    { id: 1, name: "示例团队 1", members: 3, description: "寻找算法大师" },
    { id: 2, name: "示例团队 2", members: 2, description: "欢迎加入我们的队伍" },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">
          团队列表
        </Typography>
        <Button variant="contained" color="primary">
          创建新团队
        </Button>
      </Box>
      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} key={team.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {team.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  当前成员数: {team.members}
                </Typography>
                <Typography variant="body2">
                  {team.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ mt: 2 }}
                >
                  申请加入
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Teams;
