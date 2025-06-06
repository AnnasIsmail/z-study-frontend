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

// Helper function to calculate request size
const calculateRequestSize = (request: StreamRequest): number => {
  return new Blob([JSON.stringify(request)]).size;
};

// Helper function to optimize chat history if request is too large
const optimizeChatHistory = (chatHistory: ChatMessage[], maxSize: number): ChatMessage[] => {
  if (!chatHistory || chatHistory.length === 0) return [];
  
  // Start with the most recent messages and work backwards
  const optimized: ChatMessage[] = [];
  let currentSize = 0;
  
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const message = chatHistory[i];
    const messageSize = new Blob([JSON.stringify(message)]).size;
    
    if (currentSize + messageSize > maxSize) {
      break;
    }
    
    optimized.unshift(message);
    currentSize += messageSize;
  }
  
  return optimized;
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

  // Prepare the request with the new structure
  const streamRequest: StreamRequest = {
    model: request.model,
    messages: request.messages,
    max_tokens: maxTokens,
    conversationId: request.conversationId,
    chatHistory: request.chatHistory || []
  };

  // Check request size (4MB limit)
  const MAX_REQUEST_SIZE = 4 * 1024 * 1024; // 4MB in bytes
  let requestSize = calculateRequestSize(streamRequest);
  
  // If request is too large, optimize chat history
  if (requestSize > MAX_REQUEST_SIZE) {
    console.warn(`Request size (${(requestSize / 1024 / 1024).toFixed(2)}MB) exceeds 4MB limit. Optimizing chat history...`);
    
    // Calculate available space for chat history (leaving room for other fields)
    const baseRequestSize = calculateRequestSize({
      ...streamRequest,
      chatHistory: []
    });
    const availableSpace = MAX_REQUEST_SIZE - baseRequestSize - (100 * 1024); // Leave 100KB buffer
    
    streamRequest.chatHistory = optimizeChatHistory(streamRequest.chatHistory || [], availableSpace);
    requestSize = calculateRequestSize(streamRequest);
    
    console.log(`Optimized request size: ${(requestSize / 1024 / 1024).toFixed(2)}MB`);
  }

  // Final check
  if (requestSize > MAX_REQUEST_SIZE) {
    throw new Error(`Request size (${(requestSize / 1024 / 1024).toFixed(2)}MB) still exceeds 4MB limit after optimization. Please reduce the conversation history.`);
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