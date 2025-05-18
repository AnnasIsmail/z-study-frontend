export interface User {
  userId: string;
  email: string;
  name: string;
  balance: number;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface TopupHistory {
  topupId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: string;
  createdAt: string;
}

export interface ChatHistory {
  chatId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TopupHistoryResponse {
  success: boolean;
  data: {
    topups: TopupHistory[];
    pagination: Pagination;
  };
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    chats: ChatHistory[];
    pagination: Pagination;
  };
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export interface LLMModel {
  id: string;
  name: string;
  contextWindow: number;
  inputPricePer1000Tokens: number;
  outputPricePer1000Tokens: number;
  maxTokens: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  message: {
    role: 'assistant';
    content: string;
  };
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: {
    usd: number;
    idr: number;
  };
}

export interface FileUploadResponse {
  fileId: string;
  fileUrl: string;
  fileType: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTopup: number;
  totalTokensUsed: number;
  revenueStats: {
    daily: Array<{
      date: string;
      amount: number;
    }>;
    monthly: Array<{
      month: string;
      amount: number;
    }>;
  };
}

export interface AdminUserDetails extends User {
  status: 'active' | 'banned';
  lastLogin: string;
  topupHistory: TopupHistory[];
  usageHistory: ChatHistory[];
}