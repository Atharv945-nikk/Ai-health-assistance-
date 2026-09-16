import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

let dbInstance: DatabaseSync | null = null;

export function getDatabasePath(): string {
  if (config.databaseUrl.startsWith('sqlite:')) {
    return config.databaseUrl.replace('sqlite:', '');
  }
  return path.resolve(process.cwd(), config.databaseUrl);
}

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDatabasePath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new DatabaseSync(dbPath);
  
  // Enforce WAL mode, foreign keys, and performant sync settings
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA synchronous = NORMAL;');

  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Database helper utilities for safe prepared statement execution
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.get(...params) as T | undefined;
  return result || null;
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

export function execute(sql: string, params: any[] = []): { changes: number | bigint; lastInsertRowid: number | bigint } {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export function runInTransaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec('BEGIN TRANSACTION;');
  try {
    const res = fn();
    db.exec('COMMIT;');
    return res;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
