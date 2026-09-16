// ============================================================================
// WordRush Arena - Backend: Word and Guess Validator (C++)
// Simple, robust word validation and letter state evaluation
// Tile states: 0 = GRAY (Absent), 1 = YELLOW (Present), 2 = GREEN (Correct)
// ============================================================================

#include <string>
#include <vector>
#include <set>
#include <map>
#include <algorithm>
#include <cctype>

#ifdef STANDALONE_VALIDATOR
#include <iostream>
#endif

namespace WordRush {

// Tile match states (Standard Wordle)
enum TileState {
    STATE_GRAY = 0,    // Letter not in word
    STATE_YELLOW = 1,  // Letter in word, wrong position
    STATE_GREEN = 2    // Letter in word, exact position
};

struct LetterEvaluation {
    char letter;
    TileState state;
};

struct GuessResult {
    std::string guess;
    bool isCorrect;
    std::vector<LetterEvaluation> tiles;
};

class WordValidator {
public:
    // Convert string to uppercase
    static std::string toUpper(const std::string& str) {
        std::string res = str;
        std::transform(res.begin(), res.end(), res.begin(), [](unsigned char c) {
            return std::toupper(c);
        });
        return res;
    }

    // Check if word contains any duplicate letters
    static bool hasDuplicateLetters(const std::string& word) {
        std::set<char> seen;
        for (char ch : toUpper(word)) {
            if (seen.count(ch) > 0) return true;
            seen.insert(ch);
        }
        return false;
    }

    // Validate secret word length and characters
    static bool isValidLength(const std::string& word, int expectedLength) {
        return static_cast<int>(word.length()) == expectedLength;
    }

    // Check if all characters are alphabetic
    static bool isAlphaOnly(const std::string& word) {
        for (char ch : word) {
            if (!std::isalpha(static_cast<unsigned char>(ch))) return false;
        }
        return !word.empty();
    }

    // Evaluate guess against secret word
    // Applies Wordle deduction rules: Green (correct), Yellow (present), Gray (absent)
    static GuessResult evaluateGuess(const std::string& rawGuess, const std::string& rawSecret) {
        std::string guess = toUpper(rawGuess);
        std::string secret = toUpper(rawSecret);
        int len = static_cast<int>(guess.length());

        GuessResult result;
        result.guess = guess;
        result.isCorrect = (guess == secret);
        result.tiles.resize(len);

        std::map<char, int> availableSecretChars;
        for (char c : secret) {
            availableSecretChars[c]++;
        }

        // Pass 1: Identify exact position matches (GREEN)
        for (int i = 0; i < len; ++i) {
            result.tiles[i].letter = guess[i];

            if (i < static_cast<int>(secret.length()) && guess[i] == secret[i]) {
                result.tiles[i].state = STATE_GREEN;
                availableSecretChars[guess[i]]--;
            } else {
                result.tiles[i].state = STATE_GRAY;
            }
        }

        // Pass 2: Identify partial matches (YELLOW)
        for (int i = 0; i < len; ++i) {
            if (result.tiles[i].state == STATE_GREEN) continue;

            char ch = guess[i];
            if (availableSecretChars[ch] > 0) {
                result.tiles[i].state = STATE_YELLOW;
                availableSecretChars[ch]--;
            }
        }

        return result;
    }
};

} // namespace WordRush

#ifdef STANDALONE_VALIDATOR
int main() {
    std::cout << "--- WordRush C++ Validator Test ---" << std::endl;
    std::string secret = "ARENA";
    std::string guess = "ALERT";

    WordRush::GuessResult res = WordRush::WordValidator::evaluateGuess(guess, secret);
    std::cout << "Secret: " << secret << ", Guess: " << guess << std::endl;
    std::cout << "Is correct: " << (res.isCorrect ? "YES" : "NO") << std::endl;

    for (const auto& tile : res.tiles) {
        const char* stateStr = "GRAY";
        if (tile.state == WordRush::STATE_GREEN) stateStr = "GREEN";
        else if (tile.state == WordRush::STATE_YELLOW) stateStr = "YELLOW";
        std::cout << "  [" << tile.letter << "] -> " << stateStr << std::endl;
    }
    return 0;
}
#endif
