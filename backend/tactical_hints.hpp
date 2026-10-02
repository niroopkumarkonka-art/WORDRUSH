#ifndef WORDRUSH_TACTICAL_HINTS_HPP
#define WORDRUSH_TACTICAL_HINTS_HPP

// ============================================================================
// WORDRUSH ARENA - Multi-Tiered Tactical Hints Engine
// Implements LIFO Hint Stack, 3.5s Pop-up duration timing rules,
// Consonant-Vowel patterns, anagram clues, and phonetic hints
// ============================================================================

#include <string>
#include <vector>
#include <stack>
#include <memory>

namespace WordRush {

constexpr int HINT_POPUP_MS = 3500; // Strictly 3.5 seconds

struct HintItem {
    int level;
    std::string title;
    std::string clue;
    int durationMs;
};

class TacticalHintEngine {
private:
    std::stack<HintItem> hintStack;
    int maxAllowedHints;

public:
    TacticalHintEngine(int difficulty = 2); // 1=Easy(3), 2=Medium(2), 3=Hard(1)

    // Build tactical clues for a given secret word
    void generateHints(
        const std::string& secretWord,
        const std::string& category = "General",
        const std::string& customDefinition = ""
    );

    // Pop the next available tactical clue
    bool popNextHint(HintItem& outHint);

    size_t remainingHintsCount() const { return hintStack.size(); }
    void clear();

    // Helper: generate consonant-vowel mask (e.g. "V C V C C")
    static std::string makeCvMask(const std::string& word);

    // Helper: check if char is vowel
    static bool isVowel(char c);
};

} // namespace WordRush

#endif // WORDRUSH_TACTICAL_HINTS_HPP
