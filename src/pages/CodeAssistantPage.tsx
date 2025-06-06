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
  FormControlLabel,
  Switch,
  Grid,
  Tab,
  Tabs,
  Collapse,
} from "@mui/material";
import {
  Send,
  RefreshCw,
  Code,
  User,
  Coins,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Repeat,
} from "lucide-react";
import MainLayout from "../components/Layout/MainLayout";
import ModelSelector from "../components/Chat/ModelSelector";
import CodeBlock from "../components/Code/CodeBlock";
import ChatHistorySidebar from "../components/Chat/ChatHistory";
import { useAuth } from "../context/AuthContext";
import { getModels, chatCompletionStream } from "../services/llm";
import { LLMModel, ChatMessage, Conversation } from "../types";
import { useNavigate } from "react-router-dom";

const CodeAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
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

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setLoading(true);
    setStreamingContent("");

    try {
      const response = await chatCompletionStream({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content:
              "You are an expert programming assistant. Provide clear, efficient, and well-documented code solutions. Always explain your code and include best practices.",
          },
          ...messages,
          userMessage,
        ],
        conversationId: selectedConversation?.conversationId,
      });

      const reader = response.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Finalize the message when stream ends
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: accumulatedContent },
          ]);
          setStreamingContent("");
          break;
        }

        // Handle Uint8Array chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Save incomplete line

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            let jsonStr = line.slice(5).trim();

            if (jsonStr.startsWith("data: ")) jsonStr = jsonStr.slice(5).trim();

            if (jsonStr === "[DONE]") continue;

            try {
              const data = JSON.parse(jsonStr);
              if (data.choices?.[0]?.delta?.content) {
                accumulatedContent += data.choices[0].delta.content;
                setStreamingContent(
                  (prev) => prev + data.choices[0].delta.content
                );
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.message?.includes("Insufficient balance")) {
        setError("Insufficient balance. Please top up to continue.");
      } else {
        setError(error.message || "Failed to get response");
      }
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
    setError("");
    setStreamingContent("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
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
          type: "text",
          content: content.slice(currentIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "plaintext",
        content: match[2].trim(),
      });

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(currentIndex),
      });
    }

    return parts;
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Here you would fetch the chat history for this conversation
    // and populate the messages state
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Extract all code blocks from the last message for the "Code" tab
  const getCodeFromLastMessage = () => {
    if (messages.length === 0) return [];

    const lastAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastAssistantMessage) return [];

    return extractCodeBlocks(lastAssistantMessage.content)
      .filter((part) => part.type === "code")
      .map((part) => ({ language: part.language, content: part.content }));
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const renderMessage = (content: string, isUser: boolean) => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: isUser ? "primary.main" : "background.default",
        color: isUser ? "white" : "text.primary",
        width: "100%",
      }}
    >
      {isUser ? (
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {content}
        </Typography>
      ) : (
        extractCodeBlocks(content).map((part, i) =>
          part.type === "code" ? (
            <Box
              key={i}
              sx={{
                position: "relative",
                my: 2,
                "&:first-of-type": { mt: 0 },
                "&:last-of-type": { mb: 0 },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              >
                <Tooltip
                  title={copied === part.content ? "Copied!" : "Copy code"}
                >
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(part.content)}
                    sx={{
                      bgcolor: "background.paper",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
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
                  bgcolor: darkMode ? "#1e1e1e" : "#f5f5f5",
                  color: darkMode ? "#d4d4d4" : "#1e1e1e",
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  overflow: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    padding: 16,
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  <code>{part.content}</code>
                </pre>
              </Paper>
            </Box>
          ) : (
            <Typography
              key={i}
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                my: 2,
                "&:first-of-type": { mt: 0 },
                "&:last-of-type": { mb: 0 },
              }}
            >
              {part.content}
            </Typography>
          )
        )
      )}
    </Paper>
  );

  const extractedCode = getCodeFromLastMessage();
  const lastAssistantMessage =
    messages.length > 0 && messages[messages.length - 1].role === "assistant"
      ? messages[messages.length - 1].content
      : streamingContent;

  return (
    <MainLayout hideFooter>
      <Box
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
            <Terminal size={24} />
            Code Assistant
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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

        <Grid container sx={{ flexGrow: 1 }}>
          {/* Main content area */}
          <Grid
            item
            xs={12}
            md={showSidebar ? 9 : 12}
            lg={showSidebar ? 10 : 12}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              transition: "all 0.3s ease",
            }}
          >
            {/* Toggle sidebar button */}
            <Box
              sx={{
                position: "absolute",
                right: { xs: 16, md: -20 },
                top: 16,
                zIndex: 10,
                display: { xs: "none", md: "block" },
              }}
            >
              <IconButton
                onClick={toggleSidebar}
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {showSidebar ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </IconButton>
            </Box>

            {/* Main content with tabs for chat and code */}
            <Box
              sx={{
                p: 3,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {messages.length > 0 && (
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                  <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    aria-label="code assistant tabs"
                  >
                    <Tab label="Chat" id="tab-0" />
                    <Tab
                      label={`Code ${
                        extractedCode.length > 0
                          ? `(${extractedCode.length})`
                          : ""
                      }`}
                      id="tab-1"
                      disabled={extractedCode.length === 0}
                    />
                  </Tabs>
                </Box>
              )}

              {selectedTab === 0 ? (
                // Chat tab content
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
                    }}
                  >
                    {messages.length === 0 && !streamingContent ? (
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
                        <Code size={48} />
                        <Typography variant="h6">
                          Start coding with AI assistance
                        </Typography>
                        <Typography variant="body2">
                          Ask questions, get code examples, debug issues, and
                          more
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
                                message.role === "user"
                                  ? "flex-end"
                                  : "flex-start",
                              maxWidth: "85%",
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
                                <Code size={20} />
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

                            {renderMessage(
                              message.content,
                              message.role === "user"
                            )}
                          </Box>
                        ))}

                        {/* Streaming message */}
                        {streamingContent && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "flex-start",
                              alignSelf: "flex-start",
                              maxWidth: "85%",
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

                  <Box
                    sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                  >
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
                      placeholder="Ask for code examples, debugging help, or programming questions..."
                      disabled={loading || !selectedModel}
                      sx={{ flexGrow: 1 }}
                    />

                    <Tooltip title="Clear chat">
                      <IconButton
                        onClick={clearChat}
                        disabled={
                          loading ||
                          (messages.length === 0 && !streamingContent)
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
              ) : (
                // Code tab content - shows code blocks from the last assistant message
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    overflow: "auto",
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Generated Code
                  </Typography>

                  {extractedCode.map((codeBlock, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Code size={16} />
                        {codeBlock.language || "Code"} {index + 1}
                      </Typography>
                      <CodeBlock
                        code={codeBlock.content}
                        language={codeBlock.language || "text"}
                        darkMode={darkMode}
                      />
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </Grid>

          {/* Chat history sidebar */}
          <Grid
            item
            md={3}
            lg={2}
            sx={{
              height: "100%",
              display: showSidebar ? { xs: "none", md: "block" } : "none",
              borderLeft: "1px solid",
              borderColor: "divider",
            }}
          >
            <ChatHistorySidebar
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.conversationId}
            />
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default CodeAssistantPage;