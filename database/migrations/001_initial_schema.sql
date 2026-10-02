-- ============================================================================
-- Migration 001: Initial Relational Database Schema Creation
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    avatar VARCHAR(16) DEFAULT '🦊',
    role VARCHAR(16) DEFAULT 'PLAYER',
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    elo_rating INT DEFAULT 1200,
    peak_elo INT DEFAULT 1200,
    total_games INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    total_draws INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    total_points BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS game_rooms (
    id VARCHAR(64) PRIMARY KEY,
    room_code VARCHAR(5) NOT NULL,
    host_player_id VARCHAR(64) NOT NULL REFERENCES users(id),
    guest_player_id VARCHAR(64) REFERENCES users(id),
    status VARCHAR(24) DEFAULT 'LOBBY',
    word_length INT DEFAULT 5,
    total_rounds INT DEFAULT 3,
    current_round_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_rounds (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    word_setter_id VARCHAR(64) NOT NULL REFERENCES users(id),
    guesser_id VARCHAR(64) NOT NULL REFERENCES users(id),
    secret_word VARCHAR(16) NOT NULL,
    wheel_letters VARCHAR(32) NOT NULL,
    attempts_used INT DEFAULT 0,
    max_attempts INT DEFAULT 6,
    is_completed BOOLEAN DEFAULT FALSE,
    is_word_found BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS round_guesses (
    id VARCHAR(64) PRIMARY KEY,
    round_id VARCHAR(64) NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
    player_id VARCHAR(64) NOT NULL REFERENCES users(id),
    attempt_number INT NOT NULL,
    guess_word VARCHAR(16) NOT NULL,
    evaluation_states VARCHAR(32) NOT NULL,
    is_exact_match BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
