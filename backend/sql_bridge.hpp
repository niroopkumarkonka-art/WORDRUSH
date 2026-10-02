#ifndef WORDRUSH_SQL_BRIDGE_HPP
#define WORDRUSH_SQL_BRIDGE_HPP

// ============================================================================
// WORDRUSH ARENA - Native C++ SQL Bridge & Persistence ORM
// Compiles in-memory room structures, player telemetry, and match outcomes
// into standardized SQL statements for relational database persistence
// ============================================================================

#include <string>
#include <vector>
#include <sstream>
#include "wordle_deducer.hpp"

namespace WordRush {

struct SqlPlayerRecord {
    std::string id;
    std::string username;
    std::string avatar;
    int score;
    int elo;
};

struct SqlMatchRecord {
    std::string roomId;
    std::string roomCode;
    std::string player1Id;
    std::string player2Id;
    std::string winnerId;
    int p1Score;
    int p2Score;
    int p1EloDelta;
    int p2EloDelta;
    int durationSec;
    std::string matchType;
};

class SqlBridge {
public:
    static std::string escapeSql(const std::string& input);

    // Generate INSERT statement for User registration
    static std::string buildInsertUserSql(
        const std::string& id,
        const std::string& username,
        const std::string& avatar
    );

    // Generate INSERT/UPDATE statement for Game Room state
    static std::string buildUpsertRoomSql(
        const std::string& roomId,
        const std::string& roomCode,
        const std::string& hostId,
        const std::string& guestId,
        const std::string& status,
        int wordLength,
        int totalRounds
    );

    // Generate INSERT statement for Match History
    static std::string buildInsertMatchHistorySql(const SqlMatchRecord& match);

    // Generate INSERT statement for Wordle Guess evaluation
    static std::string buildInsertGuessSql(
        const std::string& roundId,
        const std::string& playerId,
        int attemptNum,
        const DeductionResult& deduction,
        int elapsedMs
    );

    // Generate batch migration transaction string
    static std::string buildBatchTransactionSql(const std::vector<std::string>& statements);
};

} // namespace WordRush

#endif // WORDRUSH_SQL_BRIDGE_HPP
