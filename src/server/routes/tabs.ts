import { Router, Request, Response } from 'express';
import { SessionManager } from '../services/sessionManager.js';
import { UnlockTabRequest, ApiResponse, TabInfo } from '../../shared/types.js';
import { TABS } from '../constants/prompts.js';

const router = Router();

// Get available tabs for a session
router.get('/available/:sessionId', (req: Request, res: Response<ApiResponse<TabInfo[]>>) => {
  try {
    const { sessionId } = req.params;
    
    // Check session exists
    const session = SessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Build tab list with current lock status
    const tabs: TabInfo[] = TABS.map(tab => ({
      ...tab,
      locked: !SessionManager.isTabUnlocked(sessionId, tab.id)
    }));
    
    return res.json({
      success: true,
      data: tabs
    });
  } catch (error) {
    console.error('Error getting available tabs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get available tabs'
    });
  }
});

// Unlock a tab
router.post('/unlock', (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const { sessionId, tabId, password }: UnlockTabRequest = req.body;
    
    if (!sessionId || !tabId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, tabId, password'
      });
    }
    
    // Check session exists
    const session = SessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Attempt unlock
    const unlocked = SessionManager.unlockTab(sessionId, tabId, password);
    
    if (!unlocked) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }
    
    return res.json({
      success: true
    });
  } catch (error) {
    console.error('Error unlocking tab:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to unlock tab'
    });
  }
});

export default router;
