import { create } from 'zustand';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../config';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
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
  activeModels: { id: string; name: string; provider: string; description: string }[];
  selectedModel: string;
  
  createNewSession: () => string;
  setCurrentSession: (sessionId: string) => void;
  getSession: (sessionId: string) => ChatSession | undefined;
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
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
  return content.length > 30 
    ? content.substring(0, 30) + '...'
    : content;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  isStreaming: false,
  activeModels: [],
  selectedModel: '',
  streamController: null,
  
  createNewSession: () => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      title: 'New Chat',
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
    return sessions.find(session => session.id === sessionId);
  },
  
  addMessage: (message) => {
    const { currentSessionId, sessions } = get();
    
    if (!currentSessionId) return;
    
    const newMessage: Message = {
      id: generateId(),
      ...message,
      timestamp: new Date(),
      status: 'sent',
    };
    
    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        // If this is the first message, update the title
        const title = session.messages.length === 0 && message.role === 'user'
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
    
    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        const updatedMessages = session.messages.map(message => {
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
    const { addMessage, updateMessage, selectedModel, currentSessionId } = get();
    
    // Create a new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = get().createNewSession();
    }
    
    // Add user message
    const userMessageId = addMessage({
      role: 'user',
      content,
    });
    
    try {
      set({ isStreaming: true });
      
      // Connect to WebSocket for streaming response
      const token = useAuthStore.getState().token;
      const ws = new WebSocket(`${API_URL.replace('http', 'ws')}/ws?token=${token}`);
      
      // Prepare for assistant's response
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: '',
        isStreaming: true,
      });
      
      ws.onopen = () => {
        // Send the streaming request
        ws.send(JSON.stringify({
          type: 'stream_completion',
          payload: {
            prompt: content,
            model: selectedModel || undefined,
          }
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'stream_chunk') {
          // Update the message with the new chunk
          updateMessage(assistantMessageId, {
            content: get().getSession(sessionId)?.messages.find(m => m.id === assistantMessageId)?.content + data.payload.text,
          });
        } else if (data.type === 'stream_complete') {
          // Finalize the message
          updateMessage(assistantMessageId, {
            content: data.payload.full_text,
            isStreaming: false,
            status: 'sent',
          });
          
          set({ isStreaming: false });
          ws.close();
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateMessage(assistantMessageId, {
          content: 'Error: Could not connect to the server.',
          isStreaming: false,
          status: 'error',
        });
        set({ isStreaming: false });
      };
      
      return new Promise((resolve) => {
        ws.onclose = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error sending message:', error);
      set({ isStreaming: false });
      
      // Update the user message to show error
      updateMessage(userMessageId, {
        status: 'error',
      });
    }
  },
  
  fetchHistory: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/llm/history`);
      
      if (response.data.success) {
        const sessions = response.data.history.map((item: any) => ({
          id: item.id,
          title: item.prompt.substring(0, 30) + '...',
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.created_at),
          messages: [
            {
              id: generateId(),
              role: 'user' as MessageRole,
              content: item.prompt,
              timestamp: new Date(item.created_at),
              status: 'sent' as const,
            },
            {
              id: generateId(),
              role: 'assistant' as MessageRole,
              content: item.response,
              timestamp: new Date(item.created_at),
              status: 'sent' as const,
            },
          ],
        }));
        
        set({ sessions });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  },
  
  fetchModels: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/llm/models`);
      
      if (response.data.success) {
        set({ 
          activeModels: response.data.models,
          // Set the first model as selected if none is selected
          selectedModel: get().selectedModel || (response.data.models[0]?.id || '')
        });
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  },
  
  selectModel: (modelId) => {
    set({ selectedModel: modelId });
  },
  
  cancelStream: () => {
    set({ isStreaming: false });
    // We need to send a cancel message to the WebSocket
    // This would depend on WebSocket implementation details
  },
}));