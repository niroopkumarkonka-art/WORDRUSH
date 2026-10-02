#ifndef WORDRUSH_ELO_SYSTEM_HPP
#define WORDRUSH_ELO_SYSTEM_HPP

// ============================================================================
// WORDRUSH ARENA - Competitive Matchmaking & Elo Rating System
// Implements dynamic K-factor Elo calculations, skill-based matchmaking queue,
// tier ranks (Bronze, Silver, Gold, Platinum, Diamond, Master), and streak bonuses
// ============================================================================

#include <string>
#include <vector>
#include <queue>
#include <chrono>
#include <cmath>
#include <algorithm>

namespace WordRush {

enum TierRank {
    TIER_BRONZE = 0,
    TIER_SILVER = 1,
    TIER_GOLD = 2,
    TIER_PLATINUM = 3,
    TIER_DIAMOND = 4,
    TIER_MASTER = 5
};

struct PlayerRating {
    std::string playerId;
    std::string username;
    int elo;
    int peakElo;
    int gamesPlayed;
    int wins;
    int losses;
    int draws;
    int streak;
    int highestStreak;
    int totalPoints;
    std::chrono::system_clock::time_point queuedAt;
};

struct MatchmakingTicket {
    std::string ticketId;
    PlayerRating player;
    int preferredWordLength;
    int preferredRounds;
    int searchWindowElo;
    std::chrono::steady_clock::time_point createdAt;
};

struct EloChangeResult {
    int oldEloP1;
    int newEloP1;
    int deltaP1;
    int oldEloP2;
    int newEloP2;
    int deltaP2;
    double expectedScoreP1;
    double expectedScoreP2;
};

class EloSystem {
public:
    // Determine skill tier rank based on Elo
    static TierRank getTier(int elo);
    static std::string getTierName(TierRank tier);

    // Calculate dynamic K-factor based on match count and streak
    static int calculateKFactor(int gamesPlayed, int currentStreak);

    // Compute expected win probability for player A against player B
    static double computeExpectedScore(int eloA, int eloB);

    // Process 1v1 match outcome and calculate rating adjustments
    // outcome: 1.0 = P1 win, 0.0 = P2 win, 0.5 = Draw
    static EloChangeResult calculateMatchResult(
        int eloP1, int gamesP1, int streakP1,
        int eloP2, int gamesP2, int streakP2,
        double outcome
    );
};

class MatchmakerQueue {
private:
    std::vector<MatchmakingTicket> queue;
    int baseSearchWindow;
    int expansionRatePerSecond;

public:
    MatchmakerQueue(int baseWindow = 100, int rate = 25);

    void addTicket(const MatchmakingTicket& ticket);
    bool removeTicket(const std::string& ticketId);

    // Try finding compatible match pairings
    std::vector<std::pair<MatchmakingTicket, MatchmakingTicket>> findMatches();

    size_t size() const { return queue.size(); }
    void clear() { queue.clear(); }
};

} // namespace WordRush

#endif // WORDRUSH_ELO_SYSTEM_HPP
