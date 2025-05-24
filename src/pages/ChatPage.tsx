import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";
import { Send, RefreshCw, Bot, User, Coins } from "lucide-react";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getModels, chatCompletionStream } from "../services/llm";
import { LLMModel, ChatMessage } from "../types";
import { useNavigate } from "react-router-dom";

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamedResponse, setStreamedResponse] = useState("");

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedResponse]);

  const fetchModels = async () => {
    try {
      const response = await getModels();
      setModels(response.data.models);
      if (response.data.models.length > 0) {
        setSelectedModel(response.data.models[0].id);
      }
    } catch (error) {
      setError("Failed to fetch models");
    } finally {
      setLoadingModels(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

const handleSend = async () => {
  if (!input.trim() || !selectedModel) return;

  const userMessage = { role: 'user', content: input };
  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setLoading(true);
  setStreamedResponse('');
  setError('');

  try {
    const stream = await chatCompletionStream({
      model: selectedModel,
      messages: [...messages, userMessage]
    });

    if (!stream) throw new Error('Failed to initialize stream');

    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedContent = '';

    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Finalize the message when stream ends
          setMessages(prev => [...prev, { role: 'assistant', content: accumulatedContent }]);
          setStreamedResponse('');
          break;
        }

        // Handle Uint8Array chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Save incomplete line

        for (const line of lines) {
            console.log(line);
            
          if (line.startsWith('data: ')) {
            let jsonStr = line.slice(5).trim();
            
            if (jsonStr.startsWith('data: ')) jsonStr = jsonStr.slice(5).trim();

            if (jsonStr === '[DONE]') continue;

            try {
                console.log(jsonStr);
                
              const data = JSON.parse(jsonStr);
              if (data.choices?.[0]?.delta?.content) {
                accumulatedContent += data.choices[0].delta.content;
                setStreamedResponse(prev => prev + data.choices[0].delta.content);
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    };

    await processStream();

  } catch (error) {
    setError(error.message.includes('Insufficient balance') 
      ? 'Insufficient balance. Please top up to continue.'
      : error.message || 'Failed to get response');
  } finally {
    setLoading(false);
  }
};

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamedResponse("");
    setError("");
  };

  return (
    <MainLayout hideFooter>
      <Box
        sx={{
          py: 4,
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              AI Chat Assistant
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Coins size={16} />
                Balance:{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: 600, color: "primary.main" }}
                >
                  {user?.balance?.toLocaleString()} IDR
                </Box>
              </Typography>

              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => navigate("/topup")}
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
                error.includes("Insufficient balance") && (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/topup")}
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
              display: "flex",
              flexDirection: "column",
              mb: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2,
              }}
            >
              {messages.length === 0 && !streamedResponse ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "text.secondary",
                    textAlign: "center",
                    gap: 2,
                  }}
                >
                  <Bot size={48} />
                  <Typography variant="h6">
                    Start a conversation with AI
                  </Typography>
                  <Typography variant="body2">
                    Choose a model and type your message to begin
                  </Typography>
                </Box>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                        alignSelf:
                          message.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                      }}
                    >
                      {message.role === "assistant" ? (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <Bot size={20} />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "secondary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <User size={20} />
                        </Box>
                      )}

                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor:
                            message.role === "user"
                              ? "primary.main"
                              : "background.default",
                          color:
                            message.role === "user" ? "white" : "text.primary",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {message.content}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}

                  {/* Streaming response */}
                  {streamedResponse && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                        alignSelf: "flex-start",
                        maxWidth: "80%",
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <Bot size={20} />
                      </Box>

                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "background.default",
                          color: "text.primary",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {streamedResponse}
                          {loading && (
                            <Box
                              sx={{ display: "inline-block", ml: 1 }}
                            >
                              <CircularProgress size={16} />
                            </Box>
                          )}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
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
                placeholder="Type your message..."
                disabled={loading || !selectedModel}
                sx={{ flexGrow: 1 }}
              />

              <Tooltip title="Clear chat">
                <IconButton
                  onClick={clearChat}
                  disabled={
                    loading || (messages.length === 0 && !streamedResponse)
                  }
                >
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!input.trim() || loading || !selectedModel}
                sx={{ minWidth: 100 }}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Send size={20} />
                  )
                }
              >
                {loading ? "Sending..." : "Send"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default ChatPage;
