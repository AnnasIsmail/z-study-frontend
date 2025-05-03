import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SchoolIcon from '@mui/icons-material/School';
import ChatIcon from '@mui/icons-material/Chat';

const Home = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box py={8} textAlign="center">
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Z-Study
        </Typography>
        
        <Typography variant="h5" color="textSecondary" paragraph>
          Your AI-powered learning companion for studying and exploring new topics
        </Typography>
        
        {user ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/chat"
            startIcon={<ChatIcon />}
            sx={{ mt: 4 }}
          >
            Start Chatting
          </Button>
        ) : (
          <Box mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
          </Box>
        )}
      </Box>
      
      <Grid container spacing={4} sx={{ mt: 4, mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box textAlign="center" mb={2}>
              <SmartToyIcon color="primary" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h5" component="h2" gutterBottom align="center">
              AI-Powered Learning
            </Typography>
            <Typography>
              Leverage advanced language models to help you understand complex topics, assist with studying, and expand your knowledge.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box textAlign="center" mb={2}>
              <ChatIcon color="primary" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h5" component="h2" gutterBottom align="center">
              Interactive Conversations
            </Typography>
            <Typography>
              Engage in multi-turn conversations that remember context, allowing for deeper exploration of subjects and natural dialogue.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box textAlign="center" mb={2}>
              <SchoolIcon color="primary" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h5" component="h2" gutterBottom align="center">
              Learn Any Subject
            </Typography>
            <Typography>
              From mathematics and science to history and literature, our AI can assist you with virtually any academic subject or topic of interest.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
