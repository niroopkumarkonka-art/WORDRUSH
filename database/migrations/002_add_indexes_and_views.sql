-- ============================================================================
-- Migration 002: Add Performance Indexes, Foreign Keys & Analytic Views
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_profiles_elo ON user_profiles(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON game_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_rounds_room ON game_rounds(room_id);
CREATE INDEX IF NOT EXISTS idx_guesses_round ON round_guesses(round_id);

CREATE TABLE IF NOT EXISTS tactical_hints (
    id VARCHAR(64) PRIMARY KEY,
    round_id VARCHAR(64) NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
    player_id VARCHAR(64) NOT NULL REFERENCES users(id),
    hint_level INT NOT NULL,
    hint_title VARCHAR(64) NOT NULL,
    hint_clue_text TEXT NOT NULL,
    popup_duration_ms INT DEFAULT 3500,
    revealed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_history (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL REFERENCES game_rooms(id),
    player1_id VARCHAR(64) NOT NULL REFERENCES users(id),
    player2_id VARCHAR(64) NOT NULL REFERENCES users(id),
    winner_id VARCHAR(64) REFERENCES users(id),
    p1_score INT DEFAULT 0,
    p2_score INT DEFAULT 0,
    p1_elo_delta INT DEFAULT 0,
    p2_elo_delta INT DEFAULT 0,
    finished_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW v_leaderboard_summary AS
SELECT 
    RANK() OVER (ORDER BY p.elo_rating DESC) as rank,
    u.username,
    u.avatar,
    p.elo_rating,
    p.total_wins,
    p.total_games,
    p.total_points
FROM user_profiles p
JOIN users u ON p.user_id = u.id
WHERE u.is_bot = FALSE;
