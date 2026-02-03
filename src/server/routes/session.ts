import { Router, Request, Response } from 'express';
import { SessionManager } from '../services/sessionManager.js';
import { CreateSessionRequest, UpdateSessionRequest, ApiResponse, UserSession } from '../../shared/types.js';

const router = Router();

// Create new session
router.post('/create', (req: Request, res: Response<ApiResponse<UserSession>>) => {
  try {
    const { userName, userAge, language }: CreateSessionRequest = req.body;
    
    if (!userName || typeof userName !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'userName is required' 
      });
    }
    
    if (!language || !['en', 'de'].includes(language)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid language (en or de) is required' 
      });
    }
    
    const session = SessionManager.createSession(userName.trim(), language, userAge);
    
    return res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
});

// Get session by ID
router.get('/:sessionId', (req: Request, res: Response<ApiResponse<UserSession>>) => {
  try {
    const { sessionId } = req.params;
    const session = SessionManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    return res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get session'
    });
  }
});

// Update session
router.put('/:sessionId', (req: Request, res: Response<ApiResponse<UserSession>>) => {
  try {
    const { sessionId } = req.params;
    const updates: UpdateSessionRequest = req.body;
    
    const session = SessionManager.updateSession(sessionId, updates);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    return res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update session'
    });
  }
});

// Delete session
router.delete('/:sessionId', (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const { sessionId } = req.params;
    const deleted = SessionManager.deleteSession(sessionId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    return res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete session'
    });
  }
});

export default router;
