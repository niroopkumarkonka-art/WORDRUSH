// ============================================================================
// WordRush Arena - Backend: Matchmaking & Player Queue (C++)
// Simple Queue ADT (FIFO) for 1v1 multiplayer pairings & 5-letter room codes
// ============================================================================

#include <string>
#include <queue>
#include <random>
#include <chrono>

#ifdef STANDALONE_MATCHMAKER
#include <iostream>
#endif

namespace WordRush {

struct QueuedPlayer {
    std::string playerId;
    std::string username;
    std::string avatar;
    int requestedDifficulty; // 1 = Easy (4L), 2 = Medium (5L), 3 = Hard (6L)
    int64_t queuedAtMs;
};

struct MatchedPair {
    std::string roomCode;
    QueuedPlayer player1; // Designated Word Setter in Round 1
    QueuedPlayer player2; // Designated Word Guesser in Round 1
    int difficultyLevel;
    int wordLength;
};

class Matchmaker {
private:
    std::queue<QueuedPlayer> waitingQueue;
    std::mt19937 rng;

public:
    Matchmaker() {
        auto seed = static_cast<unsigned long>(std::chrono::system_clock::now().time_since_epoch().count());
        rng.seed(seed);
    }

    // Generate random 5-letter alphabetical room code (e.g., "KBAQZ")
    std::string generateRoomCode() {
        const char charset[] = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const size_t maxIndex = sizeof(charset) - 2;
        std::uniform_int_distribution<size_t> dist(0, maxIndex);

        std::string code = "";
        for (int i = 0; i < 5; ++i) {
            code += charset[dist(rng)];
        }
        return code;
    }

    // Enqueue a player into the matchmaking line
    void enqueuePlayer(const QueuedPlayer& player) {
        waitingQueue.push(player);
    }

    // Attempt to match two waiting players (FIFO)
    bool tryMatch(MatchedPair& outMatch) {
        if (waitingQueue.size() < 2) return false;

        QueuedPlayer p1 = waitingQueue.front();
        waitingQueue.pop();

        QueuedPlayer p2 = waitingQueue.front();
        waitingQueue.pop();

        int diff = p1.requestedDifficulty;
        if (diff < 1 || diff > 3) diff = 2; // Default to Medium

        int wordLen = 5;
        if (diff == 1) wordLen = 4;
        else if (diff == 3) wordLen = 6;

        outMatch.roomCode = generateRoomCode();
        outMatch.player1 = p1;
        outMatch.player2 = p2;
        outMatch.difficultyLevel = diff;
        outMatch.wordLength = wordLen;

        return true;
    }

    size_t getQueueSize() const {
        return waitingQueue.size();
    }
};

} // namespace WordRush

#ifdef STANDALONE_MATCHMAKER
int main() {
    std::cout << "--- WordRush C++ Matchmaker Test ---" << std::endl;
    WordRush::Matchmaker mm;

    WordRush::QueuedPlayer p1{"p1", "Alex", "🦊", 2, 1000};
    WordRush::QueuedPlayer p2{"p2", "CyberBot", "🤖", 2, 1010};

    mm.enqueuePlayer(p1);
    mm.enqueuePlayer(p2);

    WordRush::MatchedPair match;
    if (mm.tryMatch(match)) {
        std::cout << "Match Found! Room Code: " << match.roomCode << std::endl;
        std::cout << "Setter: " << match.player1.username << ", Guesser: " << match.player2.username << std::endl;
        std::cout << "Word Length: " << match.wordLength << " letters" << std::endl;
    }
    return 0;
}
#endif
