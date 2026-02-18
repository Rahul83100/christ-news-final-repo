-- =============================================
-- SCHEMA: admin_emails
-- =============================================
-- PURPOSE: Pre-register admin email addresses.
-- When someone signs up with an email in this table,
-- the system auto-assigns them the 'admin' role.
--
-- FLOW:
-- 1. Current admin adds an email (e.g. "newadmin@gmail.com")
-- 2. That email gets inserted into this table
-- 3. When "newadmin@gmail.com" signs up, the sign-up code
--    checks this table → finds a match → sets role='admin'
--    in their profiles row
-- 4. On login, middleware sees role='admin' → full access
--
-- COLUMNS:
-- - id: unique identifier
-- - email: the Gmail/email address of the future admin
-- - added_by: which admin added this email (tracks accountability)
-- - created_at: when it was added

CREATE TABLE IF NOT EXISTS admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Only admins can read/write this table
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage admin_emails"
  ON admin_emails FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- =============================================
-- SCHEMA: word_search_config
-- =============================================
-- PURPOSE: Store the admin-configured words for the
-- Word Search puzzle game. Instead of hardcoded words,
-- admins can add up to 10 words and set the grid size.
-- The game fetches from this table and auto-generates
-- the jumbled grid.
--
-- COLUMNS:
-- - id: unique identifier (only 1 row expected)
-- - words: array of words (max 10) the players need to find
-- - grid_size: how big the grid is (default 10x10, max 20x20)
-- - updated_at: last time an admin changed the config
-- - updated_by: which admin last saved changes

CREATE TABLE IF NOT EXISTS word_search_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  words TEXT[] NOT NULL DEFAULT '{"CHRIST", "CHRONICLE", "NEWSLETTER", "CAMPUS", "LOGIC", "PUZZLE"}',
  grid_size INT NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS: Everyone can read (to play the game), only admins can write
ALTER TABLE word_search_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read word_search_config"
  ON word_search_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can update word_search_config"
  ON word_search_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default config row (so the game works immediately)
INSERT INTO word_search_config (words, grid_size)
VALUES ('{"CHRIST", "CHRONICLE", "NEWSLETTER", "CAMPUS", "LOGIC", "PUZZLE"}', 10)
ON CONFLICT DO NOTHING;
