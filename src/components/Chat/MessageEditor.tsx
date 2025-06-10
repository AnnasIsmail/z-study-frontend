import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Save,
  X,
  Edit,
  AlertTriangle,
} from 'lucide-react';

interface MessageEditorProps {
  initialContent: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (content: string) => void;
  onCancelEdit: () => void;
  canEdit: boolean;
  disabled?: boolean;
  role: 'user' | 'assistant';
}

const MessageEditor: React.FC<MessageEditorProps> = ({
  initialContent,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  canEdit,
  disabled = false,
  role,
}) => {
  const [editedContent, setEditedContent] = useState(initialContent);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedContent(initialContent);
    setHasChanges(false);
  }, [initialContent, isEditing]);

  useEffect(() => {
    setHasChanges(editedContent !== initialContent);
  }, [editedContent, initialContent]);

  const handleSave = () => {
    if (editedContent.trim() && hasChanges) {
      onSaveEdit(editedContent.trim());
    }
  };

  const handleCancel = () => {
    setEditedContent(initialContent);
    setHasChanges(false);
    onCancelEdit();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return canEdit && !disabled ? (
      <Tooltip title="Edit message">
        <IconButton
          size="small"
          onClick={onStartEdit}
          sx={{
            width: 28,
            height: 28,
            bgcolor: 'transparent',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main',
              color: 'primary.main',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Edit size={14} />
        </IconButton>
      </Tooltip>
    ) : null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mt: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: 'primary.main',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Edit Message
        </Typography>
        {role === 'user' && (
          <Alert
            severity="warning"
            icon={<AlertTriangle size={16} />}
            sx={{
              py: 0.5,
              '& .MuiAlert-message': { fontSize: '0.8rem' },
            }}
          >
            Editing this message will create a new conversation branch and deactivate subsequent messages.
          </Alert>
        )}
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={10}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={role === 'user' ? 'Edit your message...' : 'Edit assistant response...'}
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.default',
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {editedContent.length} characters • Press Ctrl+Enter to save
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCancel}
            startIcon={<X size={16} />}
            sx={{ minWidth: 80 }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={!editedContent.trim() || !hasChanges}
            startIcon={<Save size={16} />}
            sx={{ minWidth: 80 }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MessageEditor;