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
  Chip,
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
  StreamResponse,
} from "../types";
import { useNavigate } from "react-router-dom";
import ChatHistoryXS from "../components/Chat/ChatHistoryXS";

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedModelName, setSelectedModelName] = useState<string>("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);
  const [optimizationInfo, setOptimizationInfo] = useState<any>(null);
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
        const defaultModel = response.data.models[0];
        setSelectedModel(defaultModel.id);
        setSelectedModelName(defaultModel.name);
      }
    } catch (error) {
      setError("Failed to fetch models");
      console.error("Error fetching models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const model = models.find(m => m.id === modelId);
    setSelectedModelName(model?.name || modelId);
  };

  const sendMessage = async (messageContent: string, conversationId?: string, editedMessages?: ChatMessageType[]) => {
    const userMessage: ChatMessageType = { 
      role: "user", 
      content: messageContent,
      chatId: `temp-${Date.now()}`,
      updated: false
    };
    
    setLoading(true);
    setStreamedResponse("");
    setError("");
    setOptimizationInfo(null);

    try {
      // Prepare chat history with updated flags
      const chatHistory = editedMessages || messages.map((msg, index) => ({
        ...msg,
        chatId: msg.chatId || `msg-${index}`,
        updated: msg.updated || false
      }));

      const stream = await chatCompletionStream({
        model: selectedModel,
        messages: [userMessage],
        conversationId: conversationId,
        chatHistory: chatHistory,
      });

      if (!stream) throw new Error("Failed to initialize stream");

      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedContent = "";
      let streamResponseData: StreamResponse = {};

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Create final assistant message with chatId from response
            const assistantMessage: ChatMessageType = {
              role: "assistant",
              content: accumulatedContent,
              chatId: streamResponseData.newChats?.assistantChat?.chatId || `assistant-${Date.now()}`,
              updated: false
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStreamedResponse("");
            
            // Show optimization info if available
            if (streamResponseData.optimizationInfo) {
              setOptimizationInfo(streamResponseData.optimizationInfo);
              setTimeout(() => setOptimizationInfo(null), 5000); // Hide after 5 seconds
            }
            
            // Trigger history refresh after successful completion
            setRefreshHistoryTrigger(prev => prev + 1);
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
                const data: StreamResponse = JSON.parse(jsonStr);
                console.log(data);

                // Handle streaming content
                if (data.choices?.[0]?.delta?.content) {
                  accumulatedContent += data.choices[0].delta.content;
                  setStreamedResponse(
                    (prev) => prev + data.choices[0].delta.content
                  );
                }

                // Handle conversation data
                if (data.conversation) {
                  setSelectedConversation(data.conversation);
                  streamResponseData.conversation = data.conversation;
                }

                // Handle usage and cost data
                if (data.usage) {
                  streamResponseData.usage = data.usage;
                }

                if (data.cost) {
                  streamResponseData.cost = data.cost;
                }

                // Handle new chat IDs
                if (data.newChats) {
                  streamResponseData.newChats = data.newChats;
                  // Update the user message with the correct chatId
                  setMessages(prev => {
                    const updated = [...prev];
                    if (updated[updated.length - 1]?.role === 'user') {
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        chatId: data.newChats!.userChat.chatId
                      };
                    }
                    return updated;
                  });
                }

                // Handle optimization info
                if (data.optimizationInfo) {
                  streamResponseData.optimizationInfo = data.optimizationInfo;
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
          : error.message.includes("exceeds 4MB limit")
          ? "Conversation history is too large. Please start a new conversation or clear some messages."
          : error.message || "Failed to get response"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedModel) return;

    const userMessage: ChatMessageType = { 
      role: "user", 
      content: input,
      chatId: `temp-${Date.now()}`,
      updated: false
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    await sendMessage(input, selectedConversation?.conversationId);
  };

  const handleEditMessage = (index: number, newContent: string) => {
    // Update the message content and mark as updated
    setMessages((prev) => {
      const updated = [...prev];
      updated[index] = { 
        ...updated[index], 
        content: newContent,
        updated: true
      };
      
      // If editing a user message, remove all subsequent messages and regenerate
      if (updated[index].role === 'user') {
        const messagesUpToEdit = updated.slice(0, index + 1);
        setMessages(messagesUpToEdit);
        
        // Regenerate response from this point with updated history
        setTimeout(() => {
          sendMessage(newContent, selectedConversation?.conversationId, messagesUpToEdit);
        }, 100);
        
        return messagesUpToEdit;
      }
      
      return updated;
    });
  };

  const handleRegenerateFromMessage = (index: number) => {
    // Find the last user message before or at this index
    const messagesUpToRegenerate = messages.slice(0, index);
    const lastUserMessageIndex = messagesUpToRegenerate.findLastIndex(msg => msg.role === 'user');
    
    if (lastUserMessageIndex !== -1) {
      const lastUserMessage = messagesUpToRegenerate[lastUserMessageIndex];
      const messagesUpToUser = messages.slice(0, lastUserMessageIndex + 1);
      
      // Mark the regenerated messages as updated
      const updatedMessages = messagesUpToUser.map((msg, i) => ({
        ...msg,
        updated: i >= lastUserMessageIndex ? true : msg.updated
      }));
      
      setMessages(updatedMessages);
      
      // Regenerate response
      setTimeout(() => {
        sendMessage(lastUserMessage.content, selectedConversation?.conversationId, updatedMessages);
      }, 100);
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
    setOptimizationInfo(null);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      setLoadingHistory(true);
      setError("");
      const response = await getChatHistory(conversation.conversationId);

      // Transform chat history into messages format
      const chatMessages: ChatMessageType[] = [];
      response.results.forEach((chat) => {
        chatMessages.push(
          { 
            role: "user", 
            content: chat.content.prompt[0].content,
            chatId: `user-${chat.conversationId}`,
            updated: false
          },
          { 
            role: "assistant", 
            content: chat.content.response,
            chatId: `assistant-${chat.conversationId}`,
            updated: false
          }
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

  const formatTimestamp = (index: number) => {
    const now = new Date();
    const messageTime = new Date(now.getTime() - (messages.length - index) * 60000);
    return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            }}
          >
            <ChatHistorySidebar
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.conversationId}
              refreshTrigger={refreshHistoryTrigger}
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
            {/* Header with model selector */}
            <Box
              sx={{
                p: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                    selectedConversationId={selectedConversation?.conversationId}
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

              {/* Model Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 'fit-content' }}>
                  AI Model:
                </Typography>
                <Box sx={{ maxWidth: 400, minWidth: 300 }}>
                  <ModelSelector
                    models={models}
                    selectedModel={selectedModel}
                    onChange={handleModelChange}
                    loading={loadingModels}
                    disabled={loading}
                  />
                </Box>
                {selectedModelName && (
                  <Chip
                    label={`Using ${selectedModelName}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
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

            {optimizationInfo && (
              <Alert
                severity="info"
                sx={{ mx: 3, mt: 2 }}
                onClose={() => setOptimizationInfo(null)}
              >
                <Typography variant="body2">
                  <strong>Chat History Optimized:</strong> Reduced from {optimizationInfo.originalHistoryLength} to {optimizationInfo.optimizedHistoryLength} messages, 
                  saving {optimizationInfo.tokensSaved} tokens. {optimizationInfo.updatedChatsCount} messages were updated.
                </Typography>
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
                    gap: 3,
                    p: 2,
                    height: "100px",
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: 'divider',
                      borderRadius: '3px',
                      '&:hover': {
                        bgcolor: 'text.secondary',
                      },
                    },
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
                        <ChatMessage 
                          key={`${message.chatId}-${index}`}
                          message={message}
                          model={message.role === 'assistant' ? selectedModelName : undefined}
                          showHeader={true}
                          timestamp={formatTimestamp(index)}
                          messageIndex={index}
                          onEditMessage={(newContent) => handleEditMessage(index, newContent)}
                          onRegenerateFromMessage={() => handleRegenerateFromMessage(index)}
                          canRegenerate={index === messages.length - 1 || messages[index + 1]?.role === 'assistant'}
                        />
                      ))}

                      {streamedResponse && (
                        <ChatMessage
                          message={{
                            role: "assistant",
                            content: streamedResponse,
                            chatId: `streaming-${Date.now()}`,
                            updated: false
                          }}
                          isStreaming={true}
                          loading={loading}
                          model={selectedModelName}
                          showHeader={true}
                          timestamp="Now"
                        />
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
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