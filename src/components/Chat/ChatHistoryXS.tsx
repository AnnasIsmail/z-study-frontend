import React, { useState } from 'react';
import { History } from 'lucide-react';
import { 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import ChatHistorySidebar from './ChatHistory';
import { Conversation } from '../../types';

interface ChatHistoryButtonProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

const ChatHistoryXS: React.FC<ChatHistoryButtonProps> = ({ 
  onSelectConversation, 
  selectedConversationId 
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Chat History">
        <IconButton 
          onClick={handleOpen}
          size="small"
          sx={{ 
            display: { xs: 'flex', md: 'none' },
            color: 'primary.main'
          }}
        >
          <History size={20} />
        </IconButton>
      </Tooltip>

      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="chat-history-dialog"
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: fullScreen ? '100%' : '80%',
            borderRadius: fullScreen ? 0 : 2,
          }
        }}
      >
        <DialogTitle 
          id="chat-history-dialog"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2
          }}
        >
          <Typography variant="h6" component="div">
            Chat History
          </Typography>
          <Box>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleClose} 
              aria-label="close"
              size="small"
            >
              ✕
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ height: '100%' }}>
            <ChatHistorySidebar
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatHistoryXS;