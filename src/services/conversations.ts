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
        ...params,
      },
    });
    
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }
    
    throw new Error("Invalid API response structure");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversation chats"
    );
  }
};

export const getChatById = async (chatId: string) => {
  try {
    const response = await api.get(`/chat/${chatId}`);
    
    if (response.data.success && response.data.data) {
      const chat = response.data.data;
      return {
        success: true,
        data: {
          chatId: chat.chatId,
          conversationId: chat.conversationId,
          content: chat.content,
          userVersion: chat.userVersion,
          assistantVersion: chat.assistantVersion,
          model: chat.model,
          createdAt: chat.createdAt,
        },
      };
    }
    
    throw new Error("Invalid API response structure");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch chat");
  }
};

// Get all versions for a specific chat
export const getChatVersions = async (
  chatId: string,
  params: {
    versionType?: 'user' | 'assistant';
    limit?: number;
    page?: number;
  } = {}
): Promise<ChatVersionsResponse> => {
  try {
    const response = await api.get(`/chat/${chatId}/versions`);
    
    if (response.data.success && response.data.data) {
      const versions = response.data.data.versions.map((version: any) => ({
        chatId: version.chatId,
        versionId: version.chatId, // Use chatId as versionId for now
        versionNumber: version.userVersion || version.assistantVersion,
        userVersionNumber: version.userVersion,
        assistantVersionNumber: version.assistantVersion,
        isCurrentVersion: version.isLatestVersion,
        content: version.content.prompt || version.content.response || "",
        contentPreview: (version.content.prompt || version.content.response || "").substring(0, 100),
        createdAt: version.createdAt,
        updatedAt: version.createdAt,
        wordCount: (version.content.prompt || version.content.response || "").split(' ').length,
        characterCount: (version.content.prompt || version.content.response || "").length,
        linkedUserChatId: version.linkedUserChatId,
        originalChatId: version.chatId,
      }));

      return {
        success: true,
        data: {
          versions,
          versionType: params.versionType || 'assistant',
          linkedUserChatId: undefined,
        },
      };
    }
    
    throw new Error("Invalid API response structure");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch chat versions"
    );
  }
};

// Switch to a specific version
export const switchToVersion = async (
  chatId: string,
  data: {
    direction: string | number;
    versionType?: 'user' | 'assistant';
  }
): Promise<SwitchVersionResponse> => {
  try {
    const response = await api.post(`/chat/${chatId}/switch-version`, {
      direction: data.direction,
      versionType: data.versionType || 'assistant',
    });
    
    if (response.data.success && response.data.data) {
      const result = response.data.data.result[0];
      return {
        success: true,
        message: "Version switched successfully",
        data: {
          switchedToVersion: {
            chatId: result.chatId,
            content: result.content.prompt || result.content.response || "",
            versionNumber: result.userVersion || result.assistantVersion,
            userVersionNumber: result.userVersion,
            assistantVersionNumber: result.assistantVersion,
            isCurrentVersion: true,
            hasMultipleVersions: response.data.data.versionInfo.totalVersions > 1,
            totalVersions: response.data.data.versionInfo.totalVersions,
            availableVersions: [],
          },
          conversationThread: [],
          switchInfo: {
            message: "Version switched successfully",
            affectedMessages: 1,
          },
        },
      };
    }
    
    throw new Error("Invalid API response structure");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to switch version"
    );
  }
};

// Edit message with streaming support
export const editMessageAndComplete = async (
  chatId: string,
  data: {
    content: string;
    model: string;
  }
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${api.defaults.baseURL}/chat/${chatId}/edit`,
    {
      method: "POST",
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
      .catch(() => ({ message: "Edit failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

// Regenerate response with streaming
export const generateResponse = async (
  chatId: string,
  model: string
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${api.defaults.baseURL}/chat/${chatId}/regenerate`,
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
      .catch(() => ({ message: "Regenerate failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

// Legacy functions for backward compatibility
export const editMessage = async (
  chatId: string,
  data: EditMessageRequest
): Promise<EditMessageResponse> => {
  try {
    const response = await api.post(`/chat/${chatId}/edit`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to edit message");
  }
};

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