// ============================================================================
// WordRush Arena - Backend: Tactical Hint System (C++)
// Simple Stack ADT (LIFO) hint manager with strict 1.5s pop-up duration
// Difficulty levels:
//   - Easy: 4 letters, 3 hints
//   - Medium: 5 letters, 2 hints
//   - Hard: 6 le tters, 1 hint
// ============================================================================

#include <cctype>
#include <stack>
#include <string>

#ifdef STANDALONE_HINTS
#include <iostream>
#endif

namespace WordRush {

// Strict pop-up time limit: 1.5 seconds (1500 milliseconds)
constexpr int POPUP_TIME_LIMIT_MS = 1500;
constexpr double POPUP_TIME_LIMIT_SEC = 1.5;

struct Hint {
  int level;            // 1 = starting letter, 2 = pattern, 3 = vowels/clue
  std::string title;    // Pop-up title
  std::string clueText; // Content of the clue
  int durationMs;       // Pop-up display duration: strictly 1500 ms (1.5 sec)
};

class HintManager {
private:
  std::stack<Hint> hintStack;
  int hintsUsed;
  int maxAllowedHints;

public:
  HintManager(int difficultyLevel = 2) : hintsUsed(0) {
    // Configure hint quota based on difficulty
    switch (difficultyLevel) {
    case 1: // Easy (4 letters)
      maxAllowedHints = 3;
      break;
    case 2: // Medium (5 letters)
      maxAllowedHints = 2;
      break;
    case 3: // Hard (6 letters)
      maxAllowedHints = 1;
      break;
    default:
      maxAllowedHints = 2;
      break;
    }
  }

  // Populate the stack for a given secret word (LIFO: Hint 1 popped first)
  void prepareHints(const std::string &secretWord) {
    while (!hintStack.empty())
      hintStack.pop();
    hintsUsed = 0;

    if (secretWord.empty())
      return;

    int len = static_cast<int>(secretWord.length());
    char firstChar = secretWord[0];
    char lastChar = secretWord[len - 1];

    // Collect vowels
    std::string vowelsFound = "";
    for (char ch : secretWord) {
      char u = std::toupper(ch);
      if (u == 'A' || u == 'E' || u == 'I' || u == 'O' || u == 'U') {
        if (vowelsFound.find(u) == std::string::npos) {
          if (!vowelsFound.empty())
            vowelsFound += ", ";
          vowelsFound += u;
        }
      }
    }
    if (vowelsFound.empty())
      vowelsFound = "None";

    // Hint 3: Vowels clue (pushed first, so it is popped last in LIFO)
    if (maxAllowedHints >= 3) {
      Hint h3;
      h3.level = 3;
      h3.title = "Tactical Clue: Vowels";
      h3.clueText = "Contains vowel(s): " + vowelsFound;
      h3.durationMs = POPUP_TIME_LIMIT_MS; // 1.5s
      hintStack.push(h3);
    }

    // Hint 2: Pattern clue (ends with lastChar)
    if (maxAllowedHints >= 2) {
      Hint h2;
      h2.level = 2;
      h2.title = "Tactical Clue: Pattern";
      std::string pattern = "";
      pattern += firstChar;
      for (int i = 1; i < len - 1; ++i)
        pattern += " _";
      pattern += " ";
      pattern += lastChar;
      h2.clueText = "Ends with '" + std::string(1, lastChar) +
                    "' (Pattern: " + pattern + ")";
      h2.durationMs = POPUP_TIME_LIMIT_MS; // 1.5s
      hintStack.push(h2);
    }

    // Hint 1: Starting letter (pushed last, popped first in LIFO)
    if (maxAllowedHints >= 1) {
      Hint h1;
      h1.level = 1;
      h1.title = "Tactical Clue: Start";
      h1.clueText = "Starts with '" + std::string(1, firstChar) + "' (" +
                    std::to_string(len) + " letters)";
      h1.durationMs = POPUP_TIME_LIMIT_MS; // 1.5s
      hintStack.push(h1);
    }
  }

  // Check if player has remaining hints
  bool hasAvailableHints() const {
    return !hintStack.empty() && (hintsUsed < maxAllowedHints);
  }

  // Pop the next hint off the stack
  bool getNextHint(Hint &outHint) {
    if (!hasAvailableHints())
      return false;
    outHint = hintStack.top();
    hintStack.pop();
    hintsUsed++;
    return true;
  }

  int getHintsUsed() const { return hintsUsed; }
  int getMaxAllowedHints() const { return maxAllowedHints; }
  int getRemainingHints() const { return maxAllowedHints - hintsUsed; }
};

} // namespace WordRush

#ifdef STANDALONE_HINTS
int main() {
  std::cout << "--- WordRush C++ Hints Test (1.5s Pop-up Duration) ---"
            << std::endl;
  WordRush::HintManager manager(2); // Medium: 2 hints
  manager.prepareHints("CANDY");

  std::cout << "Remaining hints: " << manager.getRemainingHints() << std::endl;

  WordRush::Hint hint;
  while (manager.getNextHint(hint)) {
    std::cout << "Popped Hint Level " << hint.level << " [" << hint.title
              << "]: " << hint.clueText
              << " (Pop-up Display: " << hint.durationMs << "ms / "
              << WordRush::POPUP_TIME_LIMIT_SEC << "s)" << std::endl;
  }
  return 0;
}
#endif
