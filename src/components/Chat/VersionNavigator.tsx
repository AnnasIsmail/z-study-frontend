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
import { getChatVersions, switchToVersion, deleteVersion, compareVersions } from '../../services/versioning';

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
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);

  const loadVersions = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Use the new versioning API
      const response = await getChatVersions(chatId, {
        versionType: role,
        limit: 50, // Get more versions for better UX
      });
      
      setVersions(response.data.versions);
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
      await switchToVersion(chatId, {
        versionNumber,
        versionType: role,
      });
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

  const handleDeleteVersion = async (versionNumber: number) => {
    if (!selectedVersionForMenu) return;
    
    try {
      await deleteVersion(chatId, versionNumber, role);
      await loadVersions(); // Reload versions
      handleMenuClose();
    } catch (error: any) {
      setError(error.message || 'Failed to delete version');
    }
  };

  const handleCopyVersion = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedVersions([]);
  };

  const handleVersionToggleForCompare = (versionNumber: number) => {
    if (selectedVersions.includes(versionNumber)) {
      setSelectedVersions(prev => prev.filter(v => v !== versionNumber));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, versionNumber]);
    }
  };

  const handleCompareVersions = async () => {
    if (selectedVersions.length !== 2) return;
    
    try {
      const comparison = await compareVersions(
        chatId,
        selectedVersions[0],
        selectedVersions[1],
        role
      );
      // Handle comparison result (could open a new dialog or navigate to comparison view)
      console.log('Version comparison:', comparison);
    } catch (error: any) {
      setError(error.message || 'Failed to compare versions');
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
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {versions.length > 1 && (
              <Button
                size="small"
                variant={compareMode ? 'contained' : 'outlined'}
                onClick={toggleCompareMode}
                startIcon={<GitBranch size={16} />}
              >
                Compare
              </Button>
            )}
            
            {compareMode && selectedVersions.length === 2 && (
              <Button
                size="small"
                variant="contained"
                onClick={handleCompareVersions}
                startIcon={<Eye size={16} />}
              >
                Compare Selected
              </Button>
            )}
          </Box>
          
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
                      onClick={() => {
                        if (compareMode) {
                          handleVersionToggleForCompare(version.versionNumber);
                        } else {
                          handleVersionSelect(version.versionNumber);
                        }
                      }}
                      selected={
                        compareMode
                          ? selectedVersions.includes(version.versionNumber)
                          : version.versionNumber === currentVersion
                      }
                      sx={{
                        py: 2,
                        px: 3,
                        '&.Mui-selected': {
                          bgcolor: compareMode ? 'action.selected' : 'primary.main',
                          color: compareMode ? 'inherit' : 'white',
                          '&:hover': {
                            bgcolor: compareMode ? 'action.selected' : 'primary.dark',
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
                                  version.versionNumber === currentVersion && !compareMode
                                    ? 'rgba(255,255,255,0.2)'
                                    : undefined,
                                color:
                                  version.versionNumber === currentVersion && !compareMode
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

                            {compareMode && selectedVersions.includes(version.versionNumber) && (
                              <Chip
                                icon={<Check size={12} />}
                                label="Selected"
                                size="small"
                                color="info"
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
        
        <Divider />
        
        <MenuItem
          onClick={() => selectedVersionForMenu && handleDeleteVersion(selectedVersionForMenu.versionNumber)}
          sx={{ gap: 1.5, color: 'error.main' }}
          disabled={selectedVersionForMenu?.isCurrentVersion}
        >
          <Trash2 size={16} />
          <Typography variant="body2">Delete Version</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default VersionNavigator;