import api from './api';
import {
  StreamRequest,
  FileProcessRequest,
  LLMModel,
  ModelsResponse,
  ModelQueryParams,
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

export const chatCompletionStream = async (
  request: StreamRequest
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");
  
  // Prepare the request body with chat history
  const requestBody = {
    model: request.model,
    messages: request.messages,
    max_tokens: request.max_tokens,
    conversationId: request.conversationId,
    chatHistory: request.chatHistory || []
  };

  const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
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