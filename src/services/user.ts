import api from './api';
import { TopupHistoryResponse, ChatHistoryResponse } from '../types';

export const getTopupHistory = async (page = 1, limit = 10): Promise<TopupHistoryResponse> => {
  try {
    const response = await api.get('/user/topup/history', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch topup history');
  }
};

export const getChatHistory = async (page = 1, limit = 10): Promise<ChatHistoryResponse> => {
  try {
    const response = await api.get('/user/chat/history', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch chat history');
  }
};