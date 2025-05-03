import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';

const ConversationDetail = () => {
  const { conversationId } = useParams();
  const { currentConversation, loading, error, sendMessage } = useChat();
  const navigate = useNavigate();

  // Handle case of non-existent conversation
  if (!loading && !currentConversation && conversationId !== 'new') {
    return (
      <Box p={4} textAlign="center">
        <Alert severity="error">
          Conversation not found. It may have been deleted.
        </Alert>
        <Box mt={2}>
          <Typography>
            Return to <span onClick={() => navigate('/chat')} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>chat list</span>
          </Typography>
        </Box>
      </Box>
    );
  }

  // Handle loading state
  if (loading && !currentConversation) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  const handleSendMessage = (message) => {
    sendMessage(message, currentConversation._id);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <Typography variant="h6">
          {currentConversation?.title || 'Conversation'}
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <MessageList messages={currentConversation?.messages || []} />
      </Box>
      
      <ChatInput onSendMessage={handleSendMessage} loading={loading} conversationId={conversationId} />
    </Box>
  );
};

export default ConversationDetail;
