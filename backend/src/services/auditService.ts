import { v4 as uuidv4 } from 'uuid';
import { execute, queryAll } from '../database/connection.js';
import { SystemAuditLog } from '../types/shared.js';

export class AuditService {
  log(params: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
  }): void {
    const id = uuidv4();
    const now = new Date().toISOString();
    try {
      execute(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, user_agent, details_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          params.userId || null,
          params.action,
          params.resourceType,
          params.resourceId || null,
          params.ipAddress || null,
          params.userAgent || null,
          params.details ? JSON.stringify(params.details) : null,
          now,
        ]
      );
    } catch (err) {
      console.error('[AUDIT ERROR] Failed to record audit log:', err);
    }
  }

  getLogs(limit = 100): SystemAuditLog[] {
    const rows = queryAll<any>(
      `SELECT id, user_id as userId, action, resource_type as resourceType, resource_id as resourceId, 
              ip_address as ipAddress, details_json as detailsJson, created_at as createdAt
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      action: r.action,
      resourceType: r.resourceType,
      resourceId: r.resourceId,
      ipAddress: r.ipAddress,
      details: r.detailsJson ? JSON.parse(r.detailsJson) : undefined,
      createdAt: r.createdAt,
    }));
  }
}

export const auditService = new AuditService();
