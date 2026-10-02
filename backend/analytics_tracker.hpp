#ifndef WORDRUSH_ANALYTICS_TRACKER_HPP
#define WORDRUSH_ANALYTICS_TRACKER_HPP

// ============================================================================
// WORDRUSH ARENA - Real-Time Analytics & Telemetry Engine
// Tracks active players, concurrent rooms, attempt distribution histograms,
// and round duration telemetry
// ============================================================================

#include <string>
#include <vector>
#include <unordered_map>
#include <array>
#include <chrono>

namespace WordRush {

struct SessionMetricSnapshot {
    int activeConnections;
    int activeRooms;
    int totalMatchesToday;
    int totalGuessesToday;
    double avgAttemptsToSolve;
    std::array<int, 6> attemptHistogram;
};

class AnalyticsTracker {
private:
    int liveActiveConnections;
    int liveActiveRooms;
    int matchCounter;
    int guessCounter;
    std::array<int, 6> guessDistribution;
    std::unordered_map<std::string, int> wordAttemptCounts;
    std::unordered_map<std::string, int> wordSolveCounts;

public:
    AnalyticsTracker();

    void onPlayerConnected();
    void onPlayerDisconnected();
    void setLiveConnections(int count);

    void onRoomCreated();
    void onRoomDestroyed();

    void recordCompletedRound(int attemptsUsed, bool wordFound, const std::string& secretWord);

    SessionMetricSnapshot getSnapshot() const;
    int getActiveUsersCount() const { return liveActiveConnections; }
};

} // namespace WordRush

#endif // WORDRUSH_ANALYTICS_TRACKER_HPP
