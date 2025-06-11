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
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import {
  Save,
  X,
  Edit,
  AlertTriangle,
  Zap,
  User,
  Bot,
} from 'lucide-react';

interface MessageEditorProps {
  initialContent: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (content: string, autoComplete?: boolean) => void;
  onCancelEdit: () => void;
  canEdit: boolean;
  disabled?: boolean;
  role: 'user' | 'assistant';
  hasMultipleVersions?: boolean;
  currentVersion?: number;
  totalVersions?: number;
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
  hasMultipleVersions = false,
  currentVersion = 1,
  totalVersions = 1,
}) => {
  const [editedContent, setEditedContent] = useState(initialContent);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoComplete, setAutoComplete] = useState(role === 'user');

  useEffect(() => {
    setEditedContent(initialContent);
    setHasChanges(false);
  }, [initialContent, isEditing]);

  useEffect(() => {
    setHasChanges(editedContent !== initialContent);
  }, [editedContent, initialContent]);

  const handleSave = () => {
    if (editedContent.trim() && hasChanges) {
      onSaveEdit(editedContent.trim(), autoComplete);
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
      <Tooltip title={`Edit ${role} message`}>
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
        borderColor: role === 'user' ? 'secondary.main' : 'primary.main',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {role === 'user' ? <User size={16} /> : <Bot size={16} />}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Edit {role === 'user' ? 'User Message' : 'Assistant Response'}
          </Typography>
          
          {hasMultipleVersions && (
            <Chip
              label={`v${currentVersion}/${totalVersions}`}
              size="small"
              color={role === 'user' ? 'secondary' : 'primary'}
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
        
        {role === 'user' && (
          <Alert
            severity="warning"
            icon={<AlertTriangle size={16} />}
            sx={{
              py: 0.5,
              '& .MuiAlert-message': { fontSize: '0.8rem' },
            }}
          >
            Editing this message will create a new version and may affect subsequent responses.
          </Alert>
        )}
        
        {role === 'assistant' && (
          <Alert
            severity="info"
            icon={<Bot size={16} />}
            sx={{
              py: 0.5,
              '& .MuiAlert-message': { fontSize: '0.8rem' },
            }}
          >
            Editing assistant responses will create a new version of this response.
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
        placeholder={
          role === 'user' 
            ? 'Edit your message...' 
            : 'Edit assistant response...'
        }
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.default',
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: role === 'user' ? 'secondary.main' : 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: role === 'user' ? 'secondary.main' : 'primary.main',
            },
          },
        }}
      />

      {role === 'user' && (
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoComplete}
                onChange={(e) => setAutoComplete(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Zap size={14} />
                <Typography variant="body2">
                  Auto-generate response after editing
                </Typography>
              </Box>
            }
          />
        </Box>
      )}

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
            startIcon={autoComplete && role === 'user' ? <Zap size={16} /> : <Save size={16} />}
            sx={{ minWidth: 80 }}
            color={role === 'user' ? 'secondary' : 'primary'}
          >
            {autoComplete && role === 'user' ? 'Save & Generate' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MessageEditor;