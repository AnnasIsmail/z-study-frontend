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
    const response = await getModels({ limit: 1 }); // Get large number to fetch all
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
  const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Stream failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

// New function for chat summarization
export const summarizeChat = async (
  userMessage: string,
  freeModel?: string
): Promise<string> => {
  try {
    const token = localStorage.getItem("token");
    
    // Use a free model for summarization (you can specify which model to use)
    const summarizeRequest = {
      model: freeModel || "meta-llama/llama-3.2-1b-instruct:free", // Default free model
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates short, descriptive titles for conversations. Create a concise title (maximum 6 words) that captures the main topic or question from the user's message. Do not use quotes or special characters."
        },
        {
          role: "user", 
          content: `Create a short title for this conversation based on this message: "${userMessage}"`
        }
      ],
      max_tokens: 20,
      temperature: 0.3
    };

    const response = await fetch(`${api.defaults.baseURL}/chat/completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(summarizeRequest),
    });

    if (!response.ok) {
      throw new Error("Failed to summarize chat");
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "New Conversation";
  } catch (error) {
    console.error("Error summarizing chat:", error);
    // Fallback: create a simple title from the first few words
    const words = userMessage.split(' ').slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }
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