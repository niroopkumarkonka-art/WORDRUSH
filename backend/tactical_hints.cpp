// ============================================================================
// WORDRUSH ARENA - Multi-Tiered Tactical Hints Engine Implementation
// ============================================================================

#include "tactical_hints.hpp"
#include <cctype>
#include <algorithm>

namespace WordRush {

TacticalHintEngine::TacticalHintEngine(int difficulty) {
    if (difficulty == 1) maxAllowedHints = 3;      // Easy
    else if (difficulty == 3) maxAllowedHints = 1; // Hard
    else maxAllowedHints = 2;                     // Medium
}

bool TacticalHintEngine::isVowel(char c) {
    char u = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
    return (u == 'A' || u == 'E' || u == 'I' || u == 'O' || u == 'U');
}

std::string TacticalHintEngine::makeCvMask(const std::string& word) {
    std::string mask = "";
    for (size_t i = 0; i < word.length(); ++i) {
        mask += isVowel(word[i]) ? "VOWEL" : "CONSONANT";
        if (i + 1 < word.length()) mask += " - ";
    }
    return mask;
}

void TacticalHintEngine::generateHints(
    const std::string& secretWord,
    const std::string& category,
    const std::string& customDefinition
) {
    clear();
    if (secretWord.empty()) return;

    std::string clean = "";
    for (char c : secretWord) if (std::isalpha(static_cast<unsigned char>(c))) clean += static_cast<char>(std::toupper(c));
    if (clean.empty()) return;

    char first = clean[0];
    char last = clean[clean.length() - 1];

    // Hint Level 3 (Deep Clue: Category or Definition)
    if (maxAllowedHints >= 3) {
        HintItem h3;
        h3.level = 3;
        h3.title = "Tactical Clue: Semantic Meaning";
        if (!customDefinition.empty()) {
            h3.clue = "Definition: \"" + customDefinition + "\" (" + category + ")";
        } else {
            h3.clue = "Category: " + category + " • Pattern: " + makeCvMask(clean);
        }
        h3.durationMs = HINT_POPUP_MS;
        hintStack.push(h3);
    }

    // Hint Level 2 (Vowel Count & End Pattern)
    if (maxAllowedHints >= 2) {
        int vowelCount = 0;
        for (char c : clean) if (isVowel(c)) vowelCount++;

        HintItem h2;
        h2.level = 2;
        h2.title = "Tactical Clue: Vowels & Ending";
        h2.clue = "Ends with '" + std::string(1, last) + "' and contains " + std::to_string(vowelCount) + " vowel(s).";
        h2.durationMs = HINT_POPUP_MS;
        hintStack.push(h2);
    }

    // Hint Level 1 (Starting Letter)
    if (maxAllowedHints >= 1) {
        HintItem h1;
        h1.level = 1;
        h1.title = "Tactical Clue: Starting Letter";
        h1.clue = "Begins with '" + std::string(1, first) + "' (Length: " + std::to_string(clean.length()) + " letters).";
        h1.durationMs = HINT_POPUP_MS;
        hintStack.push(h1);
    }
}

bool TacticalHintEngine::popNextHint(HintItem& outHint) {
    if (hintStack.empty()) return false;
    outHint = hintStack.top();
    hintStack.pop();
    return true;
}

void TacticalHintEngine::clear() {
    while (!hintStack.empty()) hintStack.pop();
}

} // namespace WordRush
