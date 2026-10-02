-- ============================================================================
-- WORDRUSH ARENA - Production SQL Analytical Queries, Views & Procedures
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VIEW 1: GLOBAL PLAYER LEADERBOARD (RANKED BY ELO & WIN RATE)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_global_leaderboard AS
SELECT 
    DENSE_RANK() OVER (ORDER BY p.elo_rating DESC, p.total_wins DESC) AS rank_position,
    u.id AS user_id,
    u.username,
    u.avatar,
    p.elo_rating,
    p.peak_elo,
    p.total_games,
    p.total_wins,
    p.total_losses,
    ROUND((p.total_wins::NUMERIC / NULLIF(p.total_games, 0)) * 100, 1) AS win_rate_percent,
    p.current_streak,
    p.best_streak,
    p.total_points,
    p.words_decrypted,
    p.exact_anagrams_found,
    p.avg_attempts_per_round,
    p.fastest_win_seconds,
    p.last_played_at
FROM user_profiles p
JOIN users u ON p.user_id = u.id
WHERE u.is_bot = FALSE
ORDER BY p.elo_rating DESC, p.total_wins DESC;

-- ----------------------------------------------------------------------------
-- VIEW 2: ACTIVE ARENA ROOMS & REAL-TIME STATUS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_active_arena_rooms AS
SELECT 
    r.id AS room_id,
    r.room_code,
    r.status,
    r.word_length,
    r.total_rounds,
    r.current_round_index + 1 AS current_round_number,
    h.username AS host_username,
    h.avatar AS host_avatar,
    g.username AS guest_username,
    g.avatar AS guest_avatar,
    r.is_bot_match,
    r.spectator_count,
    ROUND(EXTRACT(EPOCH FROM (NOW() - r.created_at))) AS room_age_seconds
FROM game_rooms r
JOIN users h ON r.host_player_id = h.id
LEFT JOIN users g ON r.guest_player_id = g.id
WHERE r.status IN ('LOBBY', 'PLAYING', 'ROUND_PAUSE')
ORDER BY r.created_at DESC;

-- ----------------------------------------------------------------------------
-- VIEW 3: HARDEST WORDS & CIPHER COMPLEXITY BENCHMARKS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_hardest_cipher_words AS
SELECT 
    l.word,
    l.length,
    l.difficulty,
    l.category,
    COUNT(g.id) AS total_guesses_against,
    COUNT(DISTINCT r.id) AS rounds_featured_in,
    ROUND(AVG(r.attempts_used), 2) AS avg_attempts_to_solve,
    SUM(CASE WHEN r.is_word_found THEN 1 ELSE 0 END) AS times_solved,
    SUM(CASE WHEN NOT r.is_word_found THEN 1 ELSE 0 END) AS times_unsolved,
    ROUND(
        (SUM(CASE WHEN r.is_word_found THEN 0 ELSE 1 END)::NUMERIC / 
        NULLIF(COUNT(r.id), 0)) * 100, 1
    ) AS fail_rate_percent
FROM dictionary_lexicon l
LEFT JOIN game_rounds r ON l.word = r.secret_word AND r.is_completed = TRUE
LEFT JOIN round_guesses g ON r.id = g.round_id
GROUP BY l.word, l.length, l.difficulty, l.category
HAVING COUNT(r.id) > 0
ORDER BY fail_rate_percent DESC, avg_attempts_to_solve DESC;

-- ----------------------------------------------------------------------------
-- VIEW 4: PLAYER CAREER PERFORMANCE TIMELINE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_player_career_performance AS
SELECT 
    u.id AS player_id,
    u.username,
    m.id AS match_id,
    m.room_id,
    CASE WHEN m.winner_id = u.id THEN 'VICTORY' ELSE 'DEFEAT' END AS match_outcome,
    CASE WHEN m.player1_id = u.id THEN m.p1_score ELSE m.p2_score END AS player_score,
    CASE WHEN m.player1_id = u.id THEN m.p2_score ELSE m.p1_score END AS opponent_score,
    CASE WHEN m.player1_id = u.id THEN m.p1_elo_delta ELSE m.p2_elo_delta END AS elo_change,
    m.total_rounds_played,
    m.match_duration_seconds,
    m.match_type,
    m.finished_at
FROM users u
JOIN match_history m ON u.id = m.player1_id OR u.id = m.player2_id
ORDER BY m.finished_at DESC;

-- ----------------------------------------------------------------------------
-- PROCEDURE 1: RECORD MATCH RESULT & UPDATE ELO DYNAMICS
-- ----------------------------------------------------------------------------
-- Updates win/loss tallies, streaks, and calculates Elo rating changes
CREATE OR REPLACE FUNCTION record_match_completion(
    p_room_id VARCHAR(64),
    p_winner_id VARCHAR(64),
    p_p1_score INT,
    p_p2_score INT,
    p_duration_sec INT
) RETURNS VOID AS $$
DECLARE
    v_p1_id VARCHAR(64);
    v_p2_id VARCHAR(64);
    v_p1_elo INT;
    v_p2_elo INT;
    v_k_factor INT := 32;
    v_p1_expected NUMERIC;
    v_p2_expected NUMERIC;
    v_p1_actual NUMERIC;
    v_p2_actual NUMERIC;
    v_p1_delta INT;
    v_p2_delta INT;
BEGIN
    -- Fetch players from room
    SELECT host_player_id, guest_player_id 
    INTO v_p1_id, v_p2_id 
    FROM game_rooms 
    WHERE id = p_room_id;

    IF v_p1_id IS NULL OR v_p2_id IS NULL THEN
        RAISE EXCEPTION 'Room % does not have both players.', p_room_id;
    END IF;

    -- Fetch current ratings
    SELECT elo_rating INTO v_p1_elo FROM user_profiles WHERE user_id = v_p1_id;
    SELECT elo_rating INTO v_p2_elo FROM user_profiles WHERE user_id = v_p2_id;

    -- Default if missing
    v_p1_elo := COALESCE(v_p1_elo, 1200);
    v_p2_elo := COALESCE(v_p2_elo, 1200);

    -- Expected scores formula
    v_p1_expected := 1.0 / (1.0 + POWER(10.0, (v_p2_elo - v_p1_elo) / 400.0));
    v_p2_expected := 1.0 / (1.0 + POWER(10.0, (v_p1_elo - v_p2_elo) / 400.0));

    -- Actual scores
    IF p_winner_id = v_p1_id THEN
        v_p1_actual := 1.0;
        v_p2_actual := 0.0;
    ELSIF p_winner_id = v_p2_id THEN
        v_p1_actual := 0.0;
        v_p2_actual := 1.0;
    ELSE
        v_p1_actual := 0.5;
        v_p2_actual := 0.5;
    END IF;

    -- Calculate Delta
    v_p1_delta := ROUND(v_k_factor * (v_p1_actual - v_p1_expected));
    v_p2_delta := ROUND(v_k_factor * (v_p2_actual - v_p2_expected));

    -- Update Player 1
    UPDATE user_profiles
    SET 
        elo_rating = GREATEST(100, elo_rating + v_p1_delta),
        peak_elo = GREATEST(peak_elo, elo_rating + v_p1_delta),
        total_games = total_games + 1,
        total_wins = total_wins + CASE WHEN v_p1_actual = 1.0 THEN 1 ELSE 0 END,
        total_losses = total_losses + CASE WHEN v_p1_actual = 0.0 THEN 1 ELSE 0 END,
        total_draws = total_draws + CASE WHEN v_p1_actual = 0.5 THEN 1 ELSE 0 END,
        current_streak = CASE WHEN v_p1_actual = 1.0 THEN current_streak + 1 ELSE 0 END,
        best_streak = GREATEST(best_streak, CASE WHEN v_p1_actual = 1.0 THEN current_streak + 1 ELSE best_streak END),
        total_points = total_points + p_p1_score,
        last_played_at = NOW()
    WHERE user_id = v_p1_id;

    -- Update Player 2
    UPDATE user_profiles
    SET 
        elo_rating = GREATEST(100, elo_rating + v_p2_delta),
        peak_elo = GREATEST(peak_elo, elo_rating + v_p2_delta),
        total_games = total_games + 1,
        total_wins = total_wins + CASE WHEN v_p2_actual = 1.0 THEN 1 ELSE 0 END,
        total_losses = total_losses + CASE WHEN v_p2_actual = 0.0 THEN 1 ELSE 0 END,
        total_draws = total_draws + CASE WHEN v_p2_actual = 0.5 THEN 1 ELSE 0 END,
        current_streak = CASE WHEN v_p2_actual = 1.0 THEN current_streak + 1 ELSE 0 END,
        best_streak = GREATEST(best_streak, CASE WHEN v_p2_actual = 1.0 THEN current_streak + 1 ELSE best_streak END),
        total_points = total_points + p_p2_score,
        last_played_at = NOW()
    WHERE user_id = v_p2_id;

    -- Insert Match History Log
    INSERT INTO match_history (
        id, room_id, player1_id, player2_id, winner_id,
        p1_score, p2_score, p1_elo_delta, p2_elo_delta,
        match_duration_seconds, match_type, finished_at
    ) VALUES (
        'match_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12),
        p_room_id, v_p1_id, v_p2_id, p_winner_id,
        p_p1_score, p_p2_score, v_p1_delta, v_p2_delta,
        p_duration_sec, 'MULTIPLAYER', NOW()
    );

    -- Mark Game Room Finished
    UPDATE game_rooms
    SET status = 'FINISHED', winner_player_id = p_winner_id, finished_at = NOW()
    WHERE id = p_room_id;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- QUERY 1: REAL-TIME CONCURRENCY TELEMETRY SUMMARY
-- ----------------------------------------------------------------------------
-- Returns current active player count, active duel rooms, and today's total matches
SELECT 
    (SELECT COUNT(*) FROM game_rooms WHERE status IN ('LOBBY', 'PLAYING')) AS live_active_rooms,
    (SELECT COUNT(DISTINCT player_id) FROM live_session_telemetry WHERE recorded_at >= NOW() - INTERVAL '5 minutes') AS concurrent_users_5m,
    (SELECT COUNT(*) FROM match_history WHERE finished_at >= CURRENT_DATE) AS matches_completed_today,
    (SELECT COUNT(*) FROM round_guesses WHERE created_at >= CURRENT_DATE) AS total_guesses_submitted_today;
