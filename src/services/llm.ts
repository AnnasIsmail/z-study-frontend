import api from './api';

export const getModels = async () => {
  try {
    const response = await api.get('/llm/models');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch models');
  }
};

export const chatCompletion = async (payload: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
}) => {
  try {
    const response = await api.post('/llm/chat', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Chat completion failed');
  }
};

export const chatCompletionStream = async (payload: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
}) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/llm/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Stream failed' }));
    throw new Error(error.message);
  }

  return response.body;
};

export const processFile = async (payload: {
  fileId: string;
  model: string;
  prompt: string;
}) => {
  try {
    const response = await api.post('/llm/process-file', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'File processing failed');
  }
};