import React, { useState, useEffect, useRef } from "react";
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
  Snackbar,
} from "@mui/material";
import {
  Send,
  RefreshCw,
  Bot,
  User,
  Coins,
  Copy,
  Check,
  Repeat,
} from "lucide-react";
import MainLayout from "../components/Layout/MainLayout";
import ModelSelector from "../components/Chat/ModelSelector";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatHistorySidebar from "../components/Chat/ChatHistory";
import { useAuth } from "../context/AuthContext";
import { getModels, getAllModels, chatCompletionStream } from "../services/llm";
import {
  getConversationChats,
  editMessage,
  regenerateResponse,
  switchToVersion,
  getChatVersions,
} from "../services/conversations";
import {
  LLMModel,
  ChatMessage as ChatMessageType,
  Conversation,
  StreamResponse,
} from "../types";
import { useNavigate, useParams } from "react-router-dom";
import ChatHistoryXS from "../components/Chat/ChatHistoryXS";

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedModelName, setSelectedModelName] = useState<string>("");
  const [selectedModelDetails, setSelectedModelDetails] =
    useState<LLMModel | null>(null);
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
  const [optimizationInfo, setOptimizationInfo] = useState<
    StreamResponse["optimizationInfo"] | null
  >(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedResponse]);

  // Load conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversationById(conversationId);
    } else {
      // Clear conversation if no ID in URL
      setMessages([]);
      setSelectedConversation(null);
      setOptimizationInfo(null);
    }
  }, [conversationId]);

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const response = await getAllModels();
      setModels(response.data.models);

      if (response.data.models.length > 0 && !selectedModel) {
        const defaultModel = response.data.models[0];
        setSelectedModel(defaultModel.id);
        setSelectedModelName(defaultModel.name);
        setSelectedModelDetails(defaultModel);
      }
    } catch (error) {
      setError("Failed to fetch models");
      console.error("Error fetching models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  const loadConversationById = async (convId: string) => {
    try {
      setLoadingHistory(true);
      setError("");

      const response = await getConversationChats(convId, {
        currentVersionOnly: true,
        activeOnly: true,
      });

      if (response) {
        // Transform the API response to match our ChatMessage format
        const chatMessages: ChatMessageType[] = response.results.map(
          (chat) => ({
            chatId: chat.chatId,
            role: chat.role as "user" | "assistant",
            content: chat.content,
            messageIndex: chat.messageIndex,
            isActive: chat.isActive,
            isEdited: chat.isEdited,
            versionNumber: chat.versionNumber,
            isCurrentVersion: chat.isCurrentVersion,
            hasMultipleVersions: chat.hasMultipleVersions,
            totalVersions: chat.totalVersions,
            availableVersions: chat.availableVersions,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
          })
        );

        setMessages(chatMessages);

        // Set conversation info (you might need to get this from another API call)
        setSelectedConversation({
          conversationId: convId,
          title: `Conversation ${convId.slice(0, 8)}...`,
          lastMessageAt:
            chatMessages[chatMessages.length - 1]?.createdAt ||
            new Date().toISOString(),
          createdAt: chatMessages[0]?.createdAt || new Date().toISOString(),
        });

        setOptimizationInfo(null);
      }
    } catch (error: any) {
      setError("Failed to load conversation");
      console.error("Error loading conversation:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const model = models.find((m) => m.id === modelId);
    setSelectedModelName(model?.name || modelId);
    setSelectedModelDetails(model || null);
  };

  const getMaxTokens = () => {
    if (!selectedModelDetails) return 4096;
    return (
      selectedModelDetails.top_provider?.max_completion_tokens ||
      Math.min(selectedModelDetails.context_length * 0.5, 4096)
    );
  };

  const prepareChatHistory = (): ChatMessageType[] => {
    return messages.map((msg) => ({
      ...msg,
      updated: msg.isEdited || false,
    }));
  };

  const calculateHistorySize = (history: ChatMessageType[]): number => {
    const jsonString = JSON.stringify(history);
    return new Blob([jsonString]).size;
  };

  const optimizeChatHistory = (
    history: ChatMessageType[]
  ): ChatMessageType[] => {
    const maxSize = 4 * 1024 * 1024;
    let optimizedHistory = [...history];

    while (
      calculateHistorySize(optimizedHistory) > maxSize &&
      optimizedHistory.length > 2
    ) {
      optimizedHistory = optimizedHistory.slice(2);
    }

    return optimizedHistory;
  };

  const sendMessage = async (
    messageContent: string,
    conversationId?: string
  ) => {
    const userMessage: ChatMessageType = {
      role: "user",
      content: messageContent,
      isEdited: false,
    };

    setLoading(true);
    setStreamedResponse("");
    setError("");
    setOptimizationInfo(null);

    try {
      const chatHistory = prepareChatHistory();
      const optimizedHistory = optimizeChatHistory(chatHistory);

      const stream = await chatCompletionStream({
        model: selectedModel,
        messages: [userMessage],
        max_tokens: getMaxTokens(),
        conversationId: conversationId,
        chatHistory: optimizedHistory,
      });

      if (!stream) throw new Error("Failed to initialize stream");

      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedContent = "";
      let streamResponse: StreamResponse | null = null;

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (streamResponse?.newChats) {
              const finalUserMessage: ChatMessageType = {
                ...userMessage,
                chatId: streamResponse.newChats.userChat.chatId,
                messageIndex: messages.length,
                isActive: true,
                isCurrentVersion: true,
                versionNumber: 1,
                totalVersions: 1,
                hasMultipleVersions: false,
              };

              const finalAssistantMessage: ChatMessageType = {
                role: "assistant",
                content: accumulatedContent,
                chatId: streamResponse.newChats.assistantChat.chatId,
                messageIndex: messages.length + 1,
                isActive: true,
                isCurrentVersion: true,
                versionNumber: 1,
                totalVersions: 1,
                hasMultipleVersions: false,
                isEdited: false,
              };

              setMessages((prev) => [
                ...prev,
                finalUserMessage,
                finalAssistantMessage,
              ]);
            } else {
              setMessages((prev) => [
                ...prev,
                userMessage,
                {
                  role: "assistant",
                  content: accumulatedContent,
                  isEdited: false,
                },
              ]);
            }

            setStreamedResponse("");
            setRefreshHistoryTrigger((prev) => prev + 1);

            if (streamResponse?.optimizationInfo) {
              setOptimizationInfo(streamResponse.optimizationInfo);
            }

            // Update URL with conversation ID if we got one
            if (
              streamResponse?.conversation?.conversationId &&
              !conversationId
            ) {
              navigate(`/chat/${streamResponse.conversation.conversationId}`, {
                replace: true,
              });
              setSelectedConversation(streamResponse.conversation);
            }
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

                if (data.choices !== null) {
                  if (data.choices?.[0]?.delta?.content) {
                    accumulatedContent += data.choices[0].delta.content;
                    setStreamedResponse(
                      (prev) => prev + data.choices[0].delta.content
                    );
                  }
                }

                if (data.conversation !== null) {
                  streamResponse = data as StreamResponse;
                  setSelectedConversation(streamResponse.conversation);
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

  const handleSend = async () => {
    if (!input.trim() || !selectedModel) return;

    setInput("");
    await sendMessage(input, selectedConversation?.conversationId);
  };

  const handleEditMessage = async (
    messageIndex: number,
    newContent: string,
    model: string
  ) => {
    const message = messages[messageIndex];
    if (!message?.chatId) return;

    try {
      setLoading(true);
      setStreamedResponse("");
      setError("");

      // Call edit API and start streaming
      const response = await editMessage(message.chatId, {
        content: newContent,
        model: model,
      });

      if (response.success) {
        // Update the edited user message
        const updatedMessages = [...messages];

        // Update user message with edited content and version info
        updatedMessages[messageIndex] = {
          ...response.data.editedUserChat,
          role: "user",
          content: newContent,
          isEdited: true,
          versionNumber: response.data.editedUserChat.versionNumber || 1,
          hasMultipleVersions:
            (response.data.editedUserChat.totalVersions || 1) > 1,
        };

        // Remove all messages after the edited one
        const messagesUpToEdit = updatedMessages.slice(0, messageIndex + 1);

        // Add the new assistant response
        const newAssistantMessage: ChatMessageType = {
          ...response.data.newAssistantChat,
          role: "assistant",
          isEdited: false,
          versionNumber: 1,
          hasMultipleVersions: false,
        };

        messagesUpToEdit.push(newAssistantMessage);
        setMessages(messagesUpToEdit);

        setSnackbarMessage("Message edited and response regenerated");
        setSnackbarOpen(true);
        setRefreshHistoryTrigger((prev) => prev + 1);
      }
    } catch (error: any) {
      setError(error.message || "Failed to edit message");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateFromMessage = async (
    messageIndex: number,
    model: string
  ) => {
    const message = messages[messageIndex];
    if (!message?.chatId) return;

    try {
      setLoading(true);
      const response = await regenerateResponse(message.chatId, model);

      if (response.success) {
        // Update the message with new version info
        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = {
          ...response.data.newAssistantChat,
          versionNumber: response.data.newAssistantChat.versionNumber || 1,
          hasMultipleVersions:
            (response.data.newAssistantChat.totalVersions || 1) > 1,
        };

        setMessages(updatedMessages);
        setSnackbarMessage("Response regenerated");
        setSnackbarOpen(true);
        setRefreshHistoryTrigger((prev) => prev + 1);
      }
    } catch (error: any) {
      setError(error.message || "Failed to regenerate response");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchVersion = async (
    messageIndex: number,
    versionNumber: number
  ) => {
    const message = messages[messageIndex];
    if (!message?.chatId) return;

    try {
      setLoading(true);
      const response = await switchToVersion(message.chatId, { versionNumber });

      if (response.success) {
        // Update conversation thread with switched version
        const newMessages = response.data.conversationThread.map(
          (msg, idx) => ({
            ...msg,
            messageIndex: idx,
          })
        );

        setMessages(newMessages);
        setSnackbarMessage(`Switched to version ${versionNumber}`);
        setSnackbarOpen(true);
        setRefreshHistoryTrigger((prev) => prev + 1);
      }
    } catch (error: any) {
      setError(error.message || "Failed to switch version");
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersions = async (messageIndex: number) => {
    const message = messages[messageIndex];
    if (!message?.chatId) return;

    try {
      const response = await getChatVersions(message.chatId);
      if (response.success) {
        // Update message with version information
        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          availableVersions: response.data.versions.map((v) => ({
            versionNumber: v.versionNumber,
            versionId: v.versionId,
            content: v.content,
            createdAt: v.createdAt,
          })),
        };
        setMessages(updatedMessages);
      }
    } catch (error: any) {
      console.error("Failed to fetch versions:", error);
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
    // Navigate to chat without conversation ID
    navigate("/chat");
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    // Navigate to the conversation URL
    navigate(`/chat/${conversation.conversationId}`);
  };

  const formatTimestamp = (index: number) => {
    const now = new Date();
    const messageTime = new Date(
      now.getTime() - (messages.length - index) * 60000
    );
    return messageTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const availableModelsForSelect = models.map((model) => ({
    id: model.id,
    name: model.name,
  }));

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
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
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
                    selectedConversationId={
                      selectedConversation?.conversationId
                    }
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, minWidth: "fit-content" }}
                >
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

              {/* Optimization Info */}
              {optimizationInfo && (
                <Box
                  sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Chat History Optimization:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Typography variant="caption">
                      Original: {optimizationInfo.originalHistoryLength}{" "}
                      messages
                    </Typography>
                    <Typography variant="caption">
                      Optimized: {optimizationInfo.optimizedHistoryLength}{" "}
                      messages
                    </Typography>
                    <Typography variant="caption">
                      Tokens Saved:{" "}
                      {optimizationInfo.tokensSaved.toLocaleString()}
                    </Typography>
                    <Typography variant="caption">
                      Updated Chats: {optimizationInfo.updatedChatsCount}
                    </Typography>
                  </Box>
                </Box>
              )}
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
                    gap: 3,
                    p: 2,
                    height: "100px",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      bgcolor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "divider",
                      borderRadius: "3px",
                      "&:hover": {
                        bgcolor: "text.secondary",
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
                          key={`${message.chatId || index}`}
                          message={message}
                          model={
                            message.role === "assistant"
                              ? selectedModelName
                              : undefined
                          }
                          showHeader={true}
                          timestamp={formatTimestamp(index)}
                          messageIndex={index}
                          onEditMessage={(content, model) =>
                            handleEditMessage(index, content, model)
                          }
                          onRegenerateFromMessage={(model) =>
                            handleRegenerateFromMessage(index, model)
                          }
                          onSwitchVersion={(versionNumber) =>
                            handleSwitchVersion(index, versionNumber)
                          }
                          onViewVersions={() => handleViewVersions(index)}
                          canRegenerate={
                            index === messages.length - 1 ||
                            messages[index + 1]?.role === "assistant"
                          }
                          availableModels={availableModelsForSelect}
                        />
                      ))}

                      {streamedResponse && (
                        <ChatMessage
                          message={{
                            role: "assistant",
                            content: streamedResponse,
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

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </MainLayout>
  );
};

export default ChatPage;
