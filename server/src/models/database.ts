import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

let db: SqlJsDatabase;
let dbPath: string;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

// Wrapper to provide a simpler API similar to better-sqlite3
export interface PreparedLike {
  run(...params: any[]): void;
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

export interface DbLike {
  prepare(sql: string): PreparedLike;
  exec(sql: string): void;
}

class DbWrapper implements DbLike {
  constructor(private rawDb: SqlJsDatabase) {}

  prepare(sql: string): PreparedLike {
    const rawDb = this.rawDb;
    return {
      run(...params: any[]) {
        rawDb.run(sql, params);
        scheduleSave();
      },
      get(...params: any[]): any {
        const stmt = rawDb.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params: any[]): any[] {
        const results: any[] = [];
        const stmt = rawDb.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
    };
  }

  exec(sql: string): void {
    this.rawDb.run(sql);
    scheduleSave();
  }
}

let wrapper: DbWrapper;

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (e) {
      console.error('Failed to save database:', e);
    }
  }, 1000);
}

export function getDb(): DbLike {
  if (!wrapper) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return wrapper;
}

export async function initDatabase(): Promise<DbLike> {
  const SQL = await initSqlJs();

  dbPath = path.resolve(config.databasePath);
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  wrapper = new DbWrapper(db);

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      tier TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_reports (
      id TEXT PRIMARY KEY,
      agent_role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      run_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS signals (
      id TEXT PRIMARY KEY,
      coin_symbol TEXT NOT NULL,
      coin_name TEXT NOT NULL,
      type TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      reasoning TEXT NOT NULL,
      agent_role TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      run_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id TEXT NOT NULL,
      coin_id INTEGER NOT NULL,
      coin_symbol TEXT NOT NULL,
      coin_name TEXT NOT NULL DEFAULT '',
      added_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, coin_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cmc_cache (
      cache_key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      status TEXT DEFAULT 'running',
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_signals_run_id ON signals(run_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at)');
  db.run('CREATE INDEX IF NOT EXISTS idx_reports_run_id ON agent_reports(run_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_reports_role ON agent_reports(agent_role)');
  db.run('CREATE INDEX IF NOT EXISTS idx_agent_runs_user ON agent_runs(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_cmc_cache_expires ON cmc_cache(expires_at)');

  // Save initial state
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));

  return wrapper;
}
