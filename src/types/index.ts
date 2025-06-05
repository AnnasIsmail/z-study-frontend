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
  hugging_face_id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: {
    prompt: string;
    completion: string;
    request: string;
    image: string;
    web_search: string;
    internal_reasoning: string;
    input_cache_read: string;
    input_cache_write: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  per_request_limits: unknown;
  supported_parameters: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Conversation {
  conversationId: string;
  title: string;
  lastMessageAt: string;
  conversationCreatedAt: string;
}

export interface ChatHistory {
  conversationId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  costIDR: number;
  content: {
    prompt: [
      {
        role: string;
        content: string;
      }
    ];
    response: string;
  };
  filesUrl?: string[];
  isEdited?: boolean;
  previousVersions?: Array<{
    prompt: string;
    response: string;
    editedAt: string;
  }>;
}

export interface ConversationsResponse {
  results: Conversation[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ChatHistoryResponse {
  results: ChatHistory[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface StreamRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  conversationId?: string;
}

export interface FileProcessRequest {
  fileId: string;
  model: string;
  prompt: string;
  max_tokens?: number;
  conversationId?: string;
}

export interface ChatUpdateRequest {
  content: {
    prompt: string;
    response: string;
  };
}

export interface ModelQueryParams {
  search?: string;
  modalities?: string[];
  sort?: string;
  page?: number;
  limit?: number;
  group?: boolean;
}

export interface ModelPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ModelFilters {
  search: string;
  modalities: string[];
  sort: string;
}

export interface ModelsResponse {
  models: LLMModel[] | Record<string, LLMModel[]>;
  pagination: ModelPagination;
  filters: ModelFilters;
}