import React from "react";
import {
  Typography,
  CardContent,
  Grid,
  Box,
  Paper,
} from "@mui/material";

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        管理员概览
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        欢迎使用管理员面板，您可以在这里管理系统的各项功能。
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2}>
            <CardContent>
              <Typography variant="h6" component="h2" color="primary">
                系统状态
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                系统运行正常
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2}>
            <CardContent>
              <Typography variant="h6" component="h2" color="primary">
                快速操作
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                使用左侧菜单进行管理操作
              </Typography>
            </CardContent>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2}>
            <CardContent>
              <Typography variant="h6" component="h2" color="primary">
                帮助文档
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                如需帮助，请查看系统文档
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
