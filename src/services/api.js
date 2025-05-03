import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/me'),
};

export const llmService = {
  getModels: () => api.get('/llm/models'),
  getConversations: () => api.get('/llm/conversations'),
  getConversation: (id) => api.get(`/llm/conversations/${id}`),
  createConversation: (model, title) => api.post('/llm/conversations', { model, title }),
  deleteConversation: (id) => api.delete(`/llm/conversations/${id}`),
  sendMessage: (payload) => api.post('/llm/chat', payload),
};

export default api;
