// ============================================================================
// WORDRUSH ARENA - Intelligent Autonomous AI Bot Opponent Implementation
// ============================================================================

#include "cyber_bot.hpp"
#include <algorithm>
#include <unordered_set>
#include <unordered_map>

namespace WordRush {

CyberBot::CyberBot(const std::string& id, const std::string& name, BotDifficulty diff)
    : botId(id), botName(name), difficulty(diff) {
    rng.seed(std::random_device{}());
}

void CyberBot::setDictionaryPool(const std::vector<std::string>& words, int wordLength) {
    dictionaryPool.clear();
    for (const auto& w : words) {
        if (static_cast<int>(w.length()) == wordLength) {
            dictionaryPool.push_back(w);
        }
    }
    resetRound(wordLength);
}

void CyberBot::resetRound(int wordLength) {
    remainingCandidates = dictionaryPool;
    guessHistory.clear();
}

void CyberBot::recordFeedback(const DeductionResult& feedback) {
    guessHistory.push_back(feedback);

    // Filter remaining candidate words consistent with feedback
    std::vector<std::string> nextCandidates;
    nextCandidates.reserve(remainingCandidates.size());

    for (const auto& cand : remainingCandidates) {
        if (WordleDeducer::isConsistentWithHistory(cand, guessHistory)) {
            nextCandidates.push_back(cand);
        }
    }
    remainingCandidates = std::move(nextCandidates);
}

BotAction CyberBot::calculateNextGuess(int currentAttempt, int maxAttempts) {
    BotAction action;

    // Simulate realistic typing latencies: 1000ms to 2400ms
    std::uniform_int_distribution<int> latencyDist(1100, 2300);
    action.simulatedLatencyMs = latencyDist(rng);

    if (remainingCandidates.empty()) {
        action.chosenGuess = dictionaryPool.empty() ? "ARENA" : dictionaryPool[0];
        action.reactionEmote = "🤔";
        action.reactionMessage = "Recalibrating lexical matrix...";
        return action;
    }

    // 1. First Attempt: Classic optimal openers
    if (currentAttempt == 1) {
        std::vector<std::string> openers = {"CRANE", "SLATE", "AUDIO", "SOARE", "ROAST", "TRAIN"};
        std::vector<std::string> validOpeners;
        for (const auto& op : openers) {
            if (std::find(dictionaryPool.begin(), dictionaryPool.end(), op) != dictionaryPool.end()) {
                validOpeners.push_back(op);
            }
        }
        if (!validOpeners.empty()) {
            std::uniform_int_distribution<size_t> d(0, validOpeners.size() - 1);
            action.chosenGuess = validOpeners[d(rng)];
            action.reactionEmote = "⚔️";
            action.reactionMessage = "Let the cipher duel begin!";
            return action;
        }
    }

    // 2. Single candidate remaining: solve directly
    if (remainingCandidates.size() == 1) {
        action.chosenGuess = remainingCandidates[0];
        action.reactionEmote = "⚡";
        action.reactionMessage = "Cipher solved! Target locked.";
        return action;
    }

    // 3. Selection based on difficulty
    if (difficulty == BOT_EASY) {
        // Random pick from remaining candidates
        std::uniform_int_distribution<size_t> d(0, remainingCandidates.size() - 1);
        action.chosenGuess = remainingCandidates[d(rng)];
        action.reactionEmote = "🎲";
        action.reactionMessage = "Exploring letter combinations...";
    } else if (difficulty == BOT_MEDIUM) {
        // Frequency elimination heuristic
        std::unordered_map<char, int> freq;
        for (const auto& word : remainingCandidates) {
            std::unordered_set<char> uniqueChars(word.begin(), word.end());
            for (char c : uniqueChars) freq[c]++;
        }

        std::string bestWord = remainingCandidates[0];
        int maxScore = -1;

        for (const auto& word : remainingCandidates) {
            int score = 0;
            std::unordered_set<char> uniqueChars(word.begin(), word.end());
            for (char c : uniqueChars) score += freq[c];
            if (score > maxScore) {
                maxScore = score;
                bestWord = word;
            }
        }
        action.chosenGuess = bestWord;
        action.reactionEmote = "🎯";
        action.reactionMessage = "Narrowing down possibilities.";
    } else {
        // BOT_HARD: Shannon Information Entropy Maximization
        auto optimal = WordleDeducer::findOptimalGuesses(
            dictionaryPool,
            remainingCandidates,
            1
        );
        if (!optimal.empty()) {
            action.chosenGuess = optimal[0].first;
        } else {
            action.chosenGuess = remainingCandidates[0];
        }
        action.reactionEmote = "🧠";
        action.reactionMessage = "Mathematical entropy maximized.";
    }

    return action;
}

std::string CyberBot::chooseSecretWord(int wordLength) {
    std::vector<std::string> valid;
    for (const auto& w : dictionaryPool) {
        if (static_cast<int>(w.length()) == wordLength) {
            valid.push_back(w);
        }
    }
    if (valid.empty()) {
        return wordLength == 4 ? "CAMP" : wordLength == 6 ? "SHIELD" : "ARENA";
    }

    std::uniform_int_distribution<size_t> dist(0, valid.size() - 1);
    return valid[dist(rng)];
}

} // namespace WordRush
