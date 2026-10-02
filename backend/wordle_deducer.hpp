#ifndef WORDRUSH_WORDLE_DEDUCER_HPP
#define WORDRUSH_WORDLE_DEDUCER_HPP

// ============================================================================
// WORDRUSH ARENA - Two-Pass Wordle Deduction & Information Entropy Calculator
// Evaluates guess attempts, counts letter occurrences, computes Shannon Entropy
// to identify mathematically optimal guesses, and prunes remaining candidates
// ============================================================================

#include <string>
#include <vector>
#include <map>
#include <unordered_map>
#include <cmath>
#include <algorithm>

namespace WordRush {

enum TileState {
    TILE_GRAY = 0,    // Letter absent in target word
    TILE_YELLOW = 1,  // Letter present in word, wrong position
    TILE_GREEN = 2    // Letter present at exact position
};

struct DeductionResult {
    std::string guess;
    std::vector<TileState> states;
    bool isExactMatch;
    int greenCount;
    int yellowCount;
    int grayCount;
    int patternHash; // Base-3 encoded pattern integer (0 to 3^N - 1)
};

class WordleDeducer {
public:
    // Two-pass Wordle guess evaluation (handles duplicate characters correctly)
    static DeductionResult evaluate(const std::string& guess, const std::string& secret);

    // Calculates base-3 pattern hash from tile states
    static int encodePattern(const std::vector<TileState>& states);

    // Check if a candidate word is mathematically consistent with prior guess feedbacks
    static bool isConsistentWithHistory(
        const std::string& candidate,
        const std::vector<DeductionResult>& history
    );

    // Calculates Shannon Information Entropy (bits) for a candidate guess
    // H(X) = - sum( p(x) * log2(p(x)) )
    static double calculateEntropy(
        const std::string& guess,
        const std::vector<std::string>& candidatePool
    );

    // Identifies the best strategic guesses sorted by highest information entropy
    static std::vector<std::pair<std::string, double>> findOptimalGuesses(
        const std::vector<std::string>& allowedGuesses,
        const std::vector<std::string>& candidatePool,
        size_t topN = 5
    );
};

} // namespace WordRush

#endif // WORDRUSH_WORDLE_DEDUCER_HPP
