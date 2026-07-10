-- 0005: warstwa społeczna (2026-07-10)
-- 1) Czat 1:1 między zaakceptowanymi znajomymi.
-- 2) "Spaceruję — dołącz": opt-in widoczność aktywnego spaceru dla wszystkich.

CREATE TABLE messages (
  id uuid PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CHECK (sender_id <> recipient_id)
);

-- Historia rozmowy pary userów niezależnie od kierunku.
CREATE INDEX messages_pair_idx
  ON messages (LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), created_at);
-- Szybkie liczenie nieprzeczytanych.
CREATE INDEX messages_unread_idx ON messages (recipient_id) WHERE read_at IS NULL;

ALTER TABLE walk_sessions ADD COLUMN is_open boolean NOT NULL DEFAULT false;
ALTER TABLE walk_sessions ADD COLUMN open_note text CHECK (char_length(open_note) <= 200);

-- Listowanie otwartych aktywnych spacerów.
CREATE INDEX walk_sessions_open_idx ON walk_sessions (started_at)
  WHERE is_open AND status = 'active';
