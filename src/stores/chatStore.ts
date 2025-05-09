import { create } from 'zustand';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuthStore } from "./authStore";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "error";
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isStreaming: boolean;
  activeModels: {
    id: string;
    name: string;
    provider: string;
    description: string;
  }[];
  selectedModel: string;
  streamController: AbortController | null;

  createNewSession: () => string;
  setCurrentSession: (sessionId: string) => void;
  getSession: (sessionId: string) => ChatSession | undefined;
  addMessage: (message: Omit<Message, "id" | "timestamp" | "status">) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  sendMessage: (content: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchModels: () => Promise<void>;
  selectModel: (modelId: string) => void;
  cancelStream: () => void;
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to get a title from the first message
const generateTitle = (content: string) => {
  return content.length > 30 ? content.substring(0, 30) + "..." : content;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  isStreaming: false,
  activeModels: [],
  selectedModel: "",
  streamController: null,

  createNewSession: () => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      title: "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    set((state) => ({
      sessions: [...state.sessions, newSession],
      currentSessionId: id,
    }));

    return id;
  },

  setCurrentSession: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  getSession: (sessionId) => {
    const { sessions } = get();
    return sessions.find((session) => session.id === sessionId);
  },

  addMessage: (message) => {
    const { currentSessionId, sessions } = get();

    if (!currentSessionId) {
      throw new Error("No active session");
    }

    const newMessage: Message = {
      id: generateId(),
      ...message,
      timestamp: new Date(),
      status: "sent",
    };

    const updatedSessions = sessions.map((session) => {
      if (session.id === currentSessionId) {
        const title =
          session.messages.length === 0 && message.role === "user"
            ? generateTitle(message.content)
            : session.title;

        return {
          ...session,
          title,
          updatedAt: new Date(),
          messages: [...session.messages, newMessage],
        };
      }
      return session;
    });

    set({ sessions: updatedSessions });
    return newMessage.id;
  },

  updateMessage: (id, updates) => {
    const { currentSessionId, sessions } = get();

    if (!currentSessionId) return;

    const updatedSessions = sessions.map((session) => {
      if (session.id === currentSessionId) {
        const updatedMessages = session.messages.map((message) => {
          if (message.id === id) {
            return { ...message, ...updates };
          }
          return message;
        });

        return {
          ...session,
          updatedAt: new Date(),
          messages: updatedMessages,
        };
      }
      return session;
    });

    set({ sessions: updatedSessions });
  },

  sendMessage: async (content) => {
    const { addMessage, updateMessage, selectedModel, currentSessionId } =
      get();

    // Create a new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = get().createNewSession();
    }

    // Add user message
    const userMessageId = addMessage({
      role: "user",
      content,
    });

    try {
      set({ isStreaming: true });

      // Connect to WebSocket for streaming response
      const token = useAuthStore.getState().token;
      const wsUrl = `${API_URL.replace("http", "ws")}/ws?token=${token}`;
      console.log(`Connecting to WebSocket at: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      // Prepare for assistant's response
      const assistantMessageId = addMessage({
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      // Create an AbortController for cancellation
      const controller = new AbortController();
      set({ streamController: controller });

      let accumulatedText = "";

      // Set up WebSocket event handlers
      ws.onopen = () => {
        console.log("WebSocket connection opened, sending stream request");
        const messagePayload = {
          type: "stream_completion",
          payload: {
            prompt: content,
            model: selectedModel || undefined,
          },
        };
        console.log("Sending payload:", JSON.stringify(messagePayload));
        ws.send(JSON.stringify(messagePayload));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        // Handle connection confirmation
        if (data.type === "connected") {
          console.log("WebSocket connected successfully");
          const messagePayload = {
            type: "stream_completion",
            payload: {
              prompt: content,
              model: selectedModel || undefined,
            },
          };
          ws.send(JSON.stringify(messagePayload));
          // Don't return here - in some implementations the initial connection might
          // also include the first message packet
        }

        // Handle completion chunks
        if (data.type === "completion_chunk") {
          accumulatedText += data.content;
          updateMessage(assistantMessageId, {
            content: accumulatedText,
          });
        }

        // Handle completion start
        else if (data.type === "completion_start") {
          console.log("Completion stream started");
        }

        // Handle completion end
        else if (
          data.type === "completion_end" ||
          data.type === "stream_complete"
        ) {
          const finalText =
            data.fullResponse || data.payload?.full_text || accumulatedText;
          updateMessage(assistantMessageId, {
            content: finalText,
            isStreaming: false,
            status: "sent",
          });
          set({ isStreaming: false, streamController: null });
          ws.close();
        }

        // Handle non-streaming response
        else if (data.type === "completion_result") {
          updateMessage(assistantMessageId, {
            content: data.result,
            isStreaming: false,
            status: "sent",
          });
          set({ isStreaming: false, streamController: null });
          ws.close();
        }

        // Handle errors
        else if (data.type === "error") {
          console.error("WebSocket error:", data.error);
          updateMessage(assistantMessageId, {
            content: `Error: ${data.error}`,
            isStreaming: false,
            status: "error",
          });
          set({ isStreaming: false, streamController: null });
          ws.close();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        updateMessage(assistantMessageId, {
          content: "Error: Could not connect to the server.",
          isStreaming: false,
          status: "error",
        });
        set({ isStreaming: false, streamController: null });
      };

      // Handle closing
      ws.onclose = () => {
        // If we still have isStreaming set to true, it means we closed prematurely
        if (get().isStreaming) {
          updateMessage(assistantMessageId, {
            isStreaming: false,
            status: "error",
          });
          set({ isStreaming: false, streamController: null });
        }
      };

      // Listen for abort signal
      controller.signal.addEventListener("abort", () => {
        ws.close();
      });

      return new Promise((resolve) => {
        ws.onclose = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error("Error sending message:", error);
      set({ isStreaming: false, streamController: null });

      // Update the user message to show error
      updateMessage(userMessageId, {
        status: "error",
      });
    }
  },

  fetchHistory: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/llm/history`);

      if (response.data.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessions = response.data.history.map((item: any) => ({
          id: item.id,
          title: item.prompt.substring(0, 30) + "...",
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.created_at),
          messages: [
            {
              id: generateId(),
              role: "user" as MessageRole,
              content: item.prompt,
              timestamp: new Date(item.created_at),
              status: "sent" as const,
            },
            {
              id: generateId(),
              role: "assistant" as MessageRole,
              content: item.response,
              timestamp: new Date(item.created_at),
              status: "sent" as const,
            },
          ],
        }));

        set({ sessions });
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  },

  fetchModels: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/llm/models`);

      if (response.data.success) {
        set({
          activeModels: response.data.models,
          // Set the first model as selected if none is selected
          selectedModel:
            get().selectedModel || response.data.models[0]?.id || "",
        });
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  },

  selectModel: (modelId) => {
    set({ selectedModel: modelId });
  },

  cancelStream: () => {
    const { streamController } = get();
    if (streamController) {
      streamController.abort();
    }
  },
}));