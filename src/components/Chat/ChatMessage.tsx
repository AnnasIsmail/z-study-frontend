import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Fade,
  Alert,
} from '@mui/material';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  RotateCcw,
  GitBranch,
  History,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';
import { ChatVersion } from '../../types/versioning';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';
import MessageEditor from './MessageEditor';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  loading?: boolean;
  darkMode?: boolean;
  onEditMessage?: (content: string, autoComplete?: boolean) => void;
  onRegenerateResponse?: () => void;
  onSwitchVersion?: (direction: string) => void;
  onLoadVersions?: (chatId: string) => Promise<ChatVersion[]>;
  model?: string;
  showHeader?: boolean;
  timestamp?: string;
  messageIndex?: number;
  canEdit?: boolean;
  canGenerate?: boolean;
  availableModels?: Array<{ id: string; name: string }>;
  linkedUserChatId?: string; // For assistant messages
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  loading = false,
  darkMode = false,
  onEditMessage,
  onRegenerateResponse,
  onSwitchVersion,
  onLoadVersions,
  model,
  showHeader = false,
  timestamp,
  messageIndex,
  canEdit = false,
  canGenerate = false,
  availableModels,
  linkedUserChatId,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [switchingVersion, setSwitchingVersion] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = (content: string, autoComplete?: boolean) => {
    if (onEditMessage && content !== message.content && content.trim()) {
      onEditMessage(content, autoComplete);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleVersionSwitch = async (direction: string) => {
    if (!onSwitchVersion || !message.chatId || switchingVersion) return;
    
    setSwitchingVersion(true);
    try {
      await onSwitchVersion(direction);
    } finally {
      setSwitchingVersion(false);
    }
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
  const hasVersions = message.hasMultipleVersions || (message.totalVersions && message.totalVersions > 1);

  // Determine version number based on role
  const currentVersionNumber = isUser 
    ? message.userVersionNumber || message.versionNumber || 1
    : message.assistantVersionNumber || message.versionNumber || 1;

  const totalVersions = message.totalVersions || 1;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: "100%",
        position: "relative",
      }}
    >
      {/* Version and Edit indicators */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          mb: 0.5,
          justifyContent: isUser ? "flex-end" : "flex-start",
          mr: isUser ? 6 : 0,
          ml: isUser ? 0 : 6,
        }}
      >
        {message.editInfo?.isEdited && (
          <Chip
            label="Edited"
            size="small"
            color="warning"
            sx={{
              fontSize: "0.6rem",
              height: 16,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        )}
        
        {hasVersions && (
          <Chip
            icon={<GitBranch size={12} />}
            label={`${isUser ? 'User' : 'AI'} v${currentVersionNumber}/${totalVersions}`}
            size="small"
            color={isUser ? "secondary" : "primary"}
            variant="outlined"
            sx={{
              fontSize: "0.6rem",
              height: 16,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        )}

        {/* Show linked user message indicator for assistant responses */}
        {!isUser && linkedUserChatId && (
          <Chip
            icon={<User size={10} />}
            label="Linked"
            size="small"
            color="info"
            variant="outlined"
            sx={{
              fontSize: "0.6rem",
              height: 16,
              "& .MuiChip-label": {
                px: 0.5,
              },
            }}
          />
        )}
      </Box>

      {/* Message Content */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          flexDirection: isUser ? "row-reverse" : "row",
          justifyContent: isUser ? "flex-start" : "flex-start",
        }}
      >
        {/* Avatar */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: isUser ? "secondary.main" : "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
          }}
        >
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </Box>

        {/* Message Bubble */}
        <Box
          sx={{
            position: "relative",
            maxWidth: "85%",
            minWidth: "200px",
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: isUser ? "secondary.main" : "background.default",
              color: isUser ? "white" : "text.primary",
              position: "relative",
              width: "fit-content",
              maxWidth: "100%",
              minWidth: "150px",
              border: !isUser ? "1px solid" : "none",
              borderColor: "divider",
              ml: isUser ? "auto" : 0,
            }}
          >
            {isUser ? (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.5,
                }}
              >
                {message.content}
              </Typography>
            ) : (
              <Box>
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={darkMode ? atomDark : oneLight}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {String(message.content)}
                </ReactMarkdown>
              </Box>
            )}

            {isStreaming && loading && (
              <Box sx={{ display: "inline-block", ml: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  typing...
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Message Editor */}
          <MessageEditor
            initialContent={message.content}
            isEditing={isEditing}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            canEdit={canEdit}
            disabled={loading}
            role={message.role}
            hasMultipleVersions={hasVersions}
            currentVersion={currentVersionNumber}
            totalVersions={totalVersions}
          />

          {/* Action buttons at the bottom of the message */}
          <Fade in={true}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
                justifyContent: isUser ? "flex-end" : "flex-start",
                opacity: 0.6,
                "&:hover": { opacity: 1 },
                transition: "opacity 0.2s ease",
              }}
            >
              {/* Copy button */}
              <Tooltip title={copied ? "Copied!" : "Copy message"}>
                <IconButton
                  size="small"
                  onClick={copyToClipboard}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "transparent",
                    border: "1px solid",
                    borderColor: "divider",
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: "primary.main",
                      color: "primary.main",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>

              {/* Version Navigation for User Messages */}
              {isUser && hasVersions && message.chatId && onSwitchVersion && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    opacity: switchingVersion ? 0.5 : 1,
                    pointerEvents: switchingVersion ? 'none' : 'auto',
                  }}
                >
                  <Tooltip title="Previous version">
                    <IconButton
                      size="small"
                      onClick={() => handleVersionSwitch('prev')}
                      disabled={loading || switchingVersion}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ChevronLeft size={14} />
                    </IconButton>
                  </Tooltip>

                  <Typography
                    variant="caption"
                    sx={{
                      px: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      minWidth: '40px',
                      textAlign: 'center',
                    }}
                  >
                    {currentVersionNumber}/{totalVersions}
                  </Typography>

                  <Tooltip title="Next version">
                    <IconButton
                      size="small"
                      onClick={() => handleVersionSwitch('next')}
                      disabled={loading || switchingVersion}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ChevronRight size={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Regenerate button for assistant messages */}
              {!isUser && onRegenerateResponse && (
                <Tooltip title="Regenerate response">
                  <IconButton
                    size="small"
                    onClick={onRegenerateResponse}
                    disabled={loading}
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "transparent",
                      border: "1px solid",
                      borderColor: "divider",
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                        color: "primary.main",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <RotateCcw size={14} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Version Navigation for Assistant Messages */}
              {!isUser && hasVersions && message.chatId && onSwitchVersion && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    opacity: switchingVersion ? 0.5 : 1,
                    pointerEvents: switchingVersion ? 'none' : 'auto',
                  }}
                >
                  <Tooltip title="Previous version">
                    <IconButton
                      size="small"
                      onClick={() => handleVersionSwitch('prev')}
                      disabled={loading || switchingVersion}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ChevronLeft size={14} />
                    </IconButton>
                  </Tooltip>

                  <Typography
                    variant="caption"
                    sx={{
                      px: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      minWidth: '40px',
                      textAlign: 'center',
                    }}
                  >
                    {currentVersionNumber}/{totalVersions}
                  </Typography>

                  <Tooltip title="Next version">
                    <IconButton
                      size="small"
                      onClick={() => handleVersionSwitch('next')}
                      disabled={loading || switchingVersion}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ChevronRight size={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Timestamp */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  ml: "auto",
                  fontSize: "0.7rem",
                  opacity: 0.6,
                }}
              >
                {formatTimestamp(message.createdAt)}
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Version-related alerts */}
      {message.editInfo?.isEdited && (
        <Alert
          severity="info"
          icon={<History size={16} />}
          sx={{
            mt: 1,
            ml: isUser ? 6 : 0,
            mr: isUser ? 0 : 6,
            maxWidth: "85%",
            alignSelf: isUser ? "flex-end" : "flex-start",
          }}
        >
          This message has been edited and may have created a new conversation branch.
        </Alert>
      )}
    </Box>
  );
};

export default ChatMessage;