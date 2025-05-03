import React, { useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import ConversationList from '../components/chat/ConversationList';

const Chat = () => {
  const { conversationId } = useParams();
  const { fetchConversation, loading, currentConversation, fetchConversations } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure we have fetched all conversations
    fetchConversations();
    
    // If a conversation ID is provided, fetch that specific conversation
    if (conversationId && conversationId !== 'new') {
      fetchConversation(conversationId);
    }
  }, [conversationId, fetchConversation, fetchConversations]);

  useEffect(() => {
    // If no conversationId is provided, check if we should redirect to a conversation
    if (!conversationId && currentConversation) {
      navigate(`/chat/${currentConversation._id}`);
    }
  }, [conversationId, currentConversation, navigate]);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden' }}>
      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={12} md={3} sx={{ height: '100%', borderRight: '1px solid', borderColor: 'divider' }}>
          <ConversationList />
        </Grid>
        
        <Grid item xs={12} md={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {loading && !conversationId ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : conversationId ? (
            <Outlet />
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
              <Typography variant="h6" color="textSecondary">
                Select a conversation or start a new one
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chat;
