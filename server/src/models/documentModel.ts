import { v4 as uuidv4 } from 'uuid';
import type { Document } from '@crypto-saas/shared';
import { getDb } from './database';

export function createDocument(
  userId: string, title: string, filename: string,
  mimeType: string, content: string, tags: string[], fileSize: number
): Document {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO documents (id, user_id, title, filename, mime_type, content, tags, file_size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, userId, title, filename, mimeType, content, JSON.stringify(tags), fileSize, now, now);

  for (const tag of tags) {
    db.prepare('INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES (?, ?)').run(id, tag.toLowerCase());
  }

  return { id, userId, title, filename, mimeType, content, tags, fileSize, createdAt: now, updatedAt: now };
}

export function getDocuments(userId: string, tag?: string, search?: string): Document[] {
  const db = getDb();
  let query = 'SELECT * FROM documents WHERE user_id = ?';
  const params: any[] = [userId];

  if (tag) {
    query += ' AND id IN (SELECT document_id FROM document_tags WHERE tag = ?)';
    params.push(tag.toLowerCase());
  }

  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY updated_at DESC';
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(mapDocument);
}

export function getDocumentById(id: string): Document | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any;
  return row ? mapDocument(row) : undefined;
}

export function updateDocument(id: string, userId: string, title?: string, tags?: string[]): void {
  const db = getDb();
  const sets: string[] = ["updated_at = datetime('now')"];
  const params: any[] = [];
  if (title) { sets.push('title = ?'); params.push(title); }
  if (tags) { sets.push('tags = ?'); params.push(JSON.stringify(tags)); }
  params.push(id, userId);
  db.prepare(`UPDATE documents SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);

  if (tags) {
    db.prepare('DELETE FROM document_tags WHERE document_id = ?').run(id);
    for (const tag of tags) {
      db.prepare('INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES (?, ?)').run(id, tag.toLowerCase());
    }
  }
}

export function deleteDocument(id: string, userId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM document_tags WHERE document_id = ?').run(id);
  db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').run(id, userId);
}

export function searchDocuments(query: string, limit = 10): Document[] {
  const db = getDb();
  const searchTerm = `%${query}%`;
  const rows = db.prepare(
    'SELECT * FROM documents WHERE title LIKE ? OR content LIKE ? ORDER BY updated_at DESC LIMIT ?'
  ).all(searchTerm, searchTerm, limit) as any[];
  return rows.map(mapDocument);
}

export function getAllTags(userId: string): string[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT DISTINCT dt.tag FROM document_tags dt JOIN documents d ON dt.document_id = d.id WHERE d.user_id = ? ORDER BY dt.tag'
  ).all(userId) as any[];
  return rows.map(r => r.tag);
}

function mapDocument(row: any): Document {
  return {
    id: row.id, userId: row.user_id, title: row.title, filename: row.filename,
    mimeType: row.mime_type, content: row.content, tags: JSON.parse(row.tags || '[]'),
    fileSize: row.file_size, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
