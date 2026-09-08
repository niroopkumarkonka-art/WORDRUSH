// ============================================================================
// WordRush Arena - Main Backend Program (C++)
// Simple, elegant backend engine driver for WordRush Arena
//
// Key Specifications:
// - Pop-up time limit: strictly 1.5 seconds (1500 ms)
// - First-letter match: special Cyan highlight indicator
// - Levels: Easy (4 letters, 3 hints), Medium (5 letters, 2 hints), Hard (6 letters, 1 hint)
// - No duplicate letters in secret words
// - Wordle deduction: Green (correct), Yellow (present), Gray (absent)
// ============================================================================

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <stack>
#include <queue>
#include <algorithm>
#include <chrono>
#include <thread>
#include <iomanip>

namespace WordRush {

// Strict constants
constexpr int POPUP_TIME_LIMIT_MS = 1500;
constexpr double POPUP_TIME_LIMIT_SEC = 1.5;
constexpr int MAX_ATTEMPTS = 6;

// Letter match states
enum LetterState {
    GRAY = 0,    // Letter not in word
    YELLOW = 1,  // Letter in word, wrong position
    GREEN = 2,   // Letter in word, exact position
    CYAN = 3     // Special: First letter match indicator
};

// Player profile
struct Player {
    std::string id;
    std::string name;
    std::string avatar;
    int score;
    int roundsWon;
};

// Guess evaluation record
struct GuessEvaluation {
    std::string guess;
    bool isExactMatch;
    bool firstLetterMatch;
    std::vector<LetterState> letterStates;
};

// Tactical Hint structure with 1.5s pop-up duration
struct TacticalHint {
    int level;
    std::string title;
    std::string clue;
    int popupDurationMs;
};

// Simple Word Validator
class WordValidator {
public:
    static bool hasDuplicateLetters(const std::string& word) {
        std::set<char> seen;
        for (char c : word) {
            char u = std::toupper(c);
            if (seen.count(u) > 0) return true;
            seen.insert(u);
        }
        return false;
    }

    static GuessEvaluation evaluateGuess(const std::string& rawGuess, const std::string& rawSecret) {
        std::string guess = rawGuess;
        std::string secret = rawSecret;
        for (char& c : guess) c = std::toupper(c);
        for (char& c : secret) c = std::toupper(c);

        int len = static_cast<int>(guess.length());
        GuessEvaluation result;
        result.guess = guess;
        result.isExactMatch = (guess == secret);
        result.firstLetterMatch = (!guess.empty() && !secret.empty() && guess[0] == secret[0]);
        result.letterStates.assign(len, GRAY);

        std::map<char, int> availableChars;
        for (char c : secret) availableChars[c]++;

        // Pass 1: Green exact matches
        for (int i = 0; i < len; ++i) {
            if (i < static_cast<int>(secret.length()) && guess[i] == secret[i]) {
                result.letterStates[i] = GREEN;
                availableChars[guess[i]]--;
            }
        }

        // Pass 2: Yellow partial matches
        for (int i = 0; i < len; ++i) {
            if (result.letterStates[i] == GREEN) continue;
            if (availableChars[guess[i]] > 0) {
                result.letterStates[i] = YELLOW;
                availableChars[guess[i]]--;
            }
        }

        return result;
    }
};

// Simple Hint Stack (LIFO)
class HintStack {
private:
    std::stack<TacticalHint> stack;
    int maxHints;

public:
    HintStack(int difficulty) {
        // Easy = 3 hints, Medium = 2 hints, Hard = 1 hint
        if (difficulty == 1) maxHints = 3;
        else if (difficulty == 3) maxHints = 1;
        else maxHints = 2;
    }

    void buildHints(const std::string& secret) {
        while (!stack.empty()) stack.pop();
        if (secret.empty()) return;

        char firstChar = std::toupper(secret[0]);
        char lastChar = std::toupper(secret[secret.length() - 1]);

        // Hint 2: End letter pattern
        if (maxHints >= 2) {
            TacticalHint h2;
            h2.level = 2;
            h2.title = "Tactical Clue: End Pattern";
            h2.clue = "Ends with '" + std::string(1, lastChar) + "' (Word length: " + std::to_string(secret.length()) + ")";
            h2.popupDurationMs = POPUP_TIME_LIMIT_MS; // 1.5 sec
            stack.push(h2);
        }

        // Hint 1: Start letter
        if (maxHints >= 1) {
            TacticalHint h1;
            h1.level = 1;
            h1.title = "Tactical Clue: Starting Letter";
            h1.clue = "Begins with letter '" + std::string(1, firstChar) + "'";
            h1.popupDurationMs = POPUP_TIME_LIMIT_MS; // 1.5 sec
            stack.push(h1);
        }
    }

    bool popHint(TacticalHint& outHint) {
        if (stack.empty()) return false;
        outHint = stack.top();
        stack.pop();
        return true;
    }
};

} // namespace WordRush

// ============================================================================
// Simple Interactive Backend Demonstration CLI
// ============================================================================
int main() {
    std::cout << "=========================================================" << std::endl;
    std::cout << "  WordRush Arena - C++ Backend Engine                    " << std::endl;
    std::cout << "  * Pop-up Time Limit: 1.5s (" << WordRush::POPUP_TIME_LIMIT_MS << " ms)         " << std::endl;
    std::cout << "  * 1st-Letter Match : Cyan Highlight                     " << std::endl;
    std::cout << "  * Max Attempts     : 6 Tries per Round                  " << std::endl;
    std::cout << "=========================================================" << std::endl << std::endl;

    // Simulation of a 1v1 cipher duel
    WordRush::Player p1{"p1", "Pilot Alpha", "🦊", 0, 0};
    WordRush::Player p2{"p2", "CyberBot", "🤖", 0, 0};

    std::string secretWord = "ARENA";
    std::cout << "[ROUND 1] Setter: " << p1.name << " | Guesser: " << p2.name << std::endl;
    std::cout << "[INFO] Secret Word locked: " << secretWord << " (" << secretWord.length() << " letters)" << std::endl;

    // Tactical hints demonstration
    WordRush::HintStack hints(2); // Medium difficulty: 2 hints
    hints.buildHints(secretWord);

    WordRush::TacticalHint hint;
    if (hints.popHint(hint)) {
        std::cout << "\n[TACTICAL POP-UP] (" << WordRush::POPUP_TIME_LIMIT_SEC << "s duration): "
                  << hint.title << " -> " << hint.clue << std::endl;
    }

    // Guesses simulation
    std::vector<std::string> guesses = {"ALERT", "ALONE", "ARENA"};

    for (size_t attempt = 0; attempt < guesses.size(); ++attempt) {
        const auto& guess = guesses[attempt];
        WordRush::GuessEvaluation eval = WordRush::WordValidator::evaluateGuess(guess, secretWord);

        std::cout << "\nAttempt " << (attempt + 1) << "/" << WordRush::MAX_ATTEMPTS 
                  << ": Guess = \"" << guess << "\"" << std::endl;

        if (eval.firstLetterMatch) {
            std::cout << "  >> [CYAN 1ST LETTER MATCH]: First letter '" << guess[0] << "' matches secret!" << std::endl;
        }

        std::cout << "  Tiles: ";
        for (size_t i = 0; i < eval.letterStates.size(); ++i) {
            char ch = eval.guess[i];
            std::string tag = "GRAY";
            if (eval.letterStates[i] == WordRush::GREEN) tag = "GREEN";
            else if (eval.letterStates[i] == WordRush::YELLOW) tag = "YELLOW";
            std::cout << "[" << ch << ":" << tag << "] ";
        }
        std::cout << std::endl;

        if (eval.isExactMatch) {
            int score = (attempt == 0) ? 100 : (attempt == 1) ? 80 : 60;
            p2.score += score;
            p2.roundsWon++;
            std::cout << "  >> [VICTORY] Word decrypted! +" << score << " pts awarded to " << p2.name << "!" << std::endl;
            break;
        }
    }

    std::cout << "\n=========================================================" << std::endl;
    std::cout << "  Match Summary: " << p1.name << " (" << p1.score << " pts) vs "
              << p2.name << " (" << p2.score << " pts)" << std::endl;
    std::cout << "  Backend Status: Healthy & Ready." << std::endl;
    std::cout << "=========================================================" << std::endl;

    return 0;
}
