-- Cloudflare D1 Database Schema
-- Run this with: wrangler d1 execute <database-name> --file=server/migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS journals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  journal_id INTEGER NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_todos_journal_id ON todos(journal_id);
CREATE INDEX IF NOT EXISTS idx_todos_done ON todos(done);
