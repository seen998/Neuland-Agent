import { Router, Request, Response } from 'express';
import { ApiResponse, AppConfig, ModelInfo } from '../../shared/types.js';
import { AVAILABLE_MODELS, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from '../constants/prompts.js';

const router = Router();

// Get available models
router.get('/models', (req: Request, res: Response<ApiResponse<ModelInfo[]>>) => {
  try {
    return res.json({
      success: true,
      data: AVAILABLE_MODELS
    });
  } catch (error) {
    console.error('Error getting models:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get models'
    });
  }
});

// Get app configuration
router.get('/app', (req: Request, res: Response<ApiResponse<AppConfig>>) => {
  try {
    const config: AppConfig = {
      models: AVAILABLE_MODELS,
      defaultModel: DEFAULT_MODEL,
      temperature: DEFAULT_TEMPERATURE,
      maxTokens: DEFAULT_MAX_TOKENS
    };
    
    return res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting app config:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get app configuration'
    });
  }
});

export default router;
