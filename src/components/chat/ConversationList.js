import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Divider,
  Paper
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ConversationList = () => {
  const { conversations, currentConversation, fetchConversation, deleteConversation } = useChat();
  const navigate = useNavigate();

  const handleSelectConversation = async (id) => {
    await fetchConversation(id);
    navigate(`/chat/${id}`);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    const success = await deleteConversation(id);
    if (success && id === currentConversation?._id) {
      navigate('/chat');
    }
  };

  const handleNewChat = () => {
    navigate('/chat/new');
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', overflow: 'auto' }}>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Conversations</Typography>
          <IconButton color="primary" onClick={handleNewChat}>
            <AddIcon />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List>
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ListItem
              key={conversation._id}
              disablePadding
              secondaryAction={
                <IconButton edge="end" onClick={(e) => handleDeleteConversation(e, conversation._id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton
                selected={currentConversation?._id === conversation._id}
                onClick={() => handleSelectConversation(conversation._id)}
              >
                <ListItemIcon>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText
                  primary={conversation.title || 'Untitled Conversation'}
                  secondary={new Date(conversation.createdAt).toLocaleDateString()}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No conversations yet" />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default ConversationList;
