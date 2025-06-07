import api from './api';
import {
  StreamRequest,
  FileProcessRequest,
  LLMModel,
  ModelsResponse,
  ModelQueryParams,
  ChatMessage,
} from "../types";

export const getModels = async (
  params: ModelQueryParams = {}
): Promise<{ success: boolean; data: ModelsResponse }> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append("search", params.search);
    if (params.modalities?.length)
      queryParams.append("modalities", params.modalities.join(","));
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.group) queryParams.append("group", params.group.toString());

    const response = await api.get(`/llm/models?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch models");
  }
};

// For backward compatibility - get all models without pagination
export const getAllModels = async (): Promise<{
  success: boolean;
  data: { models: LLMModel[] };
}> => {
  try {
    const response = await getModels({ limit: 1000 }); // Get large number to fetch all
    return {
      success: true,
      data: {
        models: Array.isArray(response.data.models)
          ? response.data.models
          : Object.values(response.data.models).flat(),
      },
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch models");
  }
};

// Helper function to calculate request size in bytes
const calculateRequestSize = (request: StreamRequest): number => {
  return new Blob([JSON.stringify(request)]).size;
};

// Helper function to build complete chat history up to 4MB limit
const buildOptimalChatHistory = (
  messages: ChatMessage[], 
  newUserMessage: ChatMessage,
  baseRequest: Omit<StreamRequest, 'chatHistory'>,
  maxSize: number = 4 * 1024 * 1024 // 4MB
): { chatHistory: ChatMessage[], optimizationInfo?: any } => {
  
  // Calculate base request size without chat history
  const baseRequestSize = calculateRequestSize({
    ...baseRequest,
    chatHistory: []
  });
  
  // Leave some buffer space (100KB) for response overhead
  const availableSpace = maxSize - baseRequestSize - (100 * 1024);
  
  if (availableSpace <= 0) {
    throw new Error("Base request is too large, cannot include any chat history");
  }
  
  // Start with empty history and add messages from most recent backwards
  const optimizedHistory: ChatMessage[] = [];
  let currentSize = 0;
  let originalLength = messages.length;
  
  // Add messages from newest to oldest until we hit the size limit
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageSize = new Blob([JSON.stringify(message)]).size;
    
    // Check if adding this message would exceed the limit
    if (currentSize + messageSize > availableSpace) {
      break;
    }
    
    optimizedHistory.unshift(message);
    currentSize += messageSize;
  }
  
  // Calculate optimization info
  const optimizationInfo = originalLength > optimizedHistory.length ? {
    originalHistoryLength: originalLength,
    optimizedHistoryLength: optimizedHistory.length,
    tokensSaved: Math.round((originalLength - optimizedHistory.length) * 100), // Rough estimate
    updatedChatsCount: optimizedHistory.filter(msg => msg.updated).length
  } : undefined;
  
  return { chatHistory: optimizedHistory, optimizationInfo };
};

export const chatCompletionStream = async (
  request: StreamRequest
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");
  
  // Get max_tokens from the selected model
  const selectedModel = request.model;
  let maxTokens = request.max_tokens;
  
  if (!maxTokens) {
    try {
      const modelsResponse = await getAllModels();
      const model = modelsResponse.data.models.find(m => m.id === selectedModel);
      maxTokens = model?.max_completion_tokens || model?.top_provider?.max_completion_tokens || 4096;
    } catch (error) {
      console.warn("Failed to fetch model max tokens, using default:", error);
      maxTokens = 4096;
    }
  }

  // Prepare base request without chat history
  const baseRequest = {
    model: request.model,
    messages: request.messages,
    max_tokens: maxTokens,
    conversationId: request.conversationId,
  };

  // Build optimal chat history that fits within 4MB limit
  const allMessages = request.chatHistory || [];
  const { chatHistory, optimizationInfo } = buildOptimalChatHistory(
    allMessages,
    request.messages[0], // Assuming the first message is the new user message
    baseRequest
  );

  // Create final request
  const streamRequest: StreamRequest = {
    ...baseRequest,
    chatHistory: chatHistory
  };

  // Final size check
  const finalSize = calculateRequestSize(streamRequest);
  const MAX_REQUEST_SIZE = 4 * 1024 * 1024; // 4MB
  
  if (finalSize > MAX_REQUEST_SIZE) {
    throw new Error(`Request size (${(finalSize / 1024 / 1024).toFixed(2)}MB) exceeds 4MB limit. Please start a new conversation.`);
  }

  console.log(`Request size: ${(finalSize / 1024 / 1024).toFixed(2)}MB, Chat history: ${chatHistory.length} messages`);
  
  // Store optimization info to be included in response
  if (optimizationInfo) {
    console.log('Chat history optimized:', optimizationInfo);
  }

  const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(streamRequest),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Stream failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

export const processFileStream = async (
  request: FileProcessRequest
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${api.defaults.baseURL}/llm/process-file/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "File processing failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/llm/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "File upload failed");
  }
};