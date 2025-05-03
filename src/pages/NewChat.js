import React from 'react';
import NewChatForm from '../components/chat/NewChatForm';
import { Box } from '@mui/material';

const NewChat = () => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <NewChatForm />
    </Box>
  );
};

export default NewChat;
