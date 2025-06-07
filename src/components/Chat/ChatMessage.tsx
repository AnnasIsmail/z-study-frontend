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
} from '@mui/material';
import { Bot, User, Copy, Check, Edit, X, Save, MoreVertical, Repeat } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  loading?: boolean;
  darkMode?: boolean;
  onEditMessage?: (content: string) => void;
  onRegenerateFromMessage?: () => void;
  model?: string;
  showHeader?: boolean;
  timestamp?: string;
  messageIndex?: number;
  canRegenerate?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  loading = false,
  darkMode = false,
  onEditMessage,
  onRegenerateFromMessage,
  model,
  showHeader = false,
  timestamp,
  messageIndex,
  canRegenerate = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

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
  };

  const handleSave = () => {
    if (onEditMessage && editedContent !== message.content) {
      onEditMessage(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleRegenerate = () => {
    if (onRegenerateFromMessage) {
      onRegenerateFromMessage();
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
      {/* Edit indicator */}
      {message.updated && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: 8,
            zIndex: 2,
          }}
        >
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
        </Box>
      )}

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
            {timestamp && (
              <Typography variant="caption\" color="text.secondary">
                {timestamp}
              </Typography>
            )}
            <Tooltip title={copied ? 'Copied!' : 'Copy message'}>
              <IconButton size="small" onClick={copyToClipboard}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </IconButton>
            </Tooltip>
            {onEditMessage && (
              <Tooltip title="Edit message">
                <IconButton size="small" onClick={handleEdit}>
                  <Edit size={14} />
                </IconButton>
              </Tooltip>
            )}
            {canRegenerate && message.role === 'assistant' && onRegenerateFromMessage && (
              <Tooltip title="Regenerate response">
                <IconButton size="small" onClick={handleRegenerate}>
                  <Repeat size={14} />
                </IconButton>
              </Tooltip>
            )}
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
              {onEditMessage && (
                <Tooltip title="Edit message">
                  <IconButton 
                    size="small" 
                    onClick={handleEdit}
                    sx={{ 
                      color: message.role === 'user' ? 'white' : 'inherit',
                      '&:hover': { 
                        bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.1)' : 'action.hover' 
                      } 
                    }}
                  >
                    <Edit size={16} />
                  </IconButton>
                </Tooltip>
              )}
              {canRegenerate && message.role === 'assistant' && onRegenerateFromMessage && (
                <Tooltip title="Regenerate response">
                  <IconButton size="small" onClick={handleRegenerate}>
                    <Repeat size={16} />
                  </IconButton>
                </Tooltip>
              )}
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
                  sx={{
                    bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.2)' : 'primary.main',
                    color: message.role === 'user' ? 'white' : 'white',
                    '&:hover': {
                      bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.3)' : 'primary.dark',
                    },
                  }}
                >
                  Save
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
    </Box>
  );
};

export default ChatMessage;