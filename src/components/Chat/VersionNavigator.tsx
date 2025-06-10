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
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  History,
  Clock,
  MessageSquare,
  Check,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatVersion {
  versionNumber: number;
  isCurrentVersion: boolean;
  content: string;
  contentPreview: string;
  createdAt: string;
  wordCount: number;
  characterCount: number;
}

interface VersionNavigatorProps {
  chatId: string;
  currentVersion: number;
  totalVersions: number;
  hasMultipleVersions: boolean;
  onVersionChange: (versionNumber: number) => void;
  onLoadVersions: (chatId: string) => Promise<ChatVersion[]>;
  disabled?: boolean;
}

const VersionNavigator: React.FC<VersionNavigatorProps> = ({
  chatId,
  currentVersion,
  totalVersions,
  hasMultipleVersions,
  onVersionChange,
  onLoadVersions,
  disabled = false,
}) => {
  const [versions, setVersions] = useState<ChatVersion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadVersions = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const versionData = await onLoadVersions(chatId);
      setVersions(versionData);
    } catch (error) {
      console.error("Failed to load versions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousVersion = () => {
    if (currentVersion > 1) {
      onVersionChange(currentVersion - 1);
    } else {
      onVersionChange(totalVersions);
    }
  };

  const handleNextVersion = () => {
    if (currentVersion < totalVersions) {
      onVersionChange(currentVersion + 1);
    } else {
      onVersionChange(1);
    }
  };

  const handleVersionSelect = (versionNumber: number) => {
    onVersionChange(versionNumber);
    setDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    loadVersions();
  };

  // if (!hasMultipleVersions) {
  //   return null;
  // }

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
            disabled={disabled}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ChevronLeft size={14} />
          </IconButton>
        </Tooltip>

        <Tooltip title="View all versions">
          <Button
            size="small"
            onClick={handleOpenDialog}
            disabled={disabled}
            sx={{
              minWidth: "auto",
              px: 1,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "text.secondary",
              borderRadius: 0,
              "&:hover": {
                bgcolor: "action.hover",
                color: "primary.main",
              },
            }}
          >
            {currentVersion}/{totalVersions}
          </Button>
        </Tooltip>

        <Tooltip title="Next version">
          <IconButton
            size="small"
            onClick={handleNextVersion}
            disabled={disabled}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ChevronRight size={14} />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Versions Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            pb: 1,
          }}
        >
          <History size={20} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Message Versions
          </Typography>
          <IconButton size="small" onClick={() => setDialogOpen(false)}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                Loading versions...
              </Typography>
            </Box>
          ) : versions.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">No versions found</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {versions.map((version, index) => (
                <React.Fragment key={version.versionNumber}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleVersionSelect(version.versionNumber)}
                      selected={version.versionNumber === currentVersion}
                      sx={{
                        py: 2,
                        px: 3,
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        },
                      }}
                    >
                      <Box sx={{ width: "100%" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              Version {version.versionNumber}
                            </Typography>
                            {version.isCurrentVersion && (
                              <Chip
                                label="Current"
                                size="small"
                                color="primary"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  bgcolor:
                                    version.versionNumber === currentVersion
                                      ? "rgba(255,255,255,0.2)"
                                      : "primary.main",
                                  color:
                                    version.versionNumber === currentVersion
                                      ? "white"
                                      : "white",
                                }}
                              />
                            )}
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              <Clock size={12} style={{ marginRight: 4 }} />
                              {format(
                                new Date(version.createdAt),
                                "MMM d, HH:mm"
                              )}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.9,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 1,
                          }}
                        >
                          {version.contentPreview}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {version.wordCount} words
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {version.characterCount} characters
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < versions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VersionNavigator;