// ============================================================================
// WORDRUSH ARENA - Competitive Matchmaking & Elo Rating Implementation
// ============================================================================

#include "elo_system.hpp"

namespace WordRush {

TierRank EloSystem::getTier(int elo) {
    if (elo >= 2200) return TIER_MASTER;
    if (elo >= 1900) return TIER_DIAMOND;
    if (elo >= 1600) return TIER_PLATINUM;
    if (elo >= 1350) return TIER_GOLD;
    if (elo >= 1100) return TIER_SILVER;
    return TIER_BRONZE;
}

std::string EloSystem::getTierName(TierRank tier) {
    switch (tier) {
        case TIER_MASTER: return "Grandmaster";
        case TIER_DIAMOND: return "Diamond";
        case TIER_PLATINUM: return "Platinum";
        case TIER_GOLD: return "Gold";
        case TIER_SILVER: return "Silver";
        default: return "Bronze";
    }
}

int EloSystem::calculateKFactor(int gamesPlayed, int currentStreak) {
    // Placement phase (< 30 matches): high calibration K=40
    if (gamesPlayed < 30) return 40;

    // Experienced players: standard K=24, with streak accelerator
    int k = 24;
    if (currentStreak >= 5) k += 8;
    if (currentStreak >= 10) k += 12;
    return k;
}

double EloSystem::computeExpectedScore(int eloA, int eloB) {
    return 1.0 / (1.0 + std::pow(10.0, static_cast<double>(eloB - eloA) / 400.0));
}

EloChangeResult EloSystem::calculateMatchResult(
    int eloP1, int gamesP1, int streakP1,
    int eloP2, int gamesP2, int streakP2,
    double outcome
) {
    EloChangeResult result;
    result.oldEloP1 = eloP1;
    result.oldEloP2 = eloP2;

    result.expectedScoreP1 = computeExpectedScore(eloP1, eloP2);
    result.expectedScoreP2 = computeExpectedScore(eloP2, eloP1);

    int k1 = calculateKFactor(gamesP1, streakP1);
    int k2 = calculateKFactor(gamesP2, streakP2);

    double actualP1 = outcome;
    double actualP2 = 1.0 - outcome;

    result.deltaP1 = static_cast<int>(std::round(k1 * (actualP1 - result.expectedScoreP1)));
    result.deltaP2 = static_cast<int>(std::round(k2 * (actualP2 - result.expectedScoreP2)));

    result.newEloP1 = std::max(100, eloP1 + result.deltaP1);
    result.newEloP2 = std::max(100, eloP2 + result.deltaP2);

    return result;
}

MatchmakerQueue::MatchmakerQueue(int baseWindow, int rate)
    : baseSearchWindow(baseWindow), expansionRatePerSecond(rate) {}

void MatchmakerQueue::addTicket(const MatchmakingTicket& ticket) {
    queue.push_back(ticket);
}

bool MatchmakerQueue::removeTicket(const std::string& ticketId) {
    auto it = std::remove_if(queue.begin(), queue.end(), [&](const MatchmakingTicket& t) {
        return t.ticketId == ticketId;
    });
    if (it != queue.end()) {
        queue.erase(it, queue.end());
        return true;
    }
    return false;
}

std::vector<std::pair<MatchmakingTicket, MatchmakingTicket>> MatchmakerQueue::findMatches() {
    std::vector<std::pair<MatchmakingTicket, MatchmakingTicket>> pairings;
    if (queue.size() < 2) return pairings;

    auto now = std::chrono::steady_clock::now();
    std::vector<bool> matched(queue.size(), false);

    for (size_t i = 0; i < queue.size(); ++i) {
        if (matched[i]) continue;

        auto waitSec = std::chrono::duration_cast<std::chrono::seconds>(now - queue[i].createdAt).count();
        int expandedWindow = baseSearchWindow + static_cast<int>(waitSec) * expansionRatePerSecond;

        for (size_t j = i + 1; j < queue.size(); ++j) {
            if (matched[j]) continue;

            // Check word length compatibility
            if (queue[i].preferredWordLength != queue[j].preferredWordLength) continue;

            // Check Elo difference within expanded tolerance
            int eloDiff = std::abs(queue[i].player.elo - queue[j].player.elo);
            if (eloDiff <= expandedWindow) {
                pairings.push_back({queue[i], queue[j]});
                matched[i] = true;
                matched[j] = true;
                break;
            }
        }
    }

    // Remove matched tickets
    std::vector<MatchmakingTicket> remaining;
    for (size_t i = 0; i < queue.size(); ++i) {
        if (!matched[i]) remaining.push_back(queue[i]);
    }
    queue = std::move(remaining);

    return pairings;
}

} // namespace WordRush
