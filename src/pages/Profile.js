import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
          </Avatar>
          <Box>
            <Typography variant="h4">{user?.name}</Typography>
            <Typography variant="body1" color="textSecondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Account Created
          </Typography>
          <Typography>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
