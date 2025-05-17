import React from 'react';
import { Box, Container, Typography, Paper, Tab, Tabs } from '@mui/material';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import ProfileInfo from '../components/Profile/ProfileInfo';
import TopupHistory from '../components/Profile/TopupHistory';
import ChatHistory from '../components/Profile/ChatHistory';
import { useAuth } from '../context/AuthContext';
import { User, CreditCard, MessageSquare } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get('tab') || 'profile';
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(`/profile?tab=${newValue}`);
  };

  return (
    <MainLayout>
      <Box sx={{ py: 6 }}>
        <Container>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
            Your Profile
          </Typography>

          <Paper sx={{ borderRadius: 2, mb: 4 }}>
            <Tabs 
              value={tab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              aria-label="profile tabs"
            >
              <Tab 
                icon={<User size={18} />} 
                iconPosition="start" 
                label="Profile" 
                value="profile" 
              />
              <Tab 
                icon={<CreditCard size={18} />} 
                iconPosition="start" 
                label="Topup History" 
                value="topup" 
              />
              <Tab 
                icon={<MessageSquare size={18} />} 
                iconPosition="start" 
                label="Chat History" 
                value="chat" 
              />
            </Tabs>
          </Paper>

          {tab === 'profile' && <ProfileInfo />}
          {tab === 'topup' && <TopupHistory />}
          {tab === 'chat' && <ChatHistory />}
        </Container>
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;