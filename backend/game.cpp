// ============================================================================
// WordRush Arena - Backend: Game Engine & Session Manager (C++)
// Simple turn-based 1v1 cipher duel state machine and scoring
// Strict 1.5s pop-up duration limit constant
// ============================================================================

#include <string>
#include <vector>

#ifdef STANDALONE_GAME
#include <iostream>
#endif

namespace WordRush {

constexpr int MAX_ATTEMPTS = 6;
constexpr int POPUP_TIME_LIMIT_MS = 1500; // Strictly 1.5 seconds

enum GamePhase {
    PHASE_LOBBY,
    PHASE_WORD_SELECTION,
    PHASE_GUESSING,
    PHASE_ROUND_SUMMARY,
    PHASE_GAME_OVER
};

struct Player {
    std::string playerId;
    std::string username;
    std::string avatar;
    int score;
    int roundsWon;
    int wordsGuessed;
    int hintsUsed;
    bool isReady;
};

struct GuessRecord {
    std::string guess;
    std::vector<int> letterStates; // 0=GRAY, 1=YELLOW, 2=GREEN, 3=CYAN (1st match)
    bool firstCharMatch;
    int attemptNumber;
};

struct Round {
    int roundNumber;
    std::string setterPlayerId;
    std::string guesserPlayerId;
    std::string secretWord;
    int wordLength;
    std::vector<GuessRecord> guesses;
    bool isWon;
    bool isFinished;
    int pointsAwarded;
};

class GameSession {
private:
    std::string roomCode;
    int difficultyLevel; // 1 = Easy (4L), 2 = Medium (5L), 3 = Hard (6L)
    int wordLength;
    GamePhase phase;
    Player player1;
    Player player2;
    int currentRoundIndex;
    std::vector<Round> rounds;

public:
    GameSession(const std::string& code, int difficulty = 2)
        : roomCode(code), difficultyLevel(difficulty), phase(PHASE_LOBBY), currentRoundIndex(0) {
        if (difficulty == 1) wordLength = 4;
        else if (difficulty == 3) wordLength = 6;
        else wordLength = 5;
    }

    void setPlayers(const Player& p1, const Player& p2) {
        player1 = p1;
        player2 = p2;
    }

    // Start a new round: alternate setter & guesser
    void startNewRound() {
        Round r;
        r.roundNumber = static_cast<int>(rounds.size()) + 1;
        r.wordLength = wordLength;
        r.isWon = false;
        r.isFinished = false;
        r.pointsAwarded = 0;

        // Round 1: Player 1 sets, Player 2 guesses
        // Round 2: Player 2 sets, Player 1 guesses
        if (r.roundNumber % 2 == 1) {
            r.setterPlayerId = player1.playerId;
            r.guesserPlayerId = player2.playerId;
        } else {
            r.setterPlayerId = player2.playerId;
            r.guesserPlayerId = player1.playerId;
        }

        rounds.push_back(r);
        phase = PHASE_WORD_SELECTION;
    }

    // Word setter submits secret word
    bool setSecretWord(const std::string& word) {
        if (phase != PHASE_WORD_SELECTION || rounds.empty()) return false;
        rounds.back().secretWord = word;
        phase = PHASE_GUESSING;
        return true;
    }

    // Calculate score based on attempt index and hints used
    int calculateScore(int attemptIndex, int hintsUsed) {
        int baseScores[] = {100, 80, 60, 40, 20, 10};
        int score = (attemptIndex >= 0 && attemptIndex < 6) ? baseScores[attemptIndex] : 0;
        if (hintsUsed == 0) {
            score += 25; // Clean deduction bonus
        }
        return score;
    }

    // Guesser submits guess
    bool submitGuess(const std::string& guessWord, bool isCorrect, bool firstCharMatch, const std::vector<int>& states) {
        if (phase != PHASE_GUESSING || rounds.empty()) return false;
        Round& current = rounds.back();

        GuessRecord record;
        record.guess = guessWord;
        record.firstCharMatch = firstCharMatch;
        record.letterStates = states;
        record.attemptNumber = static_cast<int>(current.guesses.size()) + 1;

        current.guesses.push_back(record);

        if (isCorrect) {
            current.isWon = true;
            current.isFinished = true;
            int pts = calculateScore(record.attemptNumber - 1, 0);
            current.pointsAwarded = pts;

            // Award points to the guesser
            if (current.guesserPlayerId == player1.playerId) {
                player1.score += pts;
                player1.roundsWon++;
            } else {
                player2.score += pts;
                player2.roundsWon++;
            }
            phase = PHASE_ROUND_SUMMARY;
            return true;
        }

        if (static_cast<int>(current.guesses.size()) >= MAX_ATTEMPTS) {
            current.isWon = false;
            current.isFinished = true;
            phase = PHASE_ROUND_SUMMARY;
            return true;
        }

        return true;
    }

    std::string getRoomCode() const { return roomCode; }
    int getWordLength() const { return wordLength; }
    GamePhase getPhase() const { return phase; }
    const Player& getPlayer1() const { return player1; }
    const Player& getPlayer2() const { return player2; }
    const std::vector<Round>& getRounds() const { return rounds; }
};

} // namespace WordRush

#ifdef STANDALONE_GAME
int main() {
    std::cout << "--- WordRush C++ Game Engine Session Test ---" << std::endl;
    WordRush::GameSession game("RUSH7", 2); // 5-letter medium

    WordRush::Player p1{"p1", "Alice", "🦊", 0, 0, 0, 0, true};
    WordRush::Player p2{"p2", "Bob", "🤖", 0, 0, 0, 0, true};
    game.setPlayers(p1, p2);

    game.startNewRound();
    game.setSecretWord("ARENA");

    // Guess 1: ALERT (First char 'A' matches, Cyan indicator)
    std::vector<int> states = {2, 1, 1, 0, 0};
    game.submitGuess("ALERT", false, true, states);

    // Guess 2: ARENA (Correct)
    std::vector<int> winStates = {2, 2, 2, 2, 2};
    game.submitGuess("ARENA", true, true, winStates);

    std::cout << "Game round complete! Guesser Points: " 
              << game.getRounds().back().pointsAwarded << std::endl;
    return 0;
}
#endif
