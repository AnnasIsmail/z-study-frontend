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
  Menu,
  MenuItem,
  Fade,
} from '@mui/material';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Edit3, 
  X, 
  Save, 
  MoreVertical, 
  GitBranch,
  ChevronLeft,
  ChevronRight,
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
  onEditMessage?: (content: string) => void;
  onGenerateResponse?: (model: string) => void;
  onSwitchVersion?: (versionNumber: number) => void;
  onViewVersions?: () => void;
  model?: string;
  showHeader?: boolean;
  timestamp?: string;
  messageIndex?: number;
  canEdit?: boolean;
  canGenerate?: boolean;
  availableModels?: Array<{ id: string; name: string }>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  loading = false,
  darkMode = false,
  onEditMessage,
  model,
  showHeader = false,
  timestamp,
  messageIndex,
  canEdit = false,
  canGenerate = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

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
    if (onEditMessage && editedContent !== message.content) {
      onEditMessage(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return timestamp;
    try {
      return format(new Date(dateString), 'MMM d, HH:mm');
    } catch {
      return timestamp;
    }
  };

  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Version and Edit indicators */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'center', 
        mb: 0.5,
        justifyContent: isUser ? 'flex-start' : 'flex-start',
        ml: isUser ? 0 : 6,
      }}>
        {message.editInfo?.isEdited && (
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

      {/* Message Content */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'flex-start',
        flexDirection: isUser ? 'row' : 'row',
        justifyContent: isUser ? 'flex-start' : 'flex-start',
      }}>
        {/* Avatar */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: isUser ? 'secondary.main' : 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            order: isUser ? 1 : 1,
          }}
        >
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </Box>

        {/* Message Bubble */}
        <Box sx={{ 
          position: 'relative',
          maxWidth: '85%',
          minWidth: '200px',
          order: isUser ? 2 : 2,
        }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: isUser ? 'primary.main' : 'background.default',
              color: isUser ? 'white' : 'text.primary',
              position: 'relative',
              width: 'fit-content',
              maxWidth: '100%',
              minWidth: '150px',
              border: !isUser ? '1px solid' : 'none',
              borderColor: 'divider',
              // Custom bubble tail
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 12,
                [isUser ? 'left' : 'right']: -8,
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: isUser 
                  ? '8px 8px 8px 0'
                  : '8px 0 8px 8px',
                borderColor: isUser 
                  ? `transparent ${isUser ? 'primary.main' : 'background.default'} transparent transparent`
                  : `transparent transparent transparent ${!isUser ? (darkMode ? '#1e293b' : '#f8fafc') : 'primary.main'}`,
              },
            }}
          >
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
                      bgcolor: isUser ? 'rgba(255,255,255,0.1)' : 'background.paper',
                      '& fieldset': {
                        borderColor: isUser ? 'rgba(255,255,255,0.3)' : 'divider',
                      },
                      '&:hover fieldset': {
                        borderColor: isUser ? 'rgba(255,255,255,0.5)' : 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isUser ? 'white' : 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isUser ? 'white' : 'text.primary',
                    },
                  }}
                  placeholder={isUser ? 'Edit your message...' : 'Edit assistant response...'}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<X size={16} />}
                    onClick={handleCancel}
                    variant="outlined"
                    sx={{
                      color: isUser ? 'white' : 'text.primary',
                      borderColor: isUser ? 'rgba(255,255,255,0.5)' : 'divider',
                      '&:hover': {
                        borderColor: isUser ? 'white' : 'primary.main',
                        bgcolor: isUser ? 'rgba(255,255,255,0.1)' : 'action.hover',
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
                    disabled={!editedContent.trim()}
                    sx={{
                      bgcolor: isUser ? 'rgba(255,255,255,0.2)' : 'primary.main',
                      color: isUser ? 'white' : 'white',
                      '&:hover': {
                        bgcolor: isUser ? 'rgba(255,255,255,0.3)' : 'primary.dark',
                      },
                    }}
                  >
                    Save & Generate
                  </Button>
                </Box>
              </Box>
            ) : isUser ? (
              <Typography variant="body1" sx={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.5,
              }}>
                {message.content}
              </Typography>
            ) : (
              <Box>
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

          {/* Action buttons at the bottom of the message - ChatGPT style */}
          {!isEditing && (
            <Fade in={true}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 1,
                  justifyContent: 'flex-start',
                  opacity: 0.6,
                  '&:hover': { opacity: 1 },
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Copy button */}
                <Tooltip title={copied ? 'Copied!' : 'Copy message'}>
                  <IconButton
                    size="small"
                    onClick={copyToClipboard}
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
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </IconButton>
                </Tooltip>

                {/* Edit button for user messages - using pencil icon */}
                {canEdit && message.editInfo?.canEdit && isUser && (
                  <Tooltip title="Edit message">
                    <IconButton
                      size="small"
                      onClick={handleEdit}
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
                      <Edit3 size={14} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Version navigation for messages with multiple versions - ChatGPT style */}
                {message.hasMultipleVersions && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'transparent',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Tooltip title="Previous version">
                      <IconButton
                        size="small"
                        sx={{
                          width: 24,
                          height: 24,
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'transparent',
                          },
                        }}
                      >
                        <ChevronLeft size={12} />
                      </IconButton>
                    </Tooltip>

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.secondary',
                        px: 0.5,
                        fontSize: '0.75rem',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {message.versionNumber}
                    </Typography>

                    <Tooltip title="Next version">
                      <IconButton
                        size="small"
                        sx={{
                          width: 24,
                          height: 24,
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'transparent',
                          },
                        }}
                      >
                        <ChevronRight size={12} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {/* Timestamp */}
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    ml: 'auto',
                    fontSize: '0.7rem',
                    opacity: 0.6,
                  }}
                >
                  {formatTimestamp(message.createdAt)}
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatMessage;