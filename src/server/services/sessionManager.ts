import { v4 as uuidv4 } from 'uuid';
import { UserSession, Message, Conversation, Language } from '../../shared/types.js';
import { SESSION_TIMEOUT_MS } from '../constants/prompts.js';
import { CONFIG } from '../constants/config.js';

// In-memory storage
const sessions = new Map<string, UserSession>();
const conversations = new Map<string, Conversation>();

export class SessionManager {
  // Create a new session
  static createSession(userName: string, language: Language, userAge?: number): UserSession {
    const sessionId = uuidv4();
    const now = new Date().toISOString();
    
    const session: UserSession = {
      sessionId,
      userName,
      userAge,
      language,
      currentTab: 'self-exploration',
      unlockedTabs: ['self-exploration'],
      createdAt: now,
      lastActiveAt: now
    };
    
    sessions.set(sessionId, session);
    
    // Initialize conversation for self-exploration tab
    this.getOrCreateConversation(sessionId, 'self-exploration');
    
    console.log(`Session created: ${sessionId} for user: ${userName}`);
    return session;
  }
  
  // Get session by ID
  static getSession(sessionId: string): UserSession | undefined {
    const session = sessions.get(sessionId);
    if (session) {
      // Update last active time
      session.lastActiveAt = new Date().toISOString();
    }
    return session;
  }
  
  // Update session
  static updateSession(sessionId: string, updates: Partial<UserSession>): UserSession | undefined {
    const session = sessions.get(sessionId);
    if (!session) return undefined;
    
    Object.assign(session, updates);
    session.lastActiveAt = new Date().toISOString();
    
    sessions.set(sessionId, session);
    return session;
  }
  
  // Delete session
  static deleteSession(sessionId: string): boolean {
    // Delete all conversations for this session
    for (const [key, conversation] of conversations.entries()) {
      if (conversation.sessionId === sessionId) {
        conversations.delete(key);
      }
    }
    
    return sessions.delete(sessionId);
  }
  
  // Get or create conversation
  static getOrCreateConversation(sessionId: string, tabId: string): Conversation {
    const key = `${sessionId}:${tabId}`;
    let conversation = conversations.get(key);
    
    if (!conversation) {
      conversation = {
        sessionId,
        tabId,
        messages: [],
        model: CONFIG.OPENROUTER_API_KEY ? 'tngtech/deepseek-r1t2-chimera:free' : '',
        comparisonMode: false
      };
      conversations.set(key, conversation);
    }
    
    return conversation;
  }
  
  // Get conversation
  static getConversation(sessionId: string, tabId: string): Conversation | undefined {
    const key = `${sessionId}:${tabId}`;
    return conversations.get(key);
  }
  
  // Add message to conversation
  static addMessage(sessionId: string, tabId: string, message: Message): void {
    const conversation = this.getOrCreateConversation(sessionId, tabId);
    conversation.messages.push(message);
    
    // Keep only last 50 messages to prevent memory issues
    if (conversation.messages.length > 50) {
      conversation.messages = conversation.messages.slice(-50);
    }
    
    const key = `${sessionId}:${tabId}`;
    conversations.set(key, conversation);
  }
  
  // Clear conversation
  static clearConversation(sessionId: string, tabId: string): boolean {
    const key = `${sessionId}:${tabId}`;
    const conversation = conversations.get(key);
    
    if (conversation) {
      conversation.messages = [];
      conversations.set(key, conversation);
      return true;
    }
    
    return false;
  }
  
  // Update conversation settings
  static updateConversationSettings(
    sessionId: string, 
    tabId: string, 
    settings: { model?: string; comparisonMode?: boolean; modelB?: string }
  ): Conversation | undefined {
    const key = `${sessionId}:${tabId}`;
    const conversation = conversations.get(key);
    
    if (!conversation) return undefined;
    
    Object.assign(conversation, settings);
    conversations.set(key, conversation);
    return conversation;
  }
  
  // Unlock tab
  static unlockTab(sessionId: string, tabId: string, password: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;
    
    if (password !== CONFIG.MULTI_MINDS_PASSWORD) {
      return false;
    }
    
    if (!session.unlockedTabs.includes(tabId)) {
      session.unlockedTabs.push(tabId);
      sessions.set(sessionId, session);
      
      // Initialize conversation for this tab
      this.getOrCreateConversation(sessionId, tabId);
    }
    
    return true;
  }
  
  // Check if tab is unlocked
  static isTabUnlocked(sessionId: string, tabId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;
    
    // Self-exploration is always unlocked
    if (tabId === 'self-exploration') return true;
    
    return session.unlockedTabs.includes(tabId);
  }
  
  // Clean up expired sessions
  static cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of sessions.entries()) {
      const lastActive = new Date(session.lastActiveAt).getTime();
      if (now - lastActive > CONFIG.SESSION_TIMEOUT_MS) {
        this.deleteSession(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }
  
  // Get all sessions (for debugging)
  static getAllSessions(): UserSession[] {
    return Array.from(sessions.values());
  }
  
  // Get session count
  static getSessionCount(): number {
    return sessions.size;
  }
}

// Start cleanup interval
setInterval(() => {
  SessionManager.cleanupExpiredSessions();
}, 60000); // Run every minute
