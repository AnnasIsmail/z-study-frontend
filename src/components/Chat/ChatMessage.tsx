import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Badge,
} from '@mui/material';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Edit, 
  X, 
  Save, 
  MoreVertical, 
  Repeat, 
  History,
  GitBranch,
  Clock
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  loading?: boolean;
  darkMode?: boolean;
  onEditMessage?: (content: string, model: string) => void;
  onRegenerateFromMessage?: (model: string) => void;
  onSwitchVersion?: (versionNumber: number) => void;
  onViewVersions?: () => void;
  model?: string;
  showHeader?: boolean;
  timestamp?: string;
  messageIndex?: number;
  canRegenerate?: boolean;
  availableModels?: Array<{ id: string; name: string }>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  loading = false,
  darkMode = false,
  onEditMessage,
  onRegenerateFromMessage,
  onSwitchVersion,
  onViewVersions,
  model,
  showHeader = false,
  timestamp,
  messageIndex,
  canRegenerate = false,
  availableModels = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [selectedModel, setSelectedModel] = useState(model || '');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [regenerateMenuAnchorEl, setRegenerateMenuAnchorEl] = useState<null | HTMLElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
    setMenuAnchorEl(null);
  };

  const handleSave = () => {
    if (onEditMessage && editedContent !== message.content && selectedModel) {
      onEditMessage(editedContent, selectedModel);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleRegenerate = (modelId?: string) => {
    if (onRegenerateFromMessage) {
      onRegenerateFromMessage(modelId || selectedModel || model || '');
    }
    setRegenerateMenuAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleRegenerateMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setRegenerateMenuAnchorEl(event.currentTarget);
  };

  const handleRegenerateMenuClose = () => {
    setRegenerateMenuAnchorEl(null);
  };

  const handleViewVersions = () => {
    setVersionsDialogOpen(true);
    setMenuAnchorEl(null);
    if (onViewVersions) {
      onViewVersions();
    }
  };

  const handleSwitchVersion = (versionNumber: number) => {
    if (onSwitchVersion) {
      onSwitchVersion(versionNumber);
    }
    setVersionsDialogOpen(false);
  };

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return timestamp;
    try {
      return format(new Date(dateString), 'MMM d, HH:mm');
    } catch {
      return timestamp;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: '85%',
        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Version and Edit indicators */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
        {message.isEdited && (
          <Chip
            label="Edited"
            size="small"
            color="warning"
            sx={{ 
              fontSize: '0.6rem',
              height: 16,
              '& .MuiChip-label': {
                px: 1,
              }
            }}
          />
        )}
        {message.hasMultipleVersions && (
          <Chip
            icon={<GitBranch size={12} />}
            label={`v${message.versionNumber}/${message.totalVersions}`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ 
              fontSize: '0.6rem',
              height: 16,
              '& .MuiChip-label': {
                px: 1,
              }
            }}
          />
        )}
      </Box>

      {/* Chat Header */}
      {showHeader && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {message.role === 'assistant' ? (
              <Bot size={16} color="#3b82f6" />
            ) : (
              <User size={16} color="#7c3aed" />
            )}
            <Typography variant="caption" color="text.secondary">
              {message.role === 'assistant' ? 'AI Assistant' : 'You'}
            </Typography>
            {model && message.role === 'assistant' && (
              <Chip
                label={model}
                size="small"
                variant="outlined"
                sx={{ 
                  height: 20, 
                  fontSize: '0.65rem',
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTimestamp(message.createdAt)}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertical size={14} />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Message Content */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: message.role === 'user' ? 'secondary.main' : 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {message.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
        </Box>

        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: message.role === 'user' ? 'primary.main' : 'background.default',
            color: message.role === 'user' ? 'white' : 'text.primary',
            position: 'relative',
            width: '100%',
            border: message.role === 'assistant' ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {/* Action buttons for non-header mode */}
          {!showHeader && !isEditing && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 0.5,
                opacity: 0.7,
                '&:hover': { opacity: 1 },
              }}
            >
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton size="small" onClick={copyToClipboard}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </IconButton>
              </Tooltip>
              
              {message.hasMultipleVersions && (
                <Tooltip title="View versions">
                  <IconButton size="small" onClick={handleViewVersions}>
                    <Badge badgeContent={message.totalVersions} color="primary">
                      <History size={16} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertical size={16} />
              </IconButton>
            </Box>
          )}

          {isEditing ? (
            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.1)' : 'background.paper',
                    '& fieldset': {
                      borderColor: message.role === 'user' ? 'rgba(255,255,255,0.3)' : 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: message.role === 'user' ? 'rgba(255,255,255,0.5)' : 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: message.role === 'user' ? 'white' : 'primary.main',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: message.role === 'user' ? 'white' : 'text.primary',
                  },
                }}
                placeholder={message.role === 'user' ? 'Edit your message...' : 'Edit assistant response...'}
              />
              
              {message.role === 'user' && availableModels.length > 0 && (
                <TextField
                  select
                  fullWidth
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  label="Model for regeneration"
                  size="small"
                  sx={{ mb: 2 }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select model</option>
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </TextField>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<X size={16} />}
                  onClick={handleCancel}
                  variant="outlined"
                  sx={{
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    borderColor: message.role === 'user' ? 'rgba(255,255,255,0.5)' : 'divider',
                    '&:hover': {
                      borderColor: message.role === 'user' ? 'white' : 'primary.main',
                      bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.1)' : 'action.hover',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  startIcon={<Save size={16} />}
                  onClick={handleSave}
                  variant="contained"
                  disabled={!editedContent.trim() || (message.role === 'user' && !selectedModel)}
                  sx={{
                    bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.2)' : 'primary.main',
                    color: message.role === 'user' ? 'white' : 'white',
                    '&:hover': {
                      bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.3)' : 'primary.dark',
                    },
                  }}
                >
                  Save & Regenerate
                </Button>
              </Box>
            </Box>
          ) : message.role === 'user' ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pr: showHeader ? 0 : 6 }}>
                {message.content}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ pr: showHeader ? 0 : 6 }}>
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={darkMode ? atomDark : oneLight}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </Box>
          )}
          
          {isStreaming && loading && (
            <Box sx={{ display: 'inline-block', ml: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                typing...
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 180 }
        }}
      >
        <MenuItem onClick={copyToClipboard}>
          <Copy size={16} style={{ marginRight: 8 }} />
          Copy
        </MenuItem>
        
        {onEditMessage && (
          <MenuItem onClick={handleEdit}>
            <Edit size={16} style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
        )}
        
        {message.hasMultipleVersions && (
          <MenuItem onClick={handleViewVersions}>
            <History size={16} style={{ marginRight: 8 }} />
            View Versions ({message.totalVersions})
          </MenuItem>
        )}
        
        {canRegenerate && message.role === 'assistant' && onRegenerateFromMessage && (
          <MenuItem onClick={handleRegenerateMenuOpen}>
            <Repeat size={16} style={{ marginRight: 8 }} />
            Regenerate
          </MenuItem>
        )}
      </Menu>

      {/* Regenerate Model Selection Menu */}
      <Menu
        anchorEl={regenerateMenuAnchorEl}
        open={Boolean(regenerateMenuAnchorEl)}
        onClose={handleRegenerateMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => handleRegenerate()}>
          <Repeat size={16} style={{ marginRight: 8 }} />
          Same Model
        </MenuItem>
        <Divider />
        {availableModels.map((modelOption) => (
          <MenuItem key={modelOption.id} onClick={() => handleRegenerate(modelOption.id)}>
            <Bot size={16} style={{ marginRight: 8 }} />
            {modelOption.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Versions Dialog */}
      <Dialog
        open={versionsDialogOpen}
        onClose={() => setVersionsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GitBranch size={20} />
            Message Versions
          </Box>
        </DialogTitle>
        <DialogContent>
          {message.availableVersions && message.availableVersions.length > 0 ? (
            <List>
              {message.availableVersions.map((version) => (
                <ListItem key={version.versionId} disablePadding>
                  <ListItemButton
                    selected={version.versionNumber === message.versionNumber}
                    onClick={() => handleSwitchVersion(version.versionNumber)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Version {version.versionNumber}
                          </Typography>
                          {version.versionNumber === message.versionNumber && (
                            <Chip label="Current" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            <Clock size={12} style={{ marginRight: 4 }} />
                            {formatTimestamp(version.createdAt)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mt: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {version.content}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
              No versions available
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatMessage;