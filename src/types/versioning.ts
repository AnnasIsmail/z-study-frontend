// Chat versioning specific types
export interface ChatVersion {
  chatId: string;
  versionId: string;
  versionNumber: number;
  userVersionNumber?: number;
  assistantVersionNumber?: number;
  isCurrentVersion: boolean;
  content: string;
  contentPreview: string;
  wordCount: number;
  characterCount: number;
  linkedUserChatId?: string; // For assistant messages
  originalChatId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VersionNavigationProps {
  chatId: string;
  role: 'user' | 'assistant';
  currentVersion: number;
  totalVersions: number;
  hasMultipleVersions: boolean;
  onVersionChange: (versionNumber: number) => void;
  onLoadVersions: (chatId: string) => Promise<ChatVersion[]>;
  disabled?: boolean;
  linkedUserChatId?: string; // For assistant messages
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
      userVersionNumber: number;
      isCurrentVersion: boolean;
      hasMultipleVersions: boolean;
      totalVersions: number;
      availableVersions: ChatVersion[];
    };
    branchInfo: {
      branchCreated: boolean;
      deactivatedMessagesCount: number;
      message: string;
    };
  };
}

export interface GenerateResponseRequest {
  model: string;
  linkedUserChatId?: string;
}

export interface GenerateResponseResponse {
  success: boolean;
  data: {
    assistantMessage: {
      chatId: string;
      content: string;
      assistantVersionNumber: number;
      hasMultipleVersions: boolean;
      totalVersions: number;
      linkedUserChatId: string;
      isNewVersion: boolean;
    };
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

export interface SwitchVersionRequest {
  versionNumber: number;
  versionType: 'user' | 'assistant';
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
      availableVersions: ChatVersion[];
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
    versions: ChatVersion[];
    versionType: 'user' | 'assistant';
    linkedUserChatId?: string;
  };
}