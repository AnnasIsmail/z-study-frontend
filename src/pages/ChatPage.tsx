import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Grid,
} from '@mui/material';
import { Send, RefreshCw, Bot, User, Coins, Copy, Check, Repeat } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import ModelSelector from '../components/Chat/ModelSelector';
import ChatMessage from '../components/Chat/ChatMessage';
import ChatHistorySidebar from '../components/Chat/ChatHistory';
import { useAuth } from '../context/AuthContext';
import { getModels, getAllModels, chatCompletionStream } from "../services/llm";
import { getChatHistory } from "../services/conversations";
import {
  LLMModel,
  ChatMessage as ChatMessageType,
  Conversation,
} from "../types";
import { useNavigate } from "react-router-dom";
import ChatHistoryXS from "../components/Chat/ChatHistoryXS";

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedResponse]);

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      // Use getAllModels for backward compatibility with ModelSelector
      const response = await getAllModels();
      setModels(response.data.models);

      // Set default model if none selected
      if (response.data.models.length > 0 && !selectedModel) {
        setSelectedModel(response.data.models[0].id);
      }
    } catch (error) {
      setError("Failed to fetch models");
      console.error("Error fetching models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  // const fetchModelsForSelector = async () => {
  //   try {
  //     setLoadingModels(true);
  //     // Get first page with high limit to show all available models
  //     const response = await getModels({ limit: 1000, sort: 'name-asc' });
  //     const allModels = Array.isArray(response.data.models)
  //       ? response.data.models
  //       : Object.values(response.data.models).flat();

  //     setModels(allModels);

  //     if (allModels.length > 0 && !selectedModel) {
  //       setSelectedModel(allModels[0].id);
  //     }
  //   } catch (error) {
  //     setError('Failed to fetch models');
  //     console.error('Error fetching models:', error);
  //   } finally {
  //     setLoadingModels(false);
  //   }
  // };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedModel) return;

    const userMessage: ChatMessageType = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamedResponse("");
    setError("");

    try {
      const stream = await chatCompletionStream({
        model: selectedModel,
        // messages: [...messages, userMessage],
        messages: [userMessage],
        conversationId: selectedConversation?._id,
      });

      if (!stream) throw new Error("Failed to initialize stream");

      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedContent = "";

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: accumulatedContent },
            ]);
            setStreamedResponse("");
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              let jsonStr = line.slice(5).trim();

              if (jsonStr.startsWith("data: "))
                jsonStr = jsonStr.slice(5).trim();

              if (jsonStr === "[DONE]") continue;

              try {
                const data = JSON.parse(jsonStr);
                console.log(data);

                if (data.choices !== null) {
                  if (data.choices?.[0]?.delta?.content) {
                    accumulatedContent += data.choices[0].delta.content;
                    setStreamedResponse(
                      (prev) => prev + data.choices[0].delta.content
                    );
                  }
                }
                if (data.conversation !== null) {
                  const data = JSON.parse(jsonStr);
                  const conversation: Conversation = data.conversation;
                  console.log(conversation);

                  setSelectedConversation(conversation);
                }
              } catch (e) {
                console.error("Error parsing JSON:", e);
              }
            }
          }
        }
      };

      await processStream();
    } catch (error: any) {
      setError(
        error.message.includes("Insufficient balance")
          ? "Insufficient balance. Please top up to continue."
          : error.message || "Failed to get response"
      );
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
    setSelectedConversation(null);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      setLoadingHistory(true);
      setError("");
      const response = await getChatHistory(conversation._id);

      // Transform chat history into messages format
      const chatMessages: ChatMessageType[] = [];
      response.results.forEach((chat) => {
        chatMessages.push(
          { role: "user", content: chat.content.prompt[0].content },
          { role: "assistant", content: chat.content.response }
        );
      });

      setMessages(chatMessages);
      setSelectedConversation(conversation);
    } catch (error: any) {
      setError("Failed to load conversation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <MainLayout hideFooter>
      <Box
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Grid container sx={{ height: "100%" }}>
          {/* Chat history sidebar */}
          <Grid
            item
            xs={0}
            md={3}
            lg={2}
            sx={{
              display: { xs: "none", md: "block" },
              height: "100%",
              borderRight: "1px solid",
              borderColor: "divider",
              scrollBehavior: "auto",
            }}
          >
            <ChatHistorySidebar
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?._id}
            />
          </Grid>

          {/* Main chat area */}
          <Grid
            item
            xs={12}
            md={9}
            lg={10}
            sx={{
              height: "calc(100vh - 64px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ChatHistoryXS
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation?._id}
                />
                <Bot size={24} />

                {selectedConversation
                  ? selectedConversation.title
                  : "AI Chat Assistant"}
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
                sx={{ mx: 3, mt: 2 }}
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

            <Box
              sx={{
                flexGrow: 1,
                p: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
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
                    height: "100px",
                  }}
                >
                  {loadingHistory ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 && !streamedResponse ? (
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
                        <ChatMessage key={index} message={message} />
                      ))}

                      {streamedResponse && (
                        <ChatMessage
                          message={{
                            role: "assistant",
                            content: streamedResponse,
                          }}
                          isStreaming={true}
                          loading={loading}
                        />
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <ModelSelector
                    models={models}
                    selectedModel={selectedModel}
                    onChange={setSelectedModel}
                    loading={loadingModels}
                    disabled={loading}
                  />

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
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default ChatPage;