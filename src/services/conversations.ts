import api from './api';
import { ConversationsResponse, ChatHistoryResponse, ChatUpdateRequest } from '../types';

export const getConversations = async (page = 1, limit = 20): Promise<ConversationsResponse> => {
  try {
    const response = await api.get('/conversations', {
      params: { page, limit, sortBy: 'lastMessageAt:desc' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
  }
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await api.delete(`/conversations/${conversationId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete conversation');
  }
};

export const getChatHistory = async (
  conversationId: string,
  page = 1,
  limit = 20
): Promise<ChatHistoryResponse> => {
  try {
    const response = await api.get(`/chat/conversation/${conversationId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch chat history');
  }
};

export const updateChat = async (chatId: string, data: ChatUpdateRequest) => {
  try {
    const response = await api.patch(`/chat/${chatId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update chat');
  }
};

export const retryChat = async (chatId: string, model?: string): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem('token');
  const params = model ? { model } : {};
  
  const response = await fetch(`${api.defaults.baseURL}/chat/${chatId}/retry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Retry failed' }));
    throw new Error(error.message);
  }

  return response.body!;
};