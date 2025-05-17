import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import { BarChart2 } from 'lucide-react';
import { getChatHistory } from '../../services/user';
import { ChatHistory as ChatHistoryType } from '../../types';

const ChatHistory: React.FC = () => {
  const [chats, setChats] = useState<ChatHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await getChatHistory(page + 1, rowsPerPage);
        setChats(response.data.chats);
        setTotalItems(response.data.pagination.total);
      } catch (error) {
        setError('Failed to fetch chat history');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        maxWidth: 900,
        mx: 'auto',
        mt: 4,
        mb: 4
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Chat History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && chats.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : chats.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No chat history found
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>
                    <Tooltip title="Number of tokens used in your prompt">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>Prompt Tokens</span>
                        <BarChart2 size={16} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Number of tokens used in the AI's response">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>Completion Tokens</span>
                        <BarChart2 size={16} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>Cost (IDR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chats.map((chat) => (
                  <TableRow key={chat.chatId} hover>
                    <TableCell>
                      {new Date(chat.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {chat.model}
                    </TableCell>
                    <TableCell>
                      {chat.promptTokens.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {chat.completionTokens.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>
                      {chat.cost.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}
    </Paper>
  );
};

export default ChatHistory;