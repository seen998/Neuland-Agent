import { 
  UserSession, 
  CreateSessionRequest, 
  UpdateSessionRequest,
  Conversation,
  ChatRequest,
  ApiResponse,
  ModelInfo,
  AppConfig,
  TabInfo,
  UnlockTabRequest
} from '../../shared/types';

const API_BASE = '/api';

// Helper for API requests
async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Session API
export const sessionApi = {
  create: (data: CreateSessionRequest) => 
    fetchApi<UserSession>('/session/create', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  get: (sessionId: string) => 
    fetchApi<UserSession>(`/session/${sessionId}`),
  
  update: (sessionId: string, data: UpdateSessionRequest) => 
    fetchApi<UserSession>(`/session/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  delete: (sessionId: string) => 
    fetchApi<void>(`/session/${sessionId}`, {
      method: 'DELETE'
    })
};

// Chat API
export const chatApi = {
  sendMessage: (data: ChatRequest) => {
    return fetch(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  
  getHistory: (sessionId: string, tabId: string) => 
    fetchApi<Conversation>(`/chat/history/${sessionId}/${tabId}`),
  
  clearHistory: (sessionId: string, tabId: string) => 
    fetchApi<void>(`/chat/history/${sessionId}/${tabId}`, {
      method: 'DELETE'
    }),
  
  updateSettings: (sessionId: string, tabId: string, settings: { 
    model?: string; 
    comparisonMode?: boolean; 
    modelB?: string 
  }) => 
    fetchApi<Conversation>(`/chat/settings/${sessionId}/${tabId}`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
};

// Tab API
export const tabApi = {
  getAvailable: (sessionId: string) => 
    fetchApi<TabInfo[]>(`/tabs/available/${sessionId}`),
  
  unlock: (data: UnlockTabRequest) => 
    fetchApi<void>('/tabs/unlock', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

// Config API
export const configApi = {
  getModels: () => 
    fetchApi<ModelInfo[]>('/config/models'),
  
  getAppConfig: () => 
    fetchApi<AppConfig>('/config/app')
};

// Health check
export const healthApi = {
  check: () => fetch(`${API_BASE}/health`).then(r => r.json())
};

// Stream parser for SSE
export function parseStreamEvent(data: string): { type: string; [key: string]: unknown } | null {
  try {
    const line = data.trim();
    if (!line || !line.startsWith('data: ')) return null;
    
    const jsonStr = line.slice(6);
    if (jsonStr === '[DONE]') return { type: 'done' };
    
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}
