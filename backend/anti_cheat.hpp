#ifndef WORDRUSH_ANTI_CHEAT_HPP
#define WORDRUSH_ANTI_CHEAT_HPP

// ============================================================================
// WORDRUSH ARENA - Enterprise Anti-Cheat & Telemetry Verification Engine
// Analyzes keystroke inter-arrival intervals, detects automated macro injection,
// enforces token-bucket rate limits, and flags word frequency scraping
// ============================================================================

#include <string>
#include <vector>
#include <chrono>
#include <unordered_map>
#include <numeric>
#include <cmath>

namespace WordRush {

struct KeystrokeSample {
    char letter;
    int64_t timestampMs;
};

struct CheatViolation {
    std::string playerId;
    std::string violationType;
    std::string details;
    int riskScore; // 0 to 100
    int64_t timestamp;
};

class TokenBucketLimiter {
private:
    double tokens;
    double maxCapacity;
    double refillRatePerSec;
    std::chrono::steady_clock::time_point lastRefillTime;

public:
    TokenBucketLimiter(double capacity = 10.0, double refillRate = 2.0);
    bool tryConsume(double amount = 1.0);
};

class AntiCheatEngine {
private:
    std::unordered_map<std::string, TokenBucketLimiter> playerLimiters;
    std::unordered_map<std::string, std::vector<KeystrokeSample>> keystrokeBuffers;
    std::vector<CheatViolation> violationLog;

public:
    AntiCheatEngine() = default;

    // Checks if player is sending requests at superhuman speed (Token Bucket)
    bool checkRateLimit(const std::string& playerId);

    // Records a typed keystroke telemetry sample
    void recordKeystroke(const std::string& playerId, char letter, int64_t timestampMs);

    // Analyzes keystroke timing distribution for macro/script patterns
    // Human typing has standard variance (sigma > 20ms). Injected macros have sigma < 2ms.
    bool analyzeKeystrokeJitter(const std::string& playerId, CheatViolation& outViolation);

    // Flags suspicious immediate full-word paste events
    bool detectInstantSubmission(const std::string& playerId, int wordLength, int totalTimeMs);

    const std::vector<CheatViolation>& getViolations() const { return violationLog; }
    void clearBuffer(const std::string& playerId);
};

} // namespace WordRush

#endif // WORDRUSH_ANTI_CHEAT_HPP
