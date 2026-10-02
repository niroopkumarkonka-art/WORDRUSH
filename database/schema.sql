-- ============================================================================
-- WORDRUSH ARENA - Enterprise Relational Database Schema (SQL)
-- Compatible with PostgreSQL, MySQL, and SQLite 3
-- Manages Users, Authentication, Game Rooms, Live Rounds, Wordle Detections,
-- Tactical Hints, Match History, Global Leaderboards, and Lexical Analytics
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    avatar VARCHAR(16) DEFAULT '🦊',
    role VARCHAR(16) DEFAULT 'PLAYER' CHECK (role IN ('PLAYER', 'MODERATOR', 'ADMIN')),
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 2. USER PROFILES & CAREER STATISTICS
-- ----------------------------------------------------------------------------
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
    total_points BIGINT DEFAULT 0,
    words_decrypted INT DEFAULT 0,
    exact_anagrams_found INT DEFAULT 0,
    hints_used_count INT DEFAULT 0,
    avg_attempts_per_round NUMERIC(4, 2) DEFAULT 0.00,
    fastest_win_seconds INT DEFAULT NULL,
    favorite_word_length INT DEFAULT 5,
    last_played_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_profiles_elo ON user_profiles(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_wins ON user_profiles(total_wins DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON user_profiles(total_points DESC);

-- ----------------------------------------------------------------------------
-- 3. MULTIPLAYER GAME ROOMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_rooms (
    id VARCHAR(64) PRIMARY KEY,
    room_code VARCHAR(5) NOT NULL,
    host_player_id VARCHAR(64) NOT NULL REFERENCES users(id),
    guest_player_id VARCHAR(64) REFERENCES users(id),
    status VARCHAR(24) DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'PLAYING', 'ROUND_PAUSE', 'FINISHED', 'TERMINATED')),
    word_length INT DEFAULT 5 CHECK (word_length BETWEEN 3 AND 8),
    total_rounds INT DEFAULT 3 CHECK (total_rounds IN (1, 3, 5, 7)),
    current_round_index INT DEFAULT 0,
    winner_player_id VARCHAR(64) REFERENCES users(id),
    is_bot_match BOOLEAN DEFAULT FALSE,
    spectator_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON game_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_host ON game_rooms(host_player_id);
CREATE INDEX IF NOT EXISTS idx_rooms_created ON game_rooms(created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. ROUND SESSIONS & SECRET WORDS
-- ----------------------------------------------------------------------------
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
    free_hints_remaining INT DEFAULT 2,
    extra_hints_used INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    is_word_found BOOLEAN DEFAULT FALSE,
    round_winner_id VARCHAR(64) REFERENCES users(id),
    points_awarded INT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_rounds_room ON game_rounds(room_id);
CREATE INDEX IF NOT EXISTS idx_rounds_guesser ON game_rounds(guesser_id);
CREATE INDEX IF NOT EXISTS idx_rounds_completed ON game_rounds(is_completed);

-- ----------------------------------------------------------------------------
-- 5. WORDLE GUESSES & DEDUCTION TIMELINE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS round_guesses (
    id VARCHAR(64) PRIMARY KEY,
    round_id VARCHAR(64) NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
    player_id VARCHAR(64) NOT NULL REFERENCES users(id),
    attempt_number INT NOT NULL CHECK (attempt_number BETWEEN 1 AND 6),
    guess_word VARCHAR(16) NOT NULL,
    evaluation_states VARCHAR(32) NOT NULL, -- e.g. "2,1,0,0,2" (2=GREEN, 1=YELLOW, 0=GRAY)
    is_exact_match BOOLEAN DEFAULT FALSE,
    time_taken_ms INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guesses_round ON round_guesses(round_id);
CREATE INDEX IF NOT EXISTS idx_guesses_player ON round_guesses(player_id);
CREATE INDEX IF NOT EXISTS idx_guesses_word ON round_guesses(guess_word);

-- ----------------------------------------------------------------------------
-- 6. TACTICAL POP-UP HINTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tactical_hints (
    id VARCHAR(64) PRIMARY KEY,
    round_id VARCHAR(64) NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
    player_id VARCHAR(64) NOT NULL REFERENCES users(id),
    hint_level INT NOT NULL CHECK (hint_level IN (1, 2, 3)),
    hint_title VARCHAR(64) NOT NULL,
    hint_clue_text TEXT NOT NULL,
    popup_duration_ms INT DEFAULT 3500, -- Strictly 3.5 seconds
    revealed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hints_round ON tactical_hints(round_id);
CREATE INDEX IF NOT EXISTS idx_hints_player ON tactical_hints(player_id);

-- ----------------------------------------------------------------------------
-- 7. MATCH HISTORY & TELEMETRY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS match_history (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL REFERENCES game_rooms(id),
    player1_id VARCHAR(64) NOT NULL REFERENCES users(id),
    player2_id VARCHAR(64) NOT NULL REFERENCES users(id),
    winner_id VARCHAR(64) REFERENCES users(id),
    p1_score INT DEFAULT 0,
    p2_score INT DEFAULT 0,
    p1_rounds_won INT DEFAULT 0,
    p2_rounds_won INT DEFAULT 0,
    p1_elo_delta INT DEFAULT 0,
    p2_elo_delta INT DEFAULT 0,
    total_rounds_played INT DEFAULT 0,
    match_duration_seconds INT DEFAULT 0,
    match_type VARCHAR(16) DEFAULT 'MULTIPLAYER' CHECK (match_type IN ('MULTIPLAYER', 'BOT_DUEL', 'SOLO_PUZZLE')),
    finished_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_match_p1 ON match_history(player1_id);
CREATE INDEX IF NOT EXISTS idx_match_p2 ON match_history(player2_id);
CREATE INDEX IF NOT EXISTS idx_match_winner ON match_history(winner_id);
CREATE INDEX IF NOT EXISTS idx_match_date ON match_history(finished_at DESC);

-- ----------------------------------------------------------------------------
-- 8. COMPREHENSIVE LEXICON & ANAGRAM REPOSITORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dictionary_lexicon (
    word VARCHAR(16) PRIMARY KEY,
    length INT NOT NULL,
    difficulty VARCHAR(16) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    category VARCHAR(32) DEFAULT 'General',
    definition TEXT NOT NULL,
    lexical_clue TEXT,
    base_points INT DEFAULT 100,
    anagram_signature VARCHAR(16) NOT NULL, -- Alphabetically sorted letters (e.g. DEIT for TIED)
    total_times_used INT DEFAULT 0,
    total_times_solved INT DEFAULT 0,
    difficulty_rating NUMERIC(3, 2) DEFAULT 0.50
);

CREATE INDEX IF NOT EXISTS idx_lexicon_length ON dictionary_lexicon(length);
CREATE INDEX IF NOT EXISTS idx_lexicon_diff ON dictionary_lexicon(difficulty);
CREATE INDEX IF NOT EXISTS idx_lexicon_anagram ON dictionary_lexicon(anagram_signature);

-- ----------------------------------------------------------------------------
-- 9. LIVE CONCURRENCY & SESSION ANALYTICS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS live_session_telemetry (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    player_id VARCHAR(64) REFERENCES users(id),
    active_connections INT DEFAULT 1,
    active_rooms INT DEFAULT 0,
    event_type VARCHAR(32) NOT NULL,
    client_ip VARCHAR(45),
    user_agent TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telemetry_time ON live_session_telemetry(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_event ON live_session_telemetry(event_type);
