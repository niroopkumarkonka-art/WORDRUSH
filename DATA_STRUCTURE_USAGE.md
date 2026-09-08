# WORDRUSH ARENA — DATA STRUCTURE USAGE SPECIFICATION
### B.Tech Data Structures & Algorithms using C++ (Modules I – X)

---

## Complete Syllabus Mapping Table

| Syllabus Concept | WordRush Arena Usage | Implementation Location | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Variables & Constants** | Player scores, round numbers, attempt counts, constants for `MAX_ATTEMPTS = 6`, `MAX_WORD_LENGTH = 6`, `FREE_HINTS = 3` | `include/Round.h`, `include/Player.h` | $O(1)$ | $O(1)$ |
| **Data Types** | `int`, `bool`, `char`, `double`, `std::string` | All classes & structures | $O(1)$ | $O(1)$ |
| **Operators** | Score formulas `+10`, bonuses, comparisons, bitwise & relational checks | `src/ScoreManager.cpp`, `src/Player.cpp` | $O(1)$ | $O(1)$ |
| **Control Statements (If/Else, Switch)** | Word validation, turn validation, letter status determination, winner/loss logic | `src/WordValidator.cpp`, `src/Game.cpp` | $O(1)$ | $O(1)$ |
| **Loops (For, While)** | Word traversal, 2D matrix traversal, dictionary parsing, string reversal | `src/Round.cpp`, `src/GuessValidator.cpp` | $O(N)$ or $O(R \times C)$ | $O(1)$ |
| **Functions** | Modular procedural & object methods: `compareGuess`, `processLetterStates`, `calculateRoundScore` | `src/GuessValidator.cpp`, `src/ScoreManager.cpp` | $O(N)$ | $O(1)$ |
| **1D Arrays** | Keyboard letter states `int keyboard[26]`, letter match states `int letterStates[6]` | `include/Round.h`, `src/GuessValidator.cpp` | $O(N)$ traversal | $O(N)$ |
| **2D Arrays** | Game board grid `char gameBoard[MAX_ATTEMPTS][MAX_WORD_LENGTH]` and state matrix | `include/Round.h`, `src/Round.cpp` | $O(R \times C)$ | $O(R \times C)$ contiguous |
| **Strings & Traversal** | `std::string` for words, usernames, room codes, character frequency, two-pointer reversal | `include/WordValidator.h`, `src/WordValidator.cpp` | $O(N)$ | $O(N)$ |
| **Structures (struct)** | `struct Player`, `struct Round`, `struct Guess`, `struct GameConfiguration` | `include/Player.h`, `include/Round.h`, `include/Game.h` | $O(1)$ | $O(1)$ |
| **Nested Structures** | `struct Profile` nested within `struct Player` | `include/Player.h` | $O(1)$ | $O(1)$ |
| **Array of Structures** | `Player players[2]` managing the two arena human opponents | `include/Game.h`, `src/Game.cpp` | $O(1)$ access | $O(1)$ |
| **Time Complexity** | Asymptotic analysis ($O(1)$, $O(N)$, $O(\log N)$, $O(R \times C)$) | `src/GameStateManager.cpp`, In-App Inspector | Analytical | Analytical |
| **Space Complexity** | Analysis of stack frames, auxiliary memory, contiguous buffers | `src/GameStateManager.cpp`, Documentation | Analytical | Analytical |
| **Stack ADT (Custom Array)** | `HintStack` with `push`, `pop`, `peek`, `isEmpty`, `isFull` for hints (LIFO) | `include/Stack.h`, `src/Stack.cpp`, `src/HintManager.cpp` | $O(1)$ operations | $O(K)$ array storage |
| **Queue ADT (Custom Array)** | `PlayerQueue` linear queue with `enqueue`, `dequeue`, `front` for matchmaking (FIFO) | `include/Queue.h`, `src/Queue.cpp`, `src/RoomManager.cpp` | $O(1)$ operations | $O(M)$ array storage |
| **Circular Queue** | `CircularQueue` with modulo arithmetic `(index + 1) % MAX` for live game event ring buffer | `include/CircularQueue.h`, `src/CircularQueue.cpp` | $O(1)$ operations | $O(C)$ array storage |
| **STL Vector** | `std::vector<Round>` for round match history, `std::vector<std::string>` for dictionary | `include/Game.h`, `include/WordDictionary.h` | Push $O(1)$ amortized | Dynamic $O(V)$ |
| **STL Pair** | `std::pair<std::string, int>` for player-score rank records | `include/ScoreManager.h`, `src/ScoreManager.cpp` | $O(1)$ | $O(1)$ |
| **STL Iterators** | `std::vector<std::string>::const_iterator` for dictionary traversal | `src/WordDictionary.cpp` | $O(1)$ step | $O(1)$ |
| **STL Deque** | `std::deque<std::string>` for bounded recent game announcements | `include/Game.h`, `src/Game.cpp` | Push/Pop $O(1)$ | $O(D)$ |
| **STL Set** | `std::set<char>` for duplicate letter detection in secret words | `src/WordValidator.cpp` | $O(N \log N)$ | $O(N)$ |
| **STL Map** | `std::map<std::string, Room>` for room lookup by 5-char code, character frequencies | `include/RoomManager.h`, `src/WordValidator.cpp` | $O(\log R)$ | $O(R)$ |

---

## Abstract Data Types (ADT) Specification

### 1. Stack ADT (`HintStack`)
* **Concept**: Stored in a fixed-size contiguous array adhering strictly to **Last In, First Out (LIFO)**.
* **Operations**:
  * `push(item)`: Inserts element at `topIndex + 1`. Fails if `topIndex == MAX - 1` (Overflow).
  * `pop()`: Returns and removes element at `topIndex`. Fails if `topIndex == -1` (Underflow).
  * `peek()`: Returns element at `topIndex` without modifying pointer.
  * `isEmpty()`: Evaluates `topIndex == -1`.
  * `isFull()`: Evaluates `topIndex >= MAX - 1`.
* **Application in WordRush Arena**:
  When a round begins, the hint manager pushes Hint 3 (vowel/clue), Hint 2 (letter reveal), and Hint 1 (starting letter) onto the stack. Because of LIFO, when the guesser requests their first free hint, `pop()` retrieves Hint 1 first, followed by Hint 2 and Hint 3.

### 2. Queue ADT (`PlayerQueue`)
* **Concept**: Stored in a fixed-size array adhering strictly to **First In, First Out (FIFO)**.
* **Operations**:
  * `enqueue(player)`: Adds waiting player to `rearIndex + 1`.
  * `dequeue()`: Extracts and returns waiting player at `frontIndex`.
  * `front()`: Returns the player at `frontIndex`.
  * `isEmpty()`, `isFull()`: Boundary checks.
* **Application in WordRush Arena**:
  Players queue up to find available arena slots in first-come, first-served fair scheduling.

### 3. Circular Queue ADT (`CircularQueue`)
* **Concept**: Avoids linear queue pointer exhaustion by wrapping rear and front indices using modulo arithmetic:
  $$\text{rearIndex} = (\text{rearIndex} + 1) \pmod{\text{CAPACITY}}$$
* **Application in WordRush Arena**:
  Serves as an in-memory event broadcast log that keeps the last 16 match announcements without memory leaks or reallocation overhead.
