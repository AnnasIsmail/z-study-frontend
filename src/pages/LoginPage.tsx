import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import LoginForm from '../components/Forms/LoginForm';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <MainLayout hideFooter>
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)', // Adjust based on header height
          display: 'flex',
          alignItems: 'center',
          py: { xs: 4, sm: 8 },
          background: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'linear-gradient(to bottom right, rgba(13, 17, 38, 0.9), rgba(22, 28, 47, 0.9))' 
              : 'linear-gradient(to bottom right, rgba(249, 250, 251, 0.9), rgba(243, 244, 246, 0.9))',
        }}
      >
        <Container maxWidth="sm">
          <LoginForm />
        </Container>
      </Box>
    </MainLayout>
  );
};

export default LoginPage;