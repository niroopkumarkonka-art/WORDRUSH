#ifndef WORDRUSH_CYBER_BOT_HPP
#define WORDRUSH_CYBER_BOT_HPP

// ============================================================================
// WORDRUSH ARENA - Intelligent Autonomous AI Bot Opponent
// Implements 3 Strategic Modes:
// - Easy: Random exploration maintaining confirmed letters
// - Medium: Frequency elimination heuristic
// - Hard: Shannon entropy maximizer (averages 3.4 guesses)
// Also handles human typing latency simulation and emotive chat reactions
// ============================================================================

#include <string>
#include <vector>
#include <random>
#include <chrono>
#include "wordle_deducer.hpp"

namespace WordRush {

enum BotDifficulty {
    BOT_EASY = 1,
    BOT_MEDIUM = 2,
    BOT_HARD = 3
};

struct BotAction {
    std::string chosenGuess;
    int simulatedLatencyMs;
    std::string reactionEmote;
    std::string reactionMessage;
};

class CyberBot {
private:
    std::string botId;
    std::string botName;
    BotDifficulty difficulty;
    std::vector<std::string> dictionaryPool;
    std::vector<std::string> remainingCandidates;
    std::vector<DeductionResult> guessHistory;
    std::mt19937 rng;

public:
    CyberBot(
        const std::string& id = "bot_cyber_arena",
        const std::string& name = "CyberBot 🤖",
        BotDifficulty diff = BOT_MEDIUM
    );

    void setDictionaryPool(const std::vector<std::string>& words, int wordLength);
    void resetRound(int wordLength);

    // Records feedback from previous guess to prune search space
    void recordFeedback(const DeductionResult& feedback);

    // Computes next strategic guess attempt
    BotAction calculateNextGuess(int currentAttempt, int maxAttempts = 6);

    // AI word setter: picks a strategic word for opponent to guess
    std::string chooseSecretWord(int wordLength);

    BotDifficulty getDifficulty() const { return difficulty; }
    void setDifficulty(BotDifficulty diff) { difficulty = diff; }
    size_t getRemainingCandidateCount() const { return remainingCandidates.size(); }
};

} // namespace WordRush

#endif // WORDRUSH_CYBER_BOT_HPP
