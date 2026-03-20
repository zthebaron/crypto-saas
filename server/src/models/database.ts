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
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      last_login_at TEXT,
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

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // --- Notifications ---
  db.run(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id TEXT PRIMARY KEY,
      push_enabled INTEGER DEFAULT 0,
      email_enabled INTEGER DEFAULT 0,
      signal_confidence_threshold INTEGER DEFAULT 80,
      price_change_threshold REAL DEFAULT 10.0,
      digest_frequency TEXT DEFAULT 'daily',
      push_subscription TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // --- Portfolio ---
  db.run(`
    CREATE TABLE IF NOT EXISTS portfolio_positions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      coin_symbol TEXT NOT NULL,
      coin_name TEXT NOT NULL,
      entry_price REAL NOT NULL,
      quantity REAL NOT NULL,
      signal_id TEXT,
      status TEXT DEFAULT 'open',
      opened_at TEXT DEFAULT (datetime('now')),
      closed_at TEXT,
      close_price REAL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      total_value REAL NOT NULL,
      total_pnl REAL NOT NULL,
      snapshot_data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // --- Documents / Knowledge Base ---
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      file_size INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS document_tags (
      document_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      PRIMARY KEY (document_id, tag),
      FOREIGN KEY (document_id) REFERENCES documents(id)
    )
  `);

  // --- Alert Rules ---
  db.run(`
    CREATE TABLE IF NOT EXISTS alert_rules (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      condition_type TEXT NOT NULL,
      condition_config TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_config TEXT NOT NULL DEFAULT '{}',
      enabled INTEGER DEFAULT 1,
      last_triggered_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // --- Signal Outcomes / Accuracy ---
  db.run(`
    CREATE TABLE IF NOT EXISTS signal_outcomes (
      id TEXT PRIMARY KEY,
      signal_id TEXT NOT NULL UNIQUE,
      coin_symbol TEXT NOT NULL,
      signal_type TEXT NOT NULL,
      agent_role TEXT NOT NULL,
      entry_price REAL NOT NULL,
      price_24h REAL,
      price_7d REAL,
      price_30d REAL,
      pnl_24h REAL,
      pnl_7d REAL,
      pnl_30d REAL,
      accurate_24h INTEGER,
      accurate_7d INTEGER,
      accurate_30d INTEGER,
      evaluated_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (signal_id) REFERENCES signals(id)
    )
  `);

  // --- Subscriptions ---
  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      payment_method TEXT NOT NULL DEFAULT 'none',
      stripe_subscription_id TEXT,
      paypal_subscription_id TEXT,
      crypto_wallet_address TEXT,
      current_period_start TEXT NOT NULL,
      current_period_end TEXT NOT NULL,
      cancel_at_period_end INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // --- Payments ---
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      subscription_id TEXT REFERENCES subscriptions(id),
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL,
      transaction_id TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // --- Trades ---
  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      chain_id INTEGER NOT NULL,
      token_in TEXT NOT NULL,
      token_out TEXT NOT NULL,
      amount_in TEXT NOT NULL,
      amount_out TEXT DEFAULT '',
      tx_hash TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      signal_id TEXT,
      dex_used TEXT DEFAULT '',
      gas_paid TEXT DEFAULT '',
      slippage REAL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // --- API Keys ---
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      last_used_at TEXT,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
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
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read)');
  db.run('CREATE INDEX IF NOT EXISTS idx_positions_user ON portfolio_positions(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_positions_status ON portfolio_positions(user_id, status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_snapshots_user ON portfolio_snapshots(user_id, created_at)');
  db.run('CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag)');
  db.run('CREATE INDEX IF NOT EXISTS idx_alert_rules_user ON alert_rules(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled)');
  db.run('CREATE INDEX IF NOT EXISTS idx_outcomes_signal ON signal_outcomes(signal_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_outcomes_agent ON signal_outcomes(agent_role)');
  db.run('CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id)');

  // Ensure admin role for platform owners
  db.run("UPDATE users SET role = 'admin', tier = 'enterprise' WHERE email = 'thefirmla@gmail.com'");
  db.run("UPDATE users SET role = 'admin', tier = 'enterprise' WHERE email = 'timdevallee@gmail.com'");
  db.run("UPDATE users SET role = 'admin', tier = 'enterprise' WHERE email = 'CEO@exora.group'");

  // Save initial state
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));

  return wrapper;
}
