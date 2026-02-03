// User and Session Types
export interface UserSession {
  sessionId: string;
  userName: string;
  userAge?: number;
  language: 'en' | 'de';
  currentTab: 'self-exploration' | 'multi-minds';
  unlockedTabs: string[];
  createdAt: string;
  lastActiveAt: string;
}

export interface CreateSessionRequest {
  userName: string;
  userAge?: number;
  language: 'en' | 'de';
}

export interface UpdateSessionRequest {
  userName?: string;
  userAge?: number;
  language?: 'en' | 'de';
  currentTab?: 'self-exploration' | 'multi-minds';
}

// Message Types
export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  model?: string;
}

export interface Conversation {
  sessionId: string;
  tabId: string;
  messages: Message[];
  model: string;
  comparisonMode: boolean;
  modelB?: string;
}

// Chat Request/Response Types
export interface ChatRequest {
  sessionId: string;
  tabId: string;
  message: string;
  model: string;
  comparisonMode?: boolean;
  modelB?: string;
}

export interface ChatResponse {
  message: Message;
  comparisonMessage?: Message;
}

// OpenRouter Types
export interface OpenRouterMessage {
  role: MessageRole;
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature: number;
  max_tokens: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }[];
  model: string;
}

export interface OpenRouterStreamChunk {
  id: string;
  choices: {
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
    index: number;
  }[];
  model: string;
}

// Tab Types
export interface TabInfo {
  id: string;
  labelEn: string;
  labelDe: string;
  locked: boolean;
}

export interface UnlockTabRequest {
  sessionId: string;
  tabId: string;
  password: string;
}

// Configuration Types
export interface AppConfig {
  models: ModelInfo[];
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Stream Response Types
export type StreamEvent =
  | { type: 'content'; content: string; model: string }
  | { type: 'comparisonContent'; content: string; model: string }
  | { type: 'done' }
  | { type: 'error'; error: string };

// Language Types
export type Language = 'en' | 'de';

export interface Translations {
  [key: string]: string | Translations;
}
