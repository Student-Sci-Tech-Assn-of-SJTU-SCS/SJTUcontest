import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

const Error = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center'
      }}
    >
      <ErrorOutlineIcon 
        sx={{ 
          fontSize: 100, 
          color: 'error.main',
          mb: 3
        }} 
      />
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{ 
          fontWeight: 'bold',
          mb: 3
        }}
      >
        你走错地方了哦！
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={() => navigate('/')}
        sx={{ 
          mt: 2,
          px: 4,
          py: 1,
          borderRadius: 2
        }}
      >
        返回主页
      </Button>
    </Box>
  );
};

export default Error;
