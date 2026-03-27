-- ============================================================
-- Golf4Good — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  handicap            INTEGER,
  role                TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  stripe_customer_id  TEXT UNIQUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id    TEXT UNIQUE,
  stripe_customer_id        TEXT,
  status                    TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','inactive','cancelled','lapsed','past_due')),
  plan                      TEXT CHECK (plan IN ('monthly', 'yearly')),
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  charity_amount            DECIMAL(10,2) DEFAULT 1.30,
  cancel_at_period_end      BOOLEAN DEFAULT FALSE,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ── SCORES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Max 5 scores per user (enforced by application rolling logic)
CREATE INDEX idx_scores_user_date ON scores(user_id, date DESC);

-- ── CHARITIES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charities (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  description           TEXT,
  long_description      TEXT,
  category              TEXT,
  website               TEXT,
  location              TEXT,
  image_url             TEXT,
  registration_number   TEXT,
  featured              BOOLEAN DEFAULT FALSE,
  total_raised          DECIMAL(12,2) DEFAULT 0,
  supporter_count       INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── CHARITY EVENTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charity_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id   UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  date         DATE NOT NULL,
  location     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── USER CHARITY SELECTIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_charity_selections (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id        UUID NOT NULL REFERENCES charities(id),
  contribution_pct  INTEGER NOT NULL DEFAULT 10 CHECK (contribution_pct >= 10 AND contribution_pct <= 100),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ── DONATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id  UUID NOT NULL REFERENCES charities(id),
  amount      DECIMAL(10,2) NOT NULL,
  type        TEXT NOT NULL DEFAULT 'one_off' CHECK (type IN ('one_off', 'subscription')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── DRAWS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draws (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  draw_date         DATE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','running','published','cancelled')),
  algorithm         TEXT NOT NULL DEFAULT 'random',
  prize_pool        DECIMAL(12,2) DEFAULT 0,
  jackpot           DECIMAL(12,2) DEFAULT 0,
  jackpot_rollover  DECIMAL(12,2) DEFAULT 0,
  five_match_pool   DECIMAL(12,2),
  four_match_pool   DECIMAL(12,2),
  three_match_pool  DECIMAL(12,2),
  winning_numbers   INTEGER[],
  participant_count INTEGER DEFAULT 0,
  winner_summary    JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── DRAW PARTICIPANTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_participants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id     UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scores_snapshot INTEGER[],
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- ── DRAW WINNERS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_winners (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id               UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type            TEXT NOT NULL CHECK (match_type IN ('5-match','4-match','3-match')),
  amount                DECIMAL(10,2) NOT NULL,
  proof_url             TEXT,
  verification_status   TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','submitted','approved','rejected')),
  payment_status        TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','processing','paid')),
  verified_at           TIMESTAMPTZ,
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────────────────────
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_charities_featured ON charities(featured);
CREATE INDEX idx_charities_category ON charities(category);
CREATE INDEX idx_draws_status ON draws(status);
CREATE INDEX idx_draws_date ON draws(draw_date DESC);
CREATE INDEX idx_draw_winners_user ON draw_winners(user_id);
CREATE INDEX idx_draw_winners_status ON draw_winners(verification_status);
CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_donations_charity ON donations(charity_id);

-- ── RPC FUNCTIONS ─────────────────────────────────────────────────────────

-- Increment charity supporter count
CREATE OR REPLACE FUNCTION increment_charity_supporters(cid UUID)
RETURNS void AS $$
BEGIN
  UPDATE charities SET supporter_count = supporter_count + 1 WHERE id = cid;
END;
$$ LANGUAGE plpgsql;

-- Increment charity total raised
CREATE OR REPLACE FUNCTION increment_charity_raised(cid UUID, amt DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE charities SET total_raised = total_raised + amt WHERE id = cid;
END;
$$ LANGUAGE plpgsql;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charity_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by backend)
-- These policies allow the service role full access

-- ── SEED DATA — Demo Charities ─────────────────────────────────────────────
INSERT INTO charities (name, description, long_description, category, website, location, featured, image_url) VALUES
(
  'Cancer Research UK',
  'The world''s leading cancer research charity, funding work to beat cancer sooner.',
  'Cancer Research UK is a cancer research and awareness charity in the United Kingdom. They fund scientists, doctors and nurses, and campaign for better cancer treatment and prevention.',
  'Health',
  'https://www.cancerresearchuk.org',
  'London, UK',
  true,
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80'
),
(
  'The Stroke Association',
  'We support stroke survivors and their families, and fund vital research.',
  'The Stroke Association is a UK charity which provides support for stroke patients and their families, and campaigns for better prevention, treatment and care.',
  'Health',
  'https://www.stroke.org.uk',
  'London, UK',
  false,
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80'
),
(
  'Golf Foundation',
  'Making golf accessible to young people across the UK.',
  'The Golf Foundation is the charity that grows junior golf participation, coaches, and provides pathways for young people to succeed in the sport.',
  'Sport',
  'https://www.golf-foundation.org',
  'Nottingham, UK',
  true,
  'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=80'
),
(
  'Alzheimer''s Society',
  'United against dementia — we support people affected and fund research.',
  'Alzheimer''s Society is a care and research charity for people with dementia and those who care for them.',
  'Health',
  'https://www.alzheimers.org.uk',
  'London, UK',
  false,
  'https://images.unsplash.com/photo-1576765607924-3f7b8410a787?w=800&q=80'
),
(
  'Children in Need',
  'Helping disadvantaged children and young people across the UK.',
  'BBC Children in Need is the BBC''s UK charity. Their vision is that every child in the UK should have the chance to thrive.',
  'Children',
  'https://www.bbc.co.uk/pudsey',
  'London, UK',
  false,
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80'
),
(
  'Local Food Banks Network',
  'Tackling food poverty in communities across the United Kingdom.',
  'The Trussell Trust supports a nationwide network of food banks, providing emergency food and support to people locked in poverty.',
  'Poverty',
  'https://www.trusselltrust.org',
  'Nationwide, UK',
  false,
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80'
)
ON CONFLICT DO NOTHING;

-- ── SEED DATA — Demo Admin User ─────────────────────────────────────────────
-- Password: admin1234 (bcrypt hash)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@golf4good.co', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbkqOWuCfIp7e1e', 'Admin', 'User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Password: demo1234 (bcrypt hash)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('demo@golf4good.co', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC7E/IQVF4UrHZaQ0Kaa', 'Demo', 'Golfer', 'user')
ON CONFLICT (email) DO NOTHING;
