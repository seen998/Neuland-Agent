import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  SESSION_TIMEOUT_MS: parseInt(process.env.SESSION_TIMEOUT_MS || '3600000', 10),
  MULTI_MINDS_PASSWORD: process.env.MULTI_MINDS_PASSWORD || 'NeulandKI',
  CORS_ORIGIN: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || '*' 
    : 'http://localhost:5173'
};

// Validate required configuration
export function validateConfig(): void {
  if (!CONFIG.OPENROUTER_API_KEY && CONFIG.NODE_ENV === 'production') {
    console.warn('Warning: OPENROUTER_API_KEY is not set. AI features will not work.');
  }
}
