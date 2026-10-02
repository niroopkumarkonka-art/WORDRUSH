// ============================================================================
// WORDRUSH ARENA - Native C++ SQL Bridge & Persistence ORM Implementation
// ============================================================================

#include "sql_bridge.hpp"

namespace WordRush {

std::string SqlBridge::escapeSql(const std::string& input) {
    std::string safe = "";
    for (char c : input) {
        if (c == '\'') safe += "''";
        else if (c == '\\') safe += "\\\\";
        else safe += c;
    }
    return safe;
}

std::string SqlBridge::buildInsertUserSql(
    const std::string& id,
    const std::string& username,
    const std::string& avatar
) {
    std::ostringstream ss;
    ss << "INSERT INTO users (id, username, avatar) VALUES ('"
       << escapeSql(id) << "', '"
       << escapeSql(username) << "', '"
       << escapeSql(avatar) << "') "
       << "ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, avatar = EXCLUDED.avatar;";
    return ss.str();
}

std::string SqlBridge::buildUpsertRoomSql(
    const std::string& roomId,
    const std::string& roomCode,
    const std::string& hostId,
    const std::string& guestId,
    const std::string& status,
    int wordLength,
    int totalRounds
) {
    std::ostringstream ss;
    ss << "INSERT INTO game_rooms (id, room_code, host_player_id, guest_player_id, status, word_length, total_rounds) VALUES ('"
       << escapeSql(roomId) << "', '"
       << escapeSql(roomCode) << "', '"
       << escapeSql(hostId) << "', "
       << (guestId.empty() ? "NULL" : ("'" + escapeSql(guestId) + "'")) << ", '"
       << escapeSql(status) << "', "
       << wordLength << ", "
       << totalRounds << ") "
       << "ON CONFLICT (id) DO UPDATE SET "
       << "status = EXCLUDED.status, "
       << "guest_player_id = EXCLUDED.guest_player_id;";
    return ss.str();
}

std::string SqlBridge::buildInsertMatchHistorySql(const SqlMatchRecord& match) {
    std::ostringstream ss;
    ss << "INSERT INTO match_history ("
       << "id, room_id, player1_id, player2_id, winner_id, "
       << "p1_score, p2_score, p1_elo_delta, p2_elo_delta, "
       << "match_duration_seconds, match_type"
       << ") VALUES ("
       << "'match_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12), '"
       << escapeSql(match.roomId) << "', '"
       << escapeSql(match.player1Id) << "', '"
       << escapeSql(match.player2Id) << "', '"
       << escapeSql(match.winnerId) << "', "
       << match.p1Score << ", "
       << match.p2Score << ", "
       << match.p1EloDelta << ", "
       << match.p2EloDelta << ", "
       << match.durationSec << ", '"
       << escapeSql(match.matchType) << "');";
    return ss.str();
}

std::string SqlBridge::buildInsertGuessSql(
    const std::string& roundId,
    const std::string& playerId,
    int attemptNum,
    const DeductionResult& deduction,
    int elapsedMs
) {
    std::ostringstream ss;
    ss << "INSERT INTO round_guesses ("
       << "id, round_id, player_id, attempt_number, guess_word, evaluation_states, is_exact_match, time_taken_ms"
       << ") VALUES ("
       << "'guess_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12), '"
       << escapeSql(roundId) << "', '"
       << escapeSql(playerId) << "', "
       << attemptNum << ", '"
       << escapeSql(deduction.guess) << "', '";

    for (size_t i = 0; i < deduction.states.size(); ++i) {
        ss << static_cast<int>(deduction.states[i]);
        if (i + 1 < deduction.states.size()) ss << ",";
    }

    ss << "', "
       << (deduction.isExactMatch ? "TRUE" : "FALSE") << ", "
       << elapsedMs << ");";
    return ss.str();
}

std::string SqlBridge::buildBatchTransactionSql(const std::vector<std::string>& statements) {
    std::ostringstream ss;
    ss << "BEGIN TRANSACTION;\n";
    for (const auto& stmt : statements) {
        ss << stmt << "\n";
    }
    ss << "COMMIT;\n";
    return ss.str();
}

} // namespace WordRush
