import { queryAll, execute, queryOne } from '../database/connection.js';
import { AppError } from '../middlewares/errorHandler.js';
import { auditService } from './auditService.js';
import { HealthMemory } from '../types/shared.js';

export class MemoryService {
  getUserMemories(userId: string): HealthMemory[] {
    const rows = queryAll<any>(
      `SELECT id, user_id as userId, category, memory_text as memoryText,
              source_reference as sourceReference, created_at as createdAt
       FROM health_memories
       WHERE user_id = ? AND is_active = 1
       ORDER BY created_at DESC`,
      [userId]
    );

    return rows;
  }

  deleteMemory(userId: string, memoryId: string): void {
    const mem = queryOne('SELECT id FROM health_memories WHERE id = ? AND user_id = ?', [memoryId, userId]);
    if (!mem) {
      throw new AppError('Memory not found or unauthorized.', 404, 'NOT_FOUND');
    }

    execute('DELETE FROM health_memories WHERE id = ? AND user_id = ?', [memoryId, userId]);

    auditService.log({
      userId,
      action: 'MEMORY_DELETED',
      resourceType: 'health_memory',
      resourceId: memoryId,
    });
  }

  clearAllMemories(userId: string): void {
    execute('DELETE FROM health_memories WHERE user_id = ?', [userId]);

    auditService.log({
      userId,
      action: 'ALL_MEMORIES_CLEARED',
      resourceType: 'health_memory',
    });
  }
}

export const memoryService = new MemoryService();
