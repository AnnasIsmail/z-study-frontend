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
import { Bot, User, Copy, Check, Edit, X, Save, MoreVertical } from 'lucide-react';
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
  model?: string;
  showHeader?: boolean;
  timestamp?: string;
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: '85%',
        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
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
            {message.role === 'user' && onEditMessage && (
              <Tooltip title="Edit message">
                <IconButton size="small" onClick={handleEdit}>
                  <Edit size={14} />
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
          {!showHeader && message.role === 'assistant' && !isEditing && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 0.5,
              }}
            >
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton size="small" onClick={copyToClipboard}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </IconButton>
              </Tooltip>
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
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<X size={16} />}
                  onClick={handleCancel}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  startIcon={<Save size={16} />}
                  onClick={handleSave}
                  variant="contained"
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : message.role === 'user' ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pr: showHeader ? 0 : 4 }}>
                {message.content}
              </Typography>
              {!showHeader && onEditMessage && (
                <Tooltip title="Edit message">
                  <IconButton 
                    size="small" 
                    onClick={handleEdit}
                    sx={{ 
                      ml: 1, 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
                    }}
                  >
                    <Edit size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ) : (
            <Box sx={{ pr: showHeader ? 0 : 5 }}>
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