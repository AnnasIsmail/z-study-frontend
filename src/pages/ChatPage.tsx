import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  Edit,
  Save,
  X,
} from "lucide-react";
import MainLayout from "../components/Layout/MainLayout";
import ModelSelector from "../components/Chat/ModelSelector";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatHistorySidebar from "../components/Chat/ChatHistory";
import { useAuth } from "../context/AuthContext";
import { getModels, getAllModels, chatCompletionStream } from "../services/llm";
import {
  getConversationChats,
  editMessageAndComplete,
  switchToVersion,
  getChatVersions,
  generateResponse,
  getChatById,
} from "../services/conversations";
import {
  LLMModel,
  ChatMessage as ChatMessageType,
  Conversation,
  StreamResponse,
} from "../types";
import { ChatVersion } from "../types/versioning";
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
  
  // Lazy loading states
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
      resetVersionState();
    }
  }, [conversationId]);

  const resetVersionState = () => {
    setLastEvaluatedKey(undefined);
    setHasMoreMessages(false);
  };

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

  const loadConversationById = async (convId: string, loadMore = false) => {
    try {
      if (!loadMore) {
        setLoadingHistory(true);
        setMessages([]);
        resetVersionState();
      } else {
        setLoadingMore(true);
      }
      setError("");

      const response = await getConversationChats(convId, {
        limit: 20,
        lastEvaluatedKey: loadMore ? lastEvaluatedKey : undefined,
        sortOrder: "desc",
        activeOnly: true,
        currentVersionOnly: true,
      });

      if (response.success && response.data) {
        const results = response.data.results || [];
        console.log("Conversation response:", results);

        if (results.length > 0) {
          const processedMessages: ChatMessageType[] = [];

          // Process each chat item which now contains both user and assistant content
          results.forEach(chat => {
            // Add user message
            const userMessage: ChatMessageType = {
              chatId: chat.chatId,
              role: 'user',
              content: chat.content.prompt,
              messageIndex: processedMessages.length,
              isActive: true,
              isCurrentVersion: chat.isLatestVersion,
              userVersionNumber: chat.userVersion,
              versionNumber: chat.userVersion,
              totalVersions: chat.totalVersions || 1,
              hasMultipleVersions: chat.hasMultipleVersions || false,
              editInfo: { 
                canEdit: chat.canEdit || true,
                isEdited: chat.versionType === 'user_edit' 
              },
              createdAt: chat.createdAt,
            };
            processedMessages.push(userMessage);

            // Add assistant message if response exists
            if (chat.content.response) {
              const assistantMessage: ChatMessageType = {
                chatId: chat.chatId + '_assistant', // Create unique ID for assistant message
                role: 'assistant',
                content: chat.content.response,
                messageIndex: processedMessages.length,
                isActive: true,
                isCurrentVersion: chat.isLatestVersion,
                assistantVersionNumber: chat.assistantVersion,
                versionNumber: chat.assistantVersion,
                totalVersions: chat.totalVersions || 1,
                hasMultipleVersions: chat.hasMultipleVersions || false,
                linkedUserChatId: chat.chatId, // Link to the user message
                editInfo: { 
                  canEdit: false,
                  isEdited: false 
                },
                createdAt: chat.createdAt,
              };
              processedMessages.push(assistantMessage);
            }
          });

          // Sort messages by creation time
          processedMessages.sort((a, b) => 
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          );

          if (loadMore) {
            setMessages(prev => [...processedMessages, ...prev]);
          } else {
            setMessages(processedMessages);
            setSelectedConversation({
              conversationId: convId,
              title: `Conversation ${convId.slice(0, 8)}...`,
              lastMessageAt: processedMessages[processedMessages.length - 1]?.createdAt || new Date().toISOString(),
              createdAt: processedMessages[0]?.createdAt || new Date().toISOString(),
            });
          }

          // Update pagination info
          setHasMoreMessages(response.data.hasMore || false);
          setLastEvaluatedKey(response.data.lastEvaluatedKey || undefined);
        }
      }
    } catch (error: any) {
      setError("Failed to load conversation");
      console.error("Error loading conversation:", error);
    } finally {
      setLoadingHistory(false);
      setLoadingMore(false);
    }
  };

  // Lazy loading handler
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !hasMoreMessages || loadingMore) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    // Load more when scrolled to top
    if (scrollTop === 0 && conversationId) {
      loadConversationById(conversationId, true);
    }
  }, [conversationId, hasMoreMessages, loadingMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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

  const sendMessage = async (
    messageContent: string,
    conversationId?: string
  ) => {
    const userMessage: ChatMessageType = {
      role: "user",
      content: messageContent,
      editInfo: { canEdit: true, isEdited: false },
    };

    // Add user message immediately to UI
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setStreamedResponse("");
    setError("");
    setOptimizationInfo(null);

    try {
      const stream = await chatCompletionStream({
        model: selectedModel,
        messages: [userMessage],
        max_tokens: getMaxTokens(),
        conversationId: conversationId,
        chatHistory: messages,
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
                userVersionNumber: streamResponse.newChats.userChat.userVersionNumber,
                versionNumber: streamResponse.newChats.userChat.userVersionNumber,
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
                assistantVersionNumber: streamResponse.newChats.assistantChat.assistantVersionNumber,
                versionNumber: streamResponse.newChats.assistantChat.assistantVersionNumber,
                totalVersions: 1,
                hasMultipleVersions: false,
                linkedUserChatId: streamResponse.newChats.assistantChat.linkedUserChatId,
                editInfo: { canEdit: false, isEdited: false },
              };

              // Update messages with final data
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 2] = finalUserMessage;
                newMessages[newMessages.length - 1] = finalAssistantMessage;
                return newMessages;
              });
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

      // Add assistant message placeholder immediately
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "",
        editInfo: { canEdit: false, isEdited: false },
      }]);

      await processStream();
    } catch (error: any) {
      // Remove the placeholder messages on error
      setMessages(prev => prev.slice(0, -2));
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

  // Enhanced edit with auto-completion
  const handleEditMessage = async (messageIndex: number, newContent: string, autoComplete?: boolean) => {
    const message = messages[messageIndex];
    if (!message?.chatId) {
      console.error("Message chatId not found");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStreamedResponse("");

      // Update message immediately in UI
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...message,
        content: newContent,
        editInfo: {
          ...message.editInfo,
          isEdited: true,
          lastEditedAt: new Date().toISOString(),
        },
      };
      
      // Remove subsequent messages temporarily if auto-completing
      const messagesToKeep = autoComplete 
        ? updatedMessages.slice(0, messageIndex + 1)
        : updatedMessages;
      setMessages(messagesToKeep);

      if (autoComplete && message.role === 'user') {
        // Call edit and complete API for user messages
        const stream = await editMessageAndComplete(message.chatId, {
          content: newContent,
          model: selectedModel,
        });

        if (!stream) throw new Error("Failed to initialize edit stream");

        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let accumulatedContent = "";

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Add the final assistant message
              setMessages(prev => [...prev, {
                role: "assistant",
                content: accumulatedContent,
                messageIndex: messageIndex + 1,
                isActive: true,
                isCurrentVersion: true,
                editInfo: { canEdit: false, isEdited: false },
              }]);

              setStreamedResponse("");
              setSnackbarMessage("Message edited and response generated successfully");
              setSnackbarOpen(true);
              setRefreshHistoryTrigger((prev) => prev + 1);
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                let jsonStr = line.slice(5).trim();
                if (jsonStr === "[DONE]") continue;

                try {
                  const data = JSON.parse(jsonStr);
                  if (data.choices?.[0]?.delta?.content) {
                    accumulatedContent += data.choices[0].delta.content;
                    setStreamedResponse(
                      (prev) => prev + data.choices[0].delta.content
                    );
                  }
                } catch (e) {
                  console.error("Error parsing JSON:", e);
                }
              }
            }
          }
        };

        // Add assistant message placeholder
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "",
          editInfo: { canEdit: false, isEdited: false },
        }]);

        await processStream();
      } else {
        // Simple edit without auto-completion
        setSnackbarMessage("Message edited successfully");
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error("Edit message error:", error);
      setError(error.message || "Failed to edit message");
      setSnackbarMessage("Failed to edit message");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Regenerate response for assistant messages
  const handleRegenerateResponse = async (messageIndex: number) => {
    const message = messages[messageIndex];
    if (!message?.chatId || message.role !== 'assistant') {
      console.error("Invalid message for regeneration");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStreamedResponse("");

      // Remove the current assistant message temporarily
      const messagesToKeep = messages.slice(0, messageIndex);
      setMessages(messagesToKeep);

      // Call regenerate API
      const stream = await generateResponse(message.chatId, selectedModel);

      if (!stream) throw new Error("Failed to initialize regenerate stream");

      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedContent = "";

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Add the new assistant message
            setMessages(prev => [...prev, {
              role: "assistant",
              content: accumulatedContent,
              messageIndex: messageIndex,
              isActive: true,
              isCurrentVersion: true,
              editInfo: { canEdit: false, isEdited: false },
            }]);

            setStreamedResponse("");
            setSnackbarMessage("Response regenerated successfully");
            setSnackbarOpen(true);
            setRefreshHistoryTrigger((prev) => prev + 1);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              let jsonStr = line.slice(5).trim();
              if (jsonStr === "[DONE]") continue;

              try {
                const data = JSON.parse(jsonStr);
                if (data.choices?.[0]?.delta?.content) {
                  accumulatedContent += data.choices[0].delta.content;
                  setStreamedResponse(
                    (prev) => prev + data.choices[0].delta.content
                  );
                }
              } catch (e) {
                console.error("Error parsing JSON:", e);
              }
            }
          }
        }
      };

      // Add assistant message placeholder
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "",
        editInfo: { canEdit: false, isEdited: false },
      }]);

      await processStream();
    } catch (error: any) {
      console.error("Regenerate response error:", error);
      setError(error.message || "Failed to regenerate response");
      setSnackbarMessage("Failed to regenerate response");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Load versions for a specific message
  const loadMessageVersions = async (chatId: string): Promise<ChatVersion[]> => {
    try {
      const message = messages.find(m => m.chatId === chatId);
      if (!message) return [];

      const response = await getChatVersions(chatId, {
        versionType: message.role,
      });
      
      if (response.success) {
        return response.data.versions.map(version => ({
          chatId: version.chatId,
          versionId: version.versionId,
          versionNumber: version.versionNumber,
          userVersionNumber: version.userVersionNumber,
          assistantVersionNumber: version.assistantVersionNumber,
          isCurrentVersion: version.isCurrentVersion,
          content: version.content,
          contentPreview: version.contentPreview,
          createdAt: version.createdAt,
          wordCount: version.wordCount,
          characterCount: version.characterCount,
          linkedUserChatId: version.linkedUserChatId,
          originalChatId: version.originalChatId,
          updatedAt: version.updatedAt,
        }));
      }
      return [];
    } catch (error: any) {
      console.error("Failed to load versions:", error);
      return [];
    }
  };

  // Switch to a different version
  const handleSwitchVersion = async (messageIndex: number, versionNumber: number) => {
    const message = messages[messageIndex];
    if (!message?.chatId) return;

    try {
      setLoading(true);
      const response = await switchToVersion(message.chatId, { 
        direction: versionNumber,
        versionType: message.role,
      });

      if (response.success) {
        // Update the message content in UI
        setMessages(prev => prev.map((msg, index) => 
          index === messageIndex 
            ? { 
                ...msg, 
                content: response.data.switchedToVersion.content,
                userVersionNumber: response.data.switchedToVersion.userVersionNumber,
                assistantVersionNumber: response.data.switchedToVersion.assistantVersionNumber,
                versionNumber: response.data.switchedToVersion.versionNumber,
                isCurrentVersion: response.data.switchedToVersion.isCurrentVersion,
                hasMultipleVersions: response.data.switchedToVersion.hasMultipleVersions,
                totalVersions: response.data.switchedToVersion.totalVersions,
              }
            : msg
        ));

        setSnackbarMessage(`Switched to version ${versionNumber}`);
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      setError(error.message || "Failed to switch version");
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
    setOptimizationInfo(null);
    resetVersionState();
    navigate("/chat");
  };

  const handleSelectConversation = async (conversation: Conversation) => {
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
                  ref={messagesContainerRef}
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
                  {/* Load more indicator */}
                  {loadingMore && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        Loading more messages...
                      </Typography>
                    </Box>
                  )}

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
                          onEditMessage={(content, autoComplete) =>
                            handleEditMessage(index, content, autoComplete)
                          }
                          onRegenerateResponse={
                            message.role === "assistant" 
                              ? () => handleRegenerateResponse(index)
                              : undefined
                          }
                          onSwitchVersion={(versionNumber) =>
                            handleSwitchVersion(index, versionNumber)
                          }
                          onLoadVersions={loadMessageVersions}
                          canEdit={message.editInfo?.canEdit}
                          canGenerate={false}
                          availableModels={availableModelsForSelect}
                          linkedUserChatId={message.linkedUserChatId}
                        />
                      ))}

                      {streamedResponse && (
                        <ChatMessage
                          message={{
                            role: "assistant",
                            content: streamedResponse,
                            editInfo: { canEdit: false, isEdited: false },
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