import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { Trash2, MessageSquare, MoreVertical, RefreshCw } from 'lucide-react';
import { Conversation, ChatHistory } from '../../types';
import { getConversations, deleteConversation, getChatHistory } from '../../services/conversations';
import { format } from 'date-fns';

interface ChatHistorySidebarProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  onSelectConversation,
  selectedConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async (refresh = false) => {
    try {
      setLoading(true);
      const newPage = refresh ? 1 : page;
      const response = await getConversations(newPage);
      console.log(response);
      
      if (refresh) {
        setConversations(response.results);
      } else {
        setConversations((prev) => [...prev, ...response.results]);
      }
      
      setHasMore(newPage < response.totalPages);
      setPage(newPage + 1);
      setError('');
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchConversations();
    }
  };

  const handleRefresh = () => {
    fetchConversations(true);
  };

  const handleDeleteClick = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;

    try {
      setDeleting(true);
      await deleteConversation(conversationToDelete);
      setConversations((prev) =>
        prev.filter((conv) => conv.conversationId !== conversationToDelete)
      );
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
      fetchConversations();
    } catch (err) {
      setError("Failed to delete conversation");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        borderLeft: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Chat History
        </Typography>
        <Tooltip title="Refresh conversations">
          <IconButton size="small" onClick={handleRefresh} disabled={loading}>
            {loading ? <CircularProgress size={18} /> : <RefreshCw size={18} />}
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      )}

      <List sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
        {conversations.length === 0 && !loading ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No conversations yet
            </Typography>
          </Box>
        ) : (
          conversations.map((conversation) => (
            <ListItem
              key={conversation.conversationId}
              disablePadding
              sx={{ mb: 0.5 }}
            >
              <ListItemButton
                selected={
                  selectedConversationId === conversation.conversationId
                }
                onClick={() => onSelectConversation(conversation)}
                sx={{
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                  },
                }}
              >
                <ListItemText
                  primary={conversation.title}
                  secondary={formatDate(conversation.lastMessageAt)}
                  primaryTypographyProps={{
                    noWrap: true,
                    variant: "body2",
                    fontWeight:
                      selectedConversationId === conversation.conversationId
                        ? 600
                        : 400,
                  }}
                  secondaryTypographyProps={{
                    variant: "caption",
                    color: "text.secondary",
                  }}
                />
                <Tooltip title="Delete conversation">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) =>
                      handleDeleteClick(conversation.conversationId, e)
                    }
                    sx={{
                      opacity: 0.7,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Tooltip>
              </ListItemButton>
            </ListItem>
          ))
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {hasMore && !loading && (
          <Box sx={{ textAlign: "center", p: 1 }}>
            <Button size="small" onClick={handleLoadMore}>
              Load more
            </Button>
          </Box>
        )}
      </List>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this conversation? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={16} /> : <Trash2 size={16} />
            }
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatHistorySidebar;