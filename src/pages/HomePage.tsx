import React from 'react';
import { Box } from '@mui/material';
import MainLayout from '../components/Layout/MainLayout';
import HeroSection from '../components/Home/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import PricingSection from '../components/Home/PricingSection';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <MainLayout>
      <Box sx={{ minHeight: '100vh' }}>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </Box>
    </MainLayout>
  );
};

export default HomePage;