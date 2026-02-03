import { CONFIG } from '../constants/config.js';
import { SYSTEM_PROMPTS, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from '../constants/prompts.js';
import { 
  OpenRouterRequest, 
  OpenRouterResponse, 
  OpenRouterMessage, 
  Message, 
  Language,
  OpenRouterStreamChunk
} from '../../shared/types.js';

export class OpenRouterService {
  private static readonly BASE_URL = CONFIG.OPENROUTER_BASE_URL;
  private static readonly API_KEY = CONFIG.OPENROUTER_API_KEY;
  
  // Build messages array with system prompt
  static buildMessages(
    history: Message[], 
    language: Language, 
    userMessage?: string
  ): OpenRouterMessage[] {
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS[language] }
    ];
    
    // Add conversation history (last 20 messages to stay within token limits)
    const recentHistory = history.slice(-20);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    // Add new user message if provided
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    }
    
    return messages;
  }
  
  // Send message and get response (non-streaming)
  static async sendMessage(
    model: string,
    messages: OpenRouterMessage[],
    temperature: number = DEFAULT_TEMPERATURE,
    maxTokens: number = DEFAULT_MAX_TOKENS
  ): Promise<string> {
    if (!this.API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }
    
    const requestBody: OpenRouterRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };
    
    const response = await fetch(`${this.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
        'HTTP-Referer': 'https://ai-coaching-agent.com',
        'X-Title': 'AI Coaching Agent'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }
  
  // Stream message response
  static async *streamMessage(
    model: string,
    messages: OpenRouterMessage[],
    temperature: number = DEFAULT_TEMPERATURE,
    maxTokens: number = DEFAULT_MAX_TOKENS
  ): AsyncGenerator<string, void, unknown> {
    if (!this.API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }
    
    const requestBody: OpenRouterRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true
    };
    
    const response = await fetch(`${this.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
        'HTTP-Referer': 'https://ai-coaching-agent.com',
        'X-Title': 'AI Coaching Agent'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }
    
    if (!response.body) {
      throw new Error('No response body from OpenRouter');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
          
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonData: OpenRouterStreamChunk = JSON.parse(trimmedLine.slice(6));
              const content = jsonData.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip malformed JSON lines
              console.warn('Failed to parse stream chunk:', trimmedLine);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  
  // Test API connection
  static async testConnection(): Promise<boolean> {
    if (!this.API_KEY) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}
