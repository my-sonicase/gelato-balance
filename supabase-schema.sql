-- ============================================================
-- Gelato Balance — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Users table (custom auth, not Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- express-session store
CREATE TABLE IF NOT EXISTS session (
  sid     VARCHAR NOT NULL PRIMARY KEY,
  sess    JSONB NOT NULL,
  expire  TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);

-- System ingredients (managed by admin, visible to all)
CREATE TABLE IF NOT EXISTS system_ingredients (
  id               VARCHAR(100) PRIMARY KEY,
  nome             TEXT NOT NULL,
  nome_en          TEXT,
  group_name       VARCHAR(50) NOT NULL,
  acqua_pct        NUMERIC(6,3) NOT NULL DEFAULT 0,
  grassi_pct       NUMERIC(6,3) NOT NULL DEFAULT 0,
  slng_pct         NUMERIC(6,3) NOT NULL DEFAULT 0,
  altri_solidi_pct NUMERIC(6,3) NOT NULL DEFAULT 0,
  zuccheri         JSONB NOT NULL DEFAULT '{}',
  pod_direct       NUMERIC(10,4),
  pac_direct       NUMERIC(10,4),
  min_pct          NUMERIC(6,3),
  max_pct          NUMERIC(6,3),
  is_archived      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User custom ingredients
CREATE TABLE IF NOT EXISTS user_custom_ingredients (
  id               VARCHAR(100) PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  nome             TEXT NOT NULL,
  nome_en          TEXT,
  group_name       VARCHAR(50) NOT NULL,
  acqua_pct        NUMERIC(6,3) NOT NULL DEFAULT 0,
  grassi_pct       NUMERIC(6,3) NOT NULL DEFAULT 0,
  slng_pct         NUMERIC(6,3) NOT NULL DEFAULT 0,
  altri_solidi_pct NUMERIC(6,3) NOT NULL DEFAULT 0,
  zuccheri         JSONB NOT NULL DEFAULT '{}',
  pod_direct       NUMERIC(10,4),
  pac_direct       NUMERIC(10,4),
  min_pct          NUMERIC(6,3),
  max_pct          NUMERIC(6,3),
  is_archived      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_custom_ingredients_user_id ON user_custom_ingredients(user_id);

-- System recipes (admin-managed, visible to all users)
CREATE TABLE IF NOT EXISTS system_recipes (
  id          VARCHAR(100) PRIMARY KEY,
  nome        TEXT NOT NULL,
  profile     VARCHAR(50) NOT NULL,
  lines       JSONB NOT NULL DEFAULT '[]',
  overrun_pct NUMERIC(6,2) NOT NULL DEFAULT 30,
  thumbnail   TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User recipes
CREATE TABLE IF NOT EXISTS user_recipes (
  id          VARCHAR(100) PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  nome        TEXT NOT NULL,
  profile     VARCHAR(50) NOT NULL,
  lines       JSONB NOT NULL DEFAULT '[]',
  overrun_pct NUMERIC(6,2) NOT NULL DEFAULT 30,
  thumbnail   TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON user_recipes(user_id);
