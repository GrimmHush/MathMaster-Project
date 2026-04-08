-- Run this in your PostgreSQL database to setup the tables

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50), -- 'local', 'google', 'github'
    oauth_id VARCHAR(255),
    total_xp INT DEFAULT 0,
    level INT DEFAULT 1,
    target_age VARCHAR(10),
    global_streak INT DEFAULT 0,
    lifetime_correct INT DEFAULT 0,
    lifetime_attempted INT DEFAULT 0,
    last_played_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS round_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    xp_earned INT NOT NULL,
    questions_correct INT NOT NULL,
    questions_attempted INT NOT NULL,
    max_streak INT NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast weekly leaderboard queries
CREATE INDEX idx_round_results_played_at ON round_results(played_at);
CREATE INDEX idx_users_total_xp ON users(total_xp DESC);