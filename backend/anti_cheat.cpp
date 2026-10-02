// ============================================================================
// WORDRUSH ARENA - Enterprise Anti-Cheat & Telemetry Implementation
// ============================================================================

#include "anti_cheat.hpp"

namespace WordRush {

TokenBucketLimiter::TokenBucketLimiter(double capacity, double refillRate)
    : tokens(capacity), maxCapacity(capacity), refillRatePerSec(refillRate),
      lastRefillTime(std::chrono::steady_clock::now()) {}

bool TokenBucketLimiter::tryConsume(double amount) {
    auto now = std::chrono::steady_clock::now();
    double elapsedSec = std::chrono::duration_cast<std::chrono::duration<double>>(now - lastRefillTime).count();
    lastRefillTime = now;

    // Refill tokens
    tokens = std::min(maxCapacity, tokens + elapsedSec * refillRatePerSec);

    if (tokens >= amount) {
        tokens -= amount;
        return true;
    }
    return false;
}

bool AntiCheatEngine::checkRateLimit(const std::string& playerId) {
    if (playerLimiters.find(playerId) == playerLimiters.end()) {
        playerLimiters[playerId] = TokenBucketLimiter(12.0, 3.0); // 12 token burst, 3/sec refill
    }
    return playerLimiters[playerId].tryConsume(1.0);
}

void AntiCheatEngine::recordKeystroke(const std::string& playerId, char letter, int64_t timestampMs) {
    keystrokeBuffers[playerId].push_back({letter, timestampMs});
    if (keystrokeBuffers[playerId].size() > 50) {
        keystrokeBuffers[playerId].erase(keystrokeBuffers[playerId].begin());
    }
}

bool AntiCheatEngine::analyzeKeystrokeJitter(const std::string& playerId, CheatViolation& outViolation) {
    auto it = keystrokeBuffers.find(playerId);
    if (it == keystrokeBuffers.end() || it->second.size() < 5) return false;

    const auto& samples = it->second;
    std::vector<double> intervals;
    intervals.reserve(samples.size() - 1);

    for (size_t i = 1; i < samples.size(); ++i) {
        double delta = static_cast<double>(samples[i].timestampMs - samples[i - 1].timestampMs);
        if (delta > 0.0) intervals.push_back(delta);
    }

    if (intervals.size() < 4) return false;

    // Calculate mean
    double sum = std::accumulate(intervals.begin(), intervals.end(), 0.0);
    double mean = sum / intervals.size();

    // Calculate standard deviation (variance)
    double varSum = 0.0;
    for (double val : intervals) {
        varSum += (val - mean) * (val - mean);
    }
    double stdDev = std::sqrt(varSum / intervals.size());

    // Suspiciously perfect mechanical intervals (e.g. macro bot injecting letters at fixed 50ms)
    if (stdDev < 3.5 && mean < 120.0) {
        outViolation.playerId = playerId;
        outViolation.violationType = "HARDWARE_MACRO_INJECTION";
        outViolation.details = "Keystroke jitter standard deviation is unnaturally low (" + 
                               std::to_string(stdDev) + "ms). Automated macro suspected.";
        outViolation.riskScore = 85;
        outViolation.timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();
        violationLog.push_back(outViolation);
        return true;
    }

    return false;
}

bool AntiCheatEngine::detectInstantSubmission(const std::string& playerId, int wordLength, int totalTimeMs) {
    // 5-letter word submitted in under 80ms is physically impossible for human typing
    if (wordLength >= 4 && totalTimeMs < 80) {
        CheatViolation viol;
        viol.playerId = playerId;
        viol.violationType = "INSTANT_WORD_INJECTION";
        viol.details = "Submitted " + std::to_string(wordLength) + "-letter word in " +
                       std::to_string(totalTimeMs) + "ms. Paste/injection detected.";
        viol.riskScore = 90;
        viol.timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();
        violationLog.push_back(viol);
        return true;
    }
    return false;
}

void AntiCheatEngine::clearBuffer(const std::string& playerId) {
    keystrokeBuffers.erase(playerId);
}

} // namespace WordRush
