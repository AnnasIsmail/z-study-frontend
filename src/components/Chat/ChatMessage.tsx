import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Fade,
} from '@mui/material';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  RotateCcw,
  GitBranch,
  History,
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';
import MessageEditor from './MessageEditor';
import VersionNavigator from './VersionNavigator';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  loading?: boolean;
  darkMode?: boolean;
  onEditMessage?: (content: string) => void;
  onRegenerateResponse?: () => void;
  onSwitchVersion?: (versionNumber: number) => void;
  onLoadVersions?: (chatId: string) => Promise<any[]>;
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
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSaveEdit = (content: string) => {
    if (onEditMessage && content !== message.content && content.trim()) {
      onEditMessage(content);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleVersionChange = (versionNumber: number) => {
    if (onSwitchVersion) {
      onSwitchVersion(versionNumber);
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
        {message.hasMultipleVersions && (
          <Chip
            icon={<GitBranch size={12} />}
            label={`v${message.versionNumber}/${message.totalVersions}`}
            size="small"
            color="info"
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
              bgcolor: isUser ? "primary.main" : "background.default",
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
                variant="body1\"
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
                  {message.content}
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
          {/* {!isStreaming && ( */}
          <MessageEditor
            initialContent={message.content}
            isEditing={isEditing}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            canEdit={true}
            disabled={loading}
            role={message.role}
          />
          {/* )} */}

          {/* Action buttons at the bottom of the message */}
          {/* {!isEditing && !isStreaming && ( */}
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

              {/* Regenerate button for assistant messages */}
              {/* {!isUser && onRegenerateResponse && ( */}
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
              {/* )} */}

              {/* Version Navigator */}
              {/* {message.hasMultipleVersions &&
                  message.chatId &&
                  onSwitchVersion &&
                  onLoadVersions && ( */}
              <VersionNavigator
                chatId={message.chatId}
                currentVersion={message.versionNumber || 1}
                totalVersions={message.totalVersions || 1}
                hasMultipleVersions={message.hasMultipleVersions}
                onVersionChange={handleVersionChange}
                onLoadVersions={onLoadVersions}
                disabled={loading}
              />
              {/* )} */}

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
          {/* )} */}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatMessage;