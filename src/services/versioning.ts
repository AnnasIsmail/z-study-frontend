import api from './api';
import {
  EditMessageRequest,
  EditMessageResponse,
  GenerateResponseRequest,
  GenerateResponseResponse,
  SwitchVersionRequest,
  SwitchVersionResponse,
  ChatVersionsResponse,
  ChatVersion,
} from '../types/versioning';

// Edit user message with optional auto-completion
export const editUserMessage = async (
  chatId: string,
  data: EditMessageRequest
): Promise<EditMessageResponse> => {
  try {
    const response = await api.put(`/chat/${chatId}/edit`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to edit user message');
  }
};

// Edit user message with streaming auto-completion
export const editUserMessageWithCompletion = async (
  chatId: string,
  data: EditMessageRequest
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${api.defaults.baseURL}/chat/${chatId}/edit-and-complete`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Edit and complete failed' }));
    throw new Error(error.message);
  }

  return response.body!;
};

// Generate new assistant response
export const generateAssistantResponse = async (
  userChatId: string,
  data: GenerateResponseRequest
): Promise<GenerateResponseResponse> => {
  try {
    const response = await api.post(`/chat/${userChatId}/generate`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to generate assistant response');
  }
};

// Generate assistant response with streaming
export const generateAssistantResponseStream = async (
  userChatId: string,
  data: GenerateResponseRequest
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${api.defaults.baseURL}/chat/${userChatId}/generate-stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Generate response failed' }));
    throw new Error(error.message);
  }

  return response.body!;
};

// Get all versions for a specific chat (user or assistant)
export const getChatVersions = async (
  chatId: string,
  params: {
    versionType?: 'user' | 'assistant';
    limit?: number;
    page?: number;
  } = {}
): Promise<ChatVersionsResponse> => {
  try {
    const response = await api.get(`/chat/${chatId}/versions`, {
      params: {
        versionType: params.versionType,
        limit: params.limit || 10,
        page: params.page || 1,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch chat versions'
    );
  }
};

// Switch to a specific version
export const switchToVersion = async (
  chatId: string,
  data: SwitchVersionRequest
): Promise<SwitchVersionResponse> => {
  try {
    const response = await api.post(`/chat/${chatId}/switch-version`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to switch version'
    );
  }
};

// Get version history for assistant responses linked to a user message
export const getAssistantVersionsForUserMessage = async (
  userChatId: string,
  params: {
    limit?: number;
    page?: number;
  } = {}
): Promise<ChatVersionsResponse> => {
  try {
    const response = await api.get(`/chat/${userChatId}/assistant-versions`, {
      params: {
        limit: params.limit || 10,
        page: params.page || 1,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch assistant versions'
    );
  }
};

// Delete a specific version
export const deleteVersion = async (
  chatId: string,
  versionNumber: number,
  versionType: 'user' | 'assistant'
): Promise<void> => {
  try {
    await api.delete(`/chat/${chatId}/versions/${versionNumber}`, {
      data: { versionType },
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete version'
    );
  }
};

// Get version comparison
export const compareVersions = async (
  chatId: string,
  version1: number,
  version2: number,
  versionType: 'user' | 'assistant'
) => {
  try {
    const response = await api.get(`/chat/${chatId}/versions/compare`, {
      params: {
        version1,
        version2,
        versionType,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to compare versions'
    );
  }
};