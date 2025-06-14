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
import { getChatVersions, switchToVersion } from '../../services/conversations';

const VersionNavigator: React.FC<VersionNavigationProps> = ({
  chatId,
  role,
  currentVersion,
  totalVersions,
  hasMultipleVersions,
  onVersionChange,
  onLoadVersions,
  disabled = false,
  linkedUserChatId,
}) => {
  const [versions, setVersions] = useState<ChatVersion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVersionForMenu, setSelectedVersionForMenu] = useState<ChatVersion | null>(null);

  const loadVersions = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await getChatVersions(chatId, {
        versionType: role,
        limit: 50,
      });
      
      if (response.success) {
        // Transform API response to match our ChatVersion interface
        const transformedVersions: ChatVersion[] = response.data.versions.map(version => ({
          chatId: version.chatId,
          versionId: version.chatId, // Use chatId as versionId
          versionNumber: version.userVersion || version.assistantVersion || 1,
          userVersionNumber: version.userVersion,
          assistantVersionNumber: version.assistantVersion,
          isCurrentVersion: version.isLatestVersion,
          content: version.content.prompt || version.content.response || "",
          contentPreview: (version.content.prompt || version.content.response || "").substring(0, 100),
          createdAt: version.createdAt,
          updatedAt: version.createdAt,
          wordCount: (version.content.prompt || version.content.response || "").split(' ').length,
          characterCount: (version.content.prompt || version.content.response || "").length,
          linkedUserChatId: linkedUserChatId,
          originalChatId: version.chatId,
        }));
        
        setVersions(transformedVersions);
      }
    } catch (error: any) {
      console.error('Failed to load versions:', error);
      setError(error.message || 'Failed to load versions');
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

  const handleVersionSelect = async (versionNumber: number) => {
    try {
      setLoading(true);
      onVersionChange(versionNumber);
      setDialogOpen(false);
    } catch (error: any) {
      setError(error.message || 'Failed to switch version');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    loadVersions();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, version: ChatVersion) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedVersionForMenu(version);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedVersionForMenu(null);
  };

  const handleCopyVersion = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const getVersionIcon = (role: 'user' | 'assistant') => {
    return role === 'user' ? <User size={16} /> : <Bot size={16} />;
  };

  const getVersionColor = (role: 'user' | 'assistant') => {
    return role === 'user' ? 'secondary' : 'primary';
  };

  if (!hasMultipleVersions && totalVersions <= 1) {
    return null;
  }

  return (
    <>
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
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
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
              '&:hover': {
                bgcolor: 'action.hover',
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
              minWidth: 'auto',
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              borderRadius: 0,
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main',
              },
            }}
            startIcon={getVersionIcon(role)}
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
              '&:hover': {
                bgcolor: 'action.hover',
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
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 1,
          }}
        >
          <History size={20} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {role === 'user' ? 'User Message' : 'Assistant Response'} Versions
          </Typography>
          
          <IconButton size="small" onClick={() => setDialogOpen(false)}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Loading versions...
              </Typography>
            </Box>
          ) : versions.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No versions found</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {versions.map((version, index) => (
                <React.Fragment key={version.versionId}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleVersionSelect(version.versionNumber)}
                      selected={version.versionNumber === currentVersion}
                      sx={{
                        py: 2,
                        px: 3,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Chip
                              icon={getVersionIcon(role)}
                              label={`Version ${version.versionNumber}`}
                              size="small"
                              color={getVersionColor(role)}
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor:
                                  version.versionNumber === currentVersion
                                    ? 'rgba(255,255,255,0.2)'
                                    : undefined,
                                color:
                                  version.versionNumber === currentVersion
                                    ? 'white'
                                    : undefined,
                              }}
                            />
                            
                            {version.isCurrentVersion && (
                              <Chip
                                label="Current"
                                size="small"
                                color="success"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                          
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              <Clock size={12} style={{ marginRight: 4 }} />
                              {format(
                                new Date(version.createdAt),
                                'MMM d, HH:mm'
                              )}
                            </Typography>
                            
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, version);
                              }}
                              sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                            >
                              <MoreVertical size={14} />
                            </IconButton>
                          </Box>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.9,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1,
                          }}
                        >
                          {version.contentPreview}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
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

      {/* Version Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180, borderRadius: 2 }
        }}
      >
        <MenuItem
          onClick={() => selectedVersionForMenu && handleCopyVersion(selectedVersionForMenu.content)}
          sx={{ gap: 1.5 }}
        >
          <Copy size={16} />
          <Typography variant="body2">Copy Content</Typography>
        </MenuItem>
        
        <MenuItem
          onClick={() => selectedVersionForMenu && handleVersionSelect(selectedVersionForMenu.versionNumber)}
          sx={{ gap: 1.5 }}
        >
          <Check size={16} />
          <Typography variant="body2">Switch to This Version</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default VersionNavigator;