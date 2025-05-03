import { createContext, useContext, useState, useEffect } from 'react';
import { llmService } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [models, setModels] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchModels();
      fetchConversations();
    }
  }, [user]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await llmService.getModels();
      setModels(response.data);
    } catch (err) {
      setError('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await llmService.getConversations();
      setConversations(response.data);
    } catch (err) {
      setError('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (id) => {
    try {
      setLoading(true);
      const response = await llmService.getConversation(id);
      setCurrentConversation(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch conversation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (model, title) => {
    try {
      setLoading(true);
      const response = await llmService.createConversation(model, title);
      setConversations([...conversations, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create conversation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id) => {
    try {
      setLoading(true);
      await llmService.deleteConversation(id);
      setConversations(conversations.filter(conv => conv._id !== id));
      if (currentConversation && currentConversation._id === id) {
        setCurrentConversation(null);
      }
      return true;
    } catch (err) {
      setError('Failed to delete conversation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message, conversationId = null, model = null, options = {}) => {
    try {
      setLoading(true);
      const payload = conversationId 
        ? { conversationId, message }
        : { message, model, options };
      
      const response = await llmService.sendMessage(payload);
      
      if (!conversationId) {
        // New conversation was created
        await fetchConversations();
        setCurrentConversation(response.data.conversation);
      } else {
        // Update current conversation with new messages
        setCurrentConversation(response.data.conversation);
      }
      
      return response.data;
    } catch (err) {
      setError('Failed to send message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    models,
    conversations,
    currentConversation,
    loading,
    error,
    fetchModels,
    fetchConversations,
    fetchConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
