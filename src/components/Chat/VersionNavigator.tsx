import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Button,
  Divider,
  Paper,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  History,
  Clock,
  MessageSquare,
  Check,
  X,
  MoreVertical,
  GitBranch,
  User,
  Bot,
  Trash2,
  Copy,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { VersionNavigationProps, ChatVersion } from '../../types/versioning';

const VersionNavigator: React.FC<VersionNavigationProps> = ({
  chatId,
  role,
  currentVersion,
  totalVersions,
  hasMultipleVersions,
  onVersionChange,
  disabled = false,
  linkedUserChatId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreviousVersion = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      setError(null);
      await onVersionChange("prev");
    } catch (error: any) {
      setError(error.message || "Failed to switch to previous version");
    } finally {
      setLoading(false);
    }
  };

  const handleNextVersion = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      setError(null);
      await onVersionChange("next");
    } catch (error: any) {
      setError(error.message || "Failed to switch to next version");
    } finally {
      setLoading(false);
    }
  };

  const getVersionIcon = (role: "user" | "assistant") => {
    return role === "user" ? <User size={12} /> : <Bot size={12} />;
  };

  const getVersionColor = (role: "user" | "assistant") => {
    return role === "user" ? "secondary" : "primary";
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          overflow: "hidden",
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <Tooltip title="Previous version">
          <IconButton
            size="small"
            onClick={handlePreviousVersion}
            disabled={disabled || loading}
            sx={{
              width: 24,
              height: 24,
              borderRadius: 0,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={12} />
            ) : (
              <ChevronLeft size={12} />
            )}
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.5,
            minWidth: "auto",
          }}
        >
          {getVersionIcon(role)}
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "text.secondary",
              lineHeight: 1,
            }}
          >
            {currentVersion}/{totalVersions}
          </Typography>
        </Box>

        <Tooltip title="Next version">
          <IconButton
            size="small"
            onClick={handleNextVersion}
            disabled={disabled || loading}
            sx={{
              width: 24,
              height: 24,
              borderRadius: 0,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ChevronRight size={12} />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Tooltip title={error}>
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              bgcolor: "error.main",
              ml: 0.5,
            }}
          />
        </Tooltip>
      )}
    </>
  );
};

export default VersionNavigator;