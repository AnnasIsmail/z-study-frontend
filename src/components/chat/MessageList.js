import React, { useRef, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, Divider } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const MessageList = ({ messages = [] }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!messages || messages.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        p={3}
      >
        <SmartToyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" align="center">
          No messages yet
        </Typography>
        <Typography color="text.secondary" align="center">
          Start a conversation by typing a message below
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
      {messages.map((message, index) => (
        <Box key={message._id || index} sx={{ mb: 2 }}>
          <Box display="flex" alignItems="flex-start">
            <Avatar sx={{ mr: 2, backgroundColor: message.role === 'user' ? 'primary.main' : 'secondary.main' }}>
              {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  backgroundColor: message.role === 'user' ? 'primary.light' : 'background.paper',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          </Box>
          {index < messages.length - 1 && (
            <Divider sx={{ my: 2 }} />
          )}
        </Box>
      ))}
      <div ref={endOfMessagesRef} />
    </Box>
  );
};

export default MessageList;
