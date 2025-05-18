import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Send, RefreshCw, Code, User, Coins, Terminal, Copy, Check } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { getModels, chatCompletionStream } from '../services/llm';
import { LLMModel, ChatMessage } from '../types';
import { useNavigate } from 'react-router-dom';

const CodeAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingModels, setLoadingModels] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const fetchModels = async () => {
    try {
      const response = await getModels();
      setModels(response.data.models);
      if (response.data.models.length > 0) {
        setSelectedModel(response.data.models[0].id);
      }
    } catch (error) {
      setError('Failed to fetch models');
    } finally {
      setLoadingModels(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedModel) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError('');
    setLoading(true);
    setStreamingContent('');

    try {
      const response = await chatCompletionStream({
        model: selectedModel,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert programming assistant. Provide clear, efficient, and well-documented code solutions. Always explain your code and include best practices.' 
          },
          ...messages,
          userMessage
        ]
      });

      const reader = response.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                setStreamingContent(prev => prev + parsed.choices[0].delta.content);
              }
            } catch (e) {
              console.error('Failed to parse streaming data:', e);
            }
          }
        }
      }

      // Add the complete streamed message to the messages array
      if (streamingContent) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: streamingContent
        }]);
        setStreamingContent('');
      }
    } catch (error: any) {
      if (error.message.includes('Insufficient balance')) {
        setError('Insufficient balance. Please top up to continue.');
      } else {
        setError(error.message || 'Failed to get response');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    setStreamingContent('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const extractCodeBlocks = (content: string) => {
    const parts = [];
    let currentIndex = 0;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: content.slice(currentIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2].trim()
      });
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(currentIndex)
      });
    }
    
    return parts;
  };

  const renderMessage = (content: string, isUser: boolean) => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: isUser ? 'primary.main' : 'background.default',
        color: isUser ? 'white' : 'text.primary',
        width: '100%'
      }}
    >
      {isUser ? (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </Typography>
      ) : (
        extractCodeBlocks(content).map((part, i) => (
          part.type === 'code' ? (
            <Box 
              key={i} 
              sx={{ 
                position: 'relative',
                my: 2,
                '&:first-of-type': { mt: 0 },
                '&:last-of-type': { mb: 0 }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1
                }}
              >
                <Tooltip title={copied === part.content ? 'Copied!' : 'Copy code'}>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(part.content)}
                    sx={{
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    {copied === part.content ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: darkMode ? '#1e1e1e' : '#f5f5f5',
                  color: darkMode ? '#d4d4d4' : '#1e1e1e',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  overflow: 'auto'
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  <code>{part.content}</code>
                </pre>
              </Paper>
            </Box>
          ) : (
            <Typography 
              key={i} 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                my: 2,
                '&:first-of-type': { mt: 0 },
                '&:last-of-type': { mb: 0 }
              }}
            >
              {part.content}
            </Typography>
          )
        ))
      )}
    </Paper>
  );

  return (
    <MainLayout>
      <Box sx={{ py: 4, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Terminal size={24} />
              Code Assistant
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="Dark Mode"
              />
              
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Coins size={16} />
                Balance: <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{user?.balance?.toLocaleString()} IDR</Box>
              </Typography>
              
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => navigate('/topup')}
              >
                Top Up
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                error.includes('Insufficient balance') && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => navigate('/topup')}
                  >
                    Top Up Now
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          )}

          <Paper 
            elevation={2} 
            sx={{ 
              p: 2,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              mb: 2,
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2
            }}>
              {messages.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                  textAlign: 'center',
                  gap: 2
                }}>
                  <Code size={48} />
                  <Typography variant="h6">
                    Start coding with AI assistance
                  </Typography>
                  <Typography variant="body2">
                    Ask questions, get code examples, debug issues, and more
                  </Typography>
                </Box>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'flex-start',
                        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                      }}
                    >
                      {message.role === 'assistant' ? (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <Code size={20} />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'secondary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <User size={20} />
                        </Box>
                      )}
                      
                      {renderMessage(message.content, message.role === 'user')}
                    </Box>
                  ))}

                  {/* Streaming message */}
                  {streamingContent && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'flex-start',
                        alignSelf: 'flex-start',
                        maxWidth: '85%',
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        <Code size={20} />
                      </Box>
                      {renderMessage(streamingContent, false)}
                    </Box>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Model</InputLabel>
                <Select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  label="Select Model"
                  disabled={loadingModels || loading}
                >
                  {loadingModels ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading models...
                    </MenuItem>
                  ) : (
                    models.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask for code examples, debugging help, or programming questions..."
                disabled={loading || !selectedModel}
                sx={{ flexGrow: 1 }}
              />

              <Tooltip title="Clear chat">
                <IconButton 
                  onClick={clearChat}
                  disabled={loading || messages.length === 0}
                >
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!input.trim() || loading || !selectedModel}
                sx={{ minWidth: 100 }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
              >
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default CodeAssistantPage;