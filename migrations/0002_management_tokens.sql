CREATE TABLE management_tokens (token_hash TEXT PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE, created_at TEXT NOT NULL);
CREATE INDEX management_tokens_lead ON management_tokens(lead_id);
INSERT INTO management_tokens(token_hash,lead_id,created_at) SELECT unsubscribe_hash,id,created_at FROM leads;
