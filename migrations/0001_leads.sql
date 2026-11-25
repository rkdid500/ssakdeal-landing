-- Consultation requests from the landing page forms.
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  products TEXT NOT NULL,
  contact_time TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  marketing INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'form'
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at);
