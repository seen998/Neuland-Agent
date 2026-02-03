import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionManager } from '../services/sessionManager.js';
import { OpenRouterService } from '../services/openrouter.js';
import { ChatRequest, ApiResponse, Message, Conversation, StreamEvent } from '../../shared/types.js';

const router = Router();

// Send message and get AI response (streaming)
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { sessionId, tabId, message, model, comparisonMode, modelB }: ChatRequest = req.body;
    
    // Validate request
    if (!sessionId || !tabId || !message || !model) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, tabId, message, model'
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
    
    // Check tab is unlocked
    if (!SessionManager.isTabUnlocked(sessionId, tabId)) {
      return res.status(403).json({
        success: false,
        error: 'Tab is locked'
      });
    }
    
    // Get conversation
    const conversation = SessionManager.getOrCreateConversation(sessionId, tabId);
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    SessionManager.addMessage(sessionId, tabId, userMessage);
    
    // Build messages for OpenRouter
    const messages = OpenRouterService.buildMessages(
      conversation.messages,
      session.language,
      message
    );
    
    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Generate message IDs
    const assistantMessageId = uuidv4();
    const comparisonMessageId = uuidv4();
    
    let fullContent = '';
    let comparisonFullContent = '';
    
    // Send initial event with message IDs
    res.write(`data: ${JSON.stringify({ 
      type: 'start', 
      messageId: assistantMessageId,
      comparisonMessageId: comparisonMode ? comparisonMessageId : undefined
    })}\n\n`);
    
    try {
      // Stream primary model response
      const streamGenerator = OpenRouterService.streamMessage(model, messages);
      
      for await (const chunk of streamGenerator) {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ 
          type: 'content', 
          content: chunk,
          model 
        })}\n\n`);
      }
      
      // If comparison mode, stream second model
      if (comparisonMode && modelB) {
        res.write(`data: ${JSON.stringify({ type: 'comparisonStart' })}\n\n`);
        
        const comparisonGenerator = OpenRouterService.streamMessage(modelB, messages);
        
        for await (const chunk of comparisonGenerator) {
          comparisonFullContent += chunk;
          res.write(`data: ${JSON.stringify({ 
            type: 'comparisonContent', 
            content: chunk,
            model: modelB 
          })}\n\n`);
        }
      }
      
      // Save assistant messages
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
        model
      };
      SessionManager.addMessage(sessionId, tabId, assistantMessage);
      
      if (comparisonMode && modelB) {
        const comparisonMessage: Message = {
          id: comparisonMessageId,
          role: 'assistant',
          content: comparisonFullContent,
          timestamp: new Date().toISOString(),
          model: modelB
        };
        SessionManager.addMessage(sessionId, tabId, comparisonMessage);
      }
      
      // Send done event
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
      
    } catch (error) {
      console.error('Error streaming from OpenRouter:', error);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Failed to get AI response'
      })}\n\n`);
      res.end();
    }
    
  } catch (error) {
    console.error('Error in chat/send:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to process message'
      });
    }
  }
});

// Get conversation history
router.get('/history/:sessionId/:tabId', (req: Request, res: Response<ApiResponse<Conversation>>) => {
  try {
    const { sessionId, tabId } = req.params;
    
    const conversation = SessionManager.getConversation(sessionId, tabId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    return res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get conversation history'
    });
  }
});

// Clear conversation history
router.delete('/history/:sessionId/:tabId', (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const { sessionId, tabId } = req.params;
    
    const cleared = SessionManager.clearConversation(sessionId, tabId);
    
    if (!cleared) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    return res.json({
      success: true
    });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear conversation'
    });
  }
});

// Update conversation settings (model, comparison mode)
router.put('/settings/:sessionId/:tabId', (req: Request, res: Response<ApiResponse<Conversation>>) => {
  try {
    const { sessionId, tabId } = req.params;
    const { model, comparisonMode, modelB } = req.body;
    
    const conversation = SessionManager.updateConversationSettings(sessionId, tabId, {
      model,
      comparisonMode,
      modelB
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    return res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error updating conversation settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update conversation settings'
    });
  }
});

export default router;
