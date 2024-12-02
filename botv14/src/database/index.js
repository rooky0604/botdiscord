import Database from 'better-sqlite3';

const db = new Database('bot.db');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_config (
      guild_id TEXT PRIMARY KEY,
      ticket_log_channel_id TEXT,
      presence_log_channel_id TEXT,
      summon_log_channel_id TEXT,
      log_role_id TEXT,
      summon_roles TEXT DEFAULT '[]',
      ticket_category_id TEXT,
      tickets_enabled BOOLEAN DEFAULT 1,
      setup_completed BOOLEAN DEFAULT 0,
      setup_timestamp DATETIME
    );

    CREATE TABLE IF NOT EXISTS ticket_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      name TEXT,
      description TEXT,
      command TEXT,
      allowed_roles TEXT DEFAULT '[]',
      is_active BOOLEAN DEFAULT 1,
      service_status TEXT DEFAULT 'OPEN',
      status_reason TEXT,
      ticket_limit INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      user_id TEXT,
      category_id INTEGER,
      status TEXT DEFAULT 'OPEN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY(category_id) REFERENCES ticket_categories(id)
    );

    CREATE TABLE IF NOT EXISTS ticket_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER,
      user_id TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(ticket_id) REFERENCES tickets(id)
    );

    CREATE TABLE IF NOT EXISTS summons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      user_id TEXT,
      summoner_id TEXT,
      reason TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      summary TEXT,
      confirmed BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_presence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      status TEXT DEFAULT 'PRESENT',
      reason TEXT,
      until_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      return_at DATETIME
    );
  `);
}

export { db };