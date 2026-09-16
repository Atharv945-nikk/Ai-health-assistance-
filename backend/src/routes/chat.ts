import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { chatService } from '../services/chatService.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(requireAuth);

router.get('/conversations', (req: Request, res: Response) => {
  const conversations = chatService.getConversations(req.user!.id);
  res.status(200).json({
    success: true,
    data: conversations,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const createConvSchema = z.object({
  title: z.string().optional(),
});

router.post('/conversations', validate(createConvSchema), (req: Request, res: Response) => {
  const conv = chatService.createConversation(req.user!.id, req.body.title);
  res.status(201).json({
    success: true,
    data: conv,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/conversations/:id', (req: Request, res: Response) => {
  const conv = chatService.getConversation(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: conv,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const renameSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
});

router.patch('/conversations/:id', validate(renameSchema), (req: Request, res: Response) => {
  chatService.renameConversation(req.user!.id, req.params.id as string, req.body.title);
  res.status(200).json({
    success: true,
    data: { message: 'Conversation renamed successfully' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.delete('/conversations/:id', (req: Request, res: Response) => {
  chatService.deleteConversation(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: { message: 'Conversation deleted' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.post('/conversations/:id/clear', (req: Request, res: Response) => {
  chatService.clearConversation(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: { message: 'Conversation history cleared' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const messageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty'),
});

router.post('/conversations/:id/messages', aiLimiter, validate(messageSchema), async (req: Request, res: Response) => {
  const isStream = req.query.stream === 'true' || req.headers.accept === 'text/event-stream';

  if (isStream) {
    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      const { userMessage, assistantMessage } = await chatService.sendMessage(
        req.user!.id,
        req.params.id as string,
        req.body.content,
        (chunk: string) => {
          res.write(`event: chunk\ndata: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      res.write(`event: done\ndata: ${JSON.stringify({ userMessage, assistantMessage })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message || 'Stream error' })}\n\n`);
      res.end();
    }
    return;
  }

  // Non-streaming standard JSON response
  const result = await chatService.sendMessage(
    req.user!.id,
    req.params.id as string,
    req.body.content
  );

  res.status(200).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
