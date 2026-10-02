// ============================================================================
// WORDRUSH ARENA - Two-Pass Wordle Deduction & Information Entropy Implementation
// ============================================================================

#include "wordle_deducer.hpp"
#include <cctype>

namespace WordRush {

DeductionResult WordleDeducer::evaluate(const std::string& rawGuess, const std::string& rawSecret) {
    std::string guess = "";
    std::string secret = "";
    for (char c : rawGuess) if (std::isalpha(static_cast<unsigned char>(c))) guess += static_cast<char>(std::toupper(c));
    for (char c : rawSecret) if (std::isalpha(static_cast<unsigned char>(c))) secret += static_cast<char>(std::toupper(c));

    size_t len = guess.length();
    DeductionResult result;
    result.guess = guess;
    result.states.assign(len, TILE_GRAY);
    result.isExactMatch = (guess == secret);
    result.greenCount = 0;
    result.yellowCount = 0;
    result.grayCount = 0;

    std::unordered_map<char, int> targetFreq;
    for (char c : secret) {
        targetFreq[c]++;
    }

    // Pass 1: Mark exact position matches (GREEN)
    for (size_t i = 0; i < len; ++i) {
        if (i < secret.length() && guess[i] == secret[i]) {
            result.states[i] = TILE_GREEN;
            targetFreq[guess[i]]--;
            result.greenCount++;
        }
    }

    // Pass 2: Mark partial position matches (YELLOW) or absent (GRAY)
    for (size_t i = 0; i < len; ++i) {
        if (result.states[i] == TILE_GREEN) continue;

        char c = guess[i];
        if (targetFreq[c] > 0) {
            result.states[i] = TILE_YELLOW;
            targetFreq[c]--;
            result.yellowCount++;
        } else {
            result.states[i] = TILE_GRAY;
            result.grayCount++;
        }
    }

    result.patternHash = encodePattern(result.states);
    return result;
}

int WordleDeducer::encodePattern(const std::vector<TileState>& states) {
    int hash = 0;
    int power = 1;
    for (TileState s : states) {
        hash += static_cast<int>(s) * power;
        power *= 3;
    }
    return hash;
}

bool WordleDeducer::isConsistentWithHistory(
    const std::string& candidate,
    const std::vector<DeductionResult>& history
) {
    for (const auto& past : history) {
        DeductionResult simulated = evaluate(past.guess, candidate);
        if (simulated.patternHash != past.patternHash) {
            return false;
        }
    }
    return true;
}

double WordleDeducer::calculateEntropy(
    const std::string& guess,
    const std::vector<std::string>& candidatePool
) {
    if (candidatePool.empty()) return 0.0;

    std::unordered_map<int, int> patternCounts;
    for (const auto& secret : candidatePool) {
        DeductionResult res = evaluate(guess, secret);
        patternCounts[res.patternHash]++;
    }

    double total = static_cast<double>(candidatePool.size());
    double entropy = 0.0;

    for (const auto& pair : patternCounts) {
        double p = static_cast<double>(pair.second) / total;
        if (p > 0.0) {
            entropy -= p * (std::log(p) / std::log(2.0));
        }
    }

    return entropy;
}

std::vector<std::pair<std::string, double>> WordleDeducer::findOptimalGuesses(
    const std::vector<std::string>& allowedGuesses,
    const std::vector<std::string>& candidatePool,
    size_t topN
) {
    std::vector<std::pair<std::string, double>> scored;
    scored.reserve(allowedGuesses.size());

    for (const auto& word : allowedGuesses) {
        double h = calculateEntropy(word, candidatePool);
        scored.push_back({word, h});
    }

    std::sort(scored.begin(), scored.end(), [](const auto& a, const auto& b) {
        return a.second > b.second;
    });

    if (scored.size() > topN) {
        scored.resize(topN);
    }
    return scored;
}

} // namespace WordRush
