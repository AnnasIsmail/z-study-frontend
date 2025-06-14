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
  chatId?: string;
  conversationId?: string;
  userId?: string;
  model?: string;
  role: "user" | "assistant" | "system";
  content: string | {
    prompt?: string;
    response?: string;
  };
  messageIndex?: number;
  isActive?: boolean;
  
  // Enhanced versioning fields
  versionNumber?: number; // Legacy field for backward compatibility
  userVersionNumber?: number; // Specific to user messages (maps to userVersion from API)
  assistantVersionNumber?: number; // Specific to assistant messages (maps to assistantVersion from API)
  isCurrentVersion?: boolean;
  hasMultipleVersions?: boolean;
  totalVersions?: number;
  linkedUserChatId?: string; // For assistant messages - links to user message
  originalChatId?: string; // Original chat ID for version tracking
  
  availableVersions?: Array<{
    versionNumber: number;
    userVersionNumber?: number;
    assistantVersionNumber?: number;
    isCurrentVersion: boolean;
    createdAt: string;
    contentPreview: string;
    content?: string;
  }>;
  editInfo?: {
    canEdit: boolean;
    lastEditedAt?: string;
    isEdited: boolean;
  };
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUSD?: number;
  costIDR?: number;
  filesUrl?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Conversation {
  conversationId: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatHistoryItem {
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
  results: ChatHistoryItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Updated interface to match the new API response format
export interface ConversationChatsResponse {
  success: boolean;
  data: {
    results: Array<{
      chatId: string;
      conversationId: string;
      userId: string;
      model: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      costUSD: number;
      costIDR: number;
      content: {
        prompt: string;
        response: string;
      };
      filesUrl: string[];
      userVersion: number;
      assistantVersion: number;
      originalChatId: string;
      isLatestVersion: boolean;
      parentChatId: string | null;
      versionType: string;
      previousChatId: string | null;
      nextChatId: string | null;
      sequenceIndex: number;
      isSequenceHead: boolean;
      createdAt: string;
      updatedAt: string;
      canEdit: boolean;
      canRegenerate: boolean;
      hasMultipleVersions: boolean;
      totalVersions: number;
      availableVersions: Array<{
        versionNumber: number;
        userVersionNumber?: number;
        assistantVersionNumber?: number;
        isCurrentVersion: boolean;
        createdAt: string;
        contentPreview: string;
        content?: string;
      }>;
    }>;
    lastEvaluatedKey?: string;
    limit: number;
    totalResults: number;
    hasMore: boolean;
    conversationInfo: {
      conversationId: string;
      totalMessages: number;
      connectedMessages: number;
    };
  };
}

export interface StreamRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  conversationId?: string;
  chatHistory?: ChatMessage[];
}

export interface StreamResponse {
  conversation: {
    conversationId: string;
    title: string;
  };
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  cost: {
    usd: number;
    idr: number;
  };
  newChats: {
    userChat: {
      chatId: string;
      role: "user";
      content: string;
      userVersionNumber: number;
    };
    assistantChat: {
      chatId: string;
      role: "assistant";
      content: string;
      assistantVersionNumber: number;
      linkedUserChatId: string;
    };
  };
  optimizationInfo: {
    originalHistoryLength: number;
    optimizedHistoryLength: number;
    tokensSaved: number;
    updatedChatsCount: number;
  };
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

export interface EditMessageRequest {
  content: string;
  autoComplete?: boolean;
  model?: string;
}

export interface EditMessageResponse {
  success: boolean;
  message: string;
  data: {
    editedMessage: {
      chatId: string;
      content: string;
      userVersionNumber?: number;
      assistantVersionNumber?: number;
      isCurrentVersion: boolean;
      hasMultipleVersions: boolean;
      totalVersions: number;
      availableVersions: Array<{
        versionNumber: number;
        userVersionNumber?: number;
        assistantVersionNumber?: number;
        isCurrentVersion: boolean;
        createdAt: string;
        content: string;
      }>;
    };
    branchInfo: {
      branchCreated: boolean;
      deactivatedMessagesCount: number;
      message: string;
    };
  };
}

export interface GenerateResponse {
  success: boolean;
  data: {
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
    };
    cost: {
      usd: number;
      idr: number;
    };
    assistantMessage: {
      chatId: string;
      content: string;
      assistantVersionNumber: number;
      hasMultipleVersions: boolean;
      totalVersions: number;
      linkedUserChatId: string;
      isNewVersion: boolean;
    };
  };
}

export interface SwitchVersionRequest {
  direction: string | number;
  versionType?: 'user' | 'assistant';
}

export interface SwitchVersionResponse {
  success: boolean;
  message: string;
  data: {
    switchedToVersion: {
      chatId: string;
      content: string;
      versionNumber: number;
      userVersionNumber?: number;
      assistantVersionNumber?: number;
      isCurrentVersion: boolean;
      hasMultipleVersions: boolean;
      totalVersions: number;
      availableVersions: Array<{
        versionNumber: number;
        userVersionNumber?: number;
        assistantVersionNumber?: number;
        isCurrentVersion: boolean;
        createdAt: string;
        content: string;
      }>;
    };
    conversationThread: ChatMessage[];
    switchInfo: {
      message: string;
      affectedMessages: number;
    };
  };
}

export interface ChatVersionsResponse {
  success: boolean;
  data: {
    versions: Array<{
      chatId: string;
      userVersion?: number;
      assistantVersion?: number;
      isLatestVersion: boolean;
      versionType: string;
      content: {
        prompt?: string;
        response?: string;
      };
      createdAt: string;
    }>;
  };
}

export interface RegenerateResponse {
  success: boolean;
  data: {
    newAssistantChat: ChatMessage;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
    };
    cost: {
      usd: number;
      idr: number;
    };
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

export interface LLMModelMarketing {
  id: string;
  name: string;
  description: string;
}