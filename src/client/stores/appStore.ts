import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  UserSession, 
  Message, 
  Language, 
  ModelInfo, 
  TabInfo 
} from '../../shared/types';

interface AppState {
  // Session
  sessionId: string | null;
  userName: string | null;
  userAge: number | null;
  language: Language;
  
  // Tabs
  currentTab: string;
  unlockedTabs: string[];
  tabs: TabInfo[];
  
  // Chat
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  comparisonStreamingContent: string;
  
  // Configuration
  selectedModel: string;
  comparisonMode: boolean;
  comparisonModel: string | null;
  availableModels: ModelInfo[];
  
  // Actions
  setSession: (session: UserSession) => void;
  clearSession: () => void;
  setLanguage: (lang: Language) => void;
  setUserName: (name: string) => void;
  setUserAge: (age: number) => void;
  setCurrentTab: (tabId: string) => void;
  unlockTab: (tabId: string) => void;
  setTabs: (tabs: TabInfo[]) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (content: string) => void;
  setComparisonStreamingContent: (content: string) => void;
  appendComparisonStreamingContent: (content: string) => void;
  setSelectedModel: (model: string) => void;
  setComparisonMode: (enabled: boolean) => void;
  setComparisonModel: (model: string) => void;
  setAvailableModels: (models: ModelInfo[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      sessionId: null,
      userName: null,
      userAge: null,
      language: 'en',
      currentTab: 'self-exploration',
      unlockedTabs: ['self-exploration'],
      tabs: [],
      messages: [],
      isLoading: false,
      isStreaming: false,
      streamingContent: '',
      comparisonStreamingContent: '',
      selectedModel: 'stepfun/step-3.5-flash:free',
      comparisonMode: false,
      comparisonModel: 'moonshotai/kimi-k2.5',
      availableModels: [],
      
      // Actions
      setSession: (session: UserSession) => set({
        sessionId: session.sessionId,
        userName: session.userName,
        userAge: session.userAge || null,
        language: session.language,
        currentTab: session.currentTab,
        unlockedTabs: session.unlockedTabs
      }),
      
      clearSession: () => set({
        sessionId: null,
        userName: null,
        userAge: null,
        language: 'en',
        currentTab: 'self-exploration',
        unlockedTabs: ['self-exploration'],
        messages: []
      }),
      
      setLanguage: (lang: Language) => set({ language: lang }),
      
      setUserName: (name: string) => set({ userName: name }),
      
      setUserAge: (age: number) => set({ userAge: age }),
      
      setCurrentTab: (tabId: string) => set({ currentTab: tabId }),
      
      unlockTab: (tabId: string) => set((state) => ({
        unlockedTabs: [...state.unlockedTabs, tabId]
      })),
      
      setTabs: (tabs: TabInfo[]) => set({ tabs }),
      
      addMessage: (message: Message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      
      setMessages: (messages: Message[]) => set({ messages }),
      
      clearMessages: () => set({ messages: [] }),
      
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setIsStreaming: (streaming: boolean) => set({ isStreaming: streaming }),
      
      setStreamingContent: (content: string) => set({ streamingContent: content }),
      
      appendStreamingContent: (content: string) => set((state) => ({
        streamingContent: state.streamingContent + content
      })),
      
      setComparisonStreamingContent: (content: string) => set({ 
        comparisonStreamingContent: content 
      }),
      
      appendComparisonStreamingContent: (content: string) => set((state) => ({
        comparisonStreamingContent: state.comparisonStreamingContent + content
      })),
      
      setSelectedModel: (model: string) => set({ selectedModel: model }),
      
      setComparisonMode: (enabled: boolean) => set({ comparisonMode: enabled }),
      
      setComparisonModel: (model: string) => set({ comparisonModel: model }),
      
      setAvailableModels: (models: ModelInfo[]) => set({ availableModels: models })
    }),
    {
      name: 'ai-coaching-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        userName: state.userName,
        userAge: state.userAge,
        language: state.language,
        currentTab: state.currentTab,
        unlockedTabs: state.unlockedTabs,
        selectedModel: state.selectedModel,
        comparisonMode: state.comparisonMode,
        comparisonModel: state.comparisonModel
      })
    }
  )
);
