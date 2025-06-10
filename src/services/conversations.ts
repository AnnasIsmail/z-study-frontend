import api from './api';
import {
  ConversationsResponse,
  ChatHistoryResponse,
  ChatUpdateRequest,
  ConversationChatsResponse,
  EditMessageRequest,
  EditMessageResponse,
  SwitchVersionRequest,
  SwitchVersionResponse,
  ChatVersionsResponse,
  RegenerateResponse,
  Conversation,
  GenerateResponse,
} from "../types";

export const getConversations = async (
  page = 1,
  limit = 20
): Promise<ConversationsResponse> => {
  try {
    const response = await api.get("/conversations", {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversations"
    );
  }
};

export const getConversationById = async (
  conversationId: string
): Promise<Conversation> => {
  try {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversation"
    );
  }
};

export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  try {
    await api.delete(`/conversations/${conversationId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete conversation"
    );
  }
};

export const getConversationChats = async (
  conversationId: string,
  params: {
    limit?: number;
    lastEvaluatedKey?: string;
    sortOrder?: "asc" | "desc";
    activeOnly?: boolean;
    currentVersionOnly?: boolean;
    includeVersions?: boolean;
  } = {}
): Promise<ConversationChatsResponse> => {
  try {
    const response = await api.get(`/chat/conversation/${conversationId}`, {
      params: {
        limit: params.limit || 20,
        lastEvaluatedKey: params.lastEvaluatedKey,
        sortOrder: params.sortOrder || "asc",
        activeOnly: params.activeOnly !== false,
        currentVersionOnly: params.currentVersionOnly !== false,
        includeVersions: params.includeVersions || false,
        ...params,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversation chats"
    );
  }
};

export const getChatById = async (chatId: string) => {
  try {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch chat");
  }
};

export const editMessage = async (
  chatId: string,
  data: EditMessageRequest
): Promise<EditMessageResponse> => {
  try {
    const response = await api.put(`/chat/${chatId}/edit`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to edit message");
  }
};

// New function for edit + auto completion
export const editMessageAndComplete = async (
  chatId: string,
  data: {
    content: string;
    model: string;
    autoComplete: boolean;
  }
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${api.defaults.baseURL}/chat/${chatId}/edit-and-complete`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Edit and complete failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

export const generateResponse = async (
  chatId: string,
  model: string
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${api.defaults.baseURL}/chat/${chatId}/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ model }),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Generate response failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

export const switchToVersion = async (
  chatId: string,
  data: SwitchVersionRequest
): Promise<SwitchVersionResponse> => {
  try {
    const response = await api.post(`/chat/${chatId}/switch-version`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to switch version"
    );
  }
};

export const getChatVersions = async (
  chatId: string,
  params: {
    limit?: number;
    page?: number;
  } = {}
): Promise<ChatVersionsResponse> => {
  try {
    const response = await api.get(`/chat/${chatId}/versions`, {
      params: {
        limit: params.limit || 10,
        page: params.page || 1,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch chat versions"
    );
  }
};

// Legacy function for backward compatibility
export const regenerateResponse = async (
  chatId: string,
  model: string
): Promise<RegenerateResponse> => {
  try {
    const response = await api.post(`/chat/${chatId}/regenerate`, { model });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to regenerate response"
    );
  }
};

export const retryChat = async (
  chatId: string,
  model: string
): Promise<RegenerateResponse> => {
  try {
    const response = await api.post(`/chat/${chatId}/retry`, { model });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to retry chat");
  }
};

export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await api.delete(`/chat/${chatId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete chat");
  }
};

// Legacy function for backward compatibility
export const getChatHistory = async (
  conversationId: string,
  page = 1,
  limit = 20
): Promise<ChatHistoryResponse> => {
  try {
    const response = await api.get(`/conversation/${conversationId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch chat history"
    );
  }
};

export const updateChat = async (chatId: string, data: ChatUpdateRequest) => {
  try {
    const response = await api.patch(`/chat/${chatId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update chat');
  }
};