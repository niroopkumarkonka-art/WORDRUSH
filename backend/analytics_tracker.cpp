// ============================================================================
// WORDRUSH ARENA - Real-Time Analytics & Telemetry Engine Implementation
// ============================================================================

#include "analytics_tracker.hpp"
#include <numeric>
#include <algorithm>

namespace WordRush {

AnalyticsTracker::AnalyticsTracker()
    : liveActiveConnections(1), liveActiveRooms(0), matchCounter(0), guessCounter(0) {
    guessDistribution.fill(0);
}

void AnalyticsTracker::onPlayerConnected() {
    liveActiveConnections++;
}

void AnalyticsTracker::onPlayerDisconnected() {
    if (liveActiveConnections > 1) {
        liveActiveConnections--;
    }
}

void AnalyticsTracker::setLiveConnections(int count) {
    liveActiveConnections = std::max(1, count);
}

void AnalyticsTracker::onRoomCreated() {
    liveActiveRooms++;
}

void AnalyticsTracker::onRoomDestroyed() {
    if (liveActiveRooms > 0) {
        liveActiveRooms--;
    }
}

void AnalyticsTracker::recordCompletedRound(int attemptsUsed, bool wordFound, const std::string& secretWord) {
    matchCounter++;
    guessCounter += attemptsUsed;

    if (wordFound && attemptsUsed >= 1 && attemptsUsed <= 6) {
        guessDistribution[attemptsUsed - 1]++;
    }

    wordAttemptCounts[secretWord] += attemptsUsed;
    if (wordFound) {
        wordSolveCounts[secretWord]++;
    }
}

SessionMetricSnapshot AnalyticsTracker::getSnapshot() const {
    SessionMetricSnapshot s;
    s.activeConnections = liveActiveConnections;
    s.activeRooms = liveActiveRooms;
    s.totalMatchesToday = matchCounter;
    s.totalGuessesToday = guessCounter;
    s.attemptHistogram = guessDistribution;

    int totalSolved = std::accumulate(guessDistribution.begin(), guessDistribution.end(), 0);
    if (totalSolved > 0) {
        double weightedSum = 0.0;
        for (int i = 0; i < 6; ++i) {
            weightedSum += (i + 1) * guessDistribution[i];
        }
        s.avgAttemptsToSolve = weightedSum / totalSolved;
    } else {
        s.avgAttemptsToSolve = 0.0;
    }

    return s;
}

} // namespace WordRush
