# WORDRUSH ARENA
### “Think Fast. Choose Smart. Beat Your Opponent.”

A real-time, **two-player multiplayer-only** word guessing competition designed as a flagship **B.Tech Data Structures & Algorithms in C++ Project**, unifying Modules I through X of the academic syllabus into a modern, production-ready web application.

---

## 1. Problem Statement
Traditional word guessing games (such as Wordle) are almost exclusively single-player experiences where users interact with pre-programmed daily words or automated bots. Moreover, computer science academic projects in Data Structures using C++ are frequently restricted to sterile console text interfaces that fail to demonstrate how core algorithms, Abstract Data Types (Stacks, Queues, 2D Arrays, Hash Sets), and asymptotic performance principles power real-world, high-concurrency multiplayer applications.

**WordRush Arena** addresses both challenges:
1. **Multiplayer-Only Dynamic**: Eliminates solo play and bots entirely; matches two real human players where one secretly sets a valid, non-duplicate word and the other attempts to deduce it within 6 attempts using Wordle-style feedback and strategic hints.
2. **Pedagogical Integration**: Directly implements every module of the B.Tech Data Structures in C++ syllabus (Modules I – X) in native C++ (`backend/`) and mirrors the exact state, array matrix representations, and ADTs on the full-stack real-time multiplayer engine.

---

## 2. Objectives
* Build a competitive, real-time two-player word guessing arena with zero bot/solo modes.
* Demonstrate genuine implementations of:
  * **Module I**: Variables, Data Types, Operators, Functions, Program Structure.
  * **Module II**: Decision-Making (`if/else`, nested conditions) & Loops (`for`, `while`).
  * **Module III**: 1D Arrays (keyboard mapping, letter state vectors, reusable array functions).
  * **Module IV**: 2D Arrays (game board matrix $[6 \times 6]$, row/column indexing, board traversal).
  * **Module V**: Strings (traversal, two-pointer reversal, character frequency mapping, two-pass pattern matching).
  * **Module VI**: Structures (`struct Player`, nested `struct Profile`, array of structures `Player players[2]`).
  * **Module VII**: Algorithmic & Data Structure Performance Analysis (Time/Space complexity, Asymptotic notation).
  * **Module VIII**: Stack ADT (Custom array-based `HintStack` with LIFO hint popping).
  * **Module IX**: Queue ADT (Custom array-based `PlayerQueue` FIFO matchmaking & `CircularQueue` ring buffer).
  * **Module X**: STL Fundamentals (`vector`, `pair`, `iterators`, `deque`, `set`, `map`).
* Provide an in-game **Interactive Data Structure & Complexity Inspector** allowing students, evaluators, and faculty to inspect live memory structures and asymptotic bounds during gameplay.

---

## 3. Technologies
* **C++ Backend Engine**: C++17, CMake, Native STL, Modular OOP and ADT classes.
* **Full-Stack Runtime**: Node.js, Express, TypeScript, tsx.
* **Real-Time Multiplayer Protocol**: WebSockets (`ws`), JSON-RPC event bus, auto-reconnection.
* **Frontend UI**: React 19, Vite, Tailwind CSS, Lucide Icons, Canvas-Confetti, Motion.

---

## 4. System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    WORDRUSH ARENA CLIENTS                       │
│    Player 1 (Word Setter)              Player 2 (Guesser)       │
│    React 19 / Tailwind / Canvas        React 19 / Tailwind      │
└───────────────▲─────────────────────────────────▲───────────────┘
                │                                 │
                │        WebSocket (ws://)        │
                │   Real-time bidirectional sync  │
                ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 EXPRESS & WEBSOCKET SERVER                      │
│   • Port 3000 (0.0.0.0) Ingress Routing                         │
│   • Room Code Manager (std::map<string, Room>)                  │
│   • Username Registry (std::unordered_map)                      │
│   • Player Waiting Queue (Custom Array-Based Queue FIFO)        │
│   • Event Ring Buffer (Custom Circular Queue)                   │
├─────────────────────────────────────────────────────────────────┤
│                     CORE GAME ENGINE                            │
│   • 2D Board Matrix: char gameBoard[6][6]                       │
│   • 1D Letter States: int states[6] (0=Gray, 1=Yellow, 2=Green) │
│   • Hint Manager: Custom Array-Based Stack ADT (LIFO)           │
│   • Duplicate Detector: std::set<char>                          │
│   • Wordle Two-Pass Pattern Matcher: O(N)                       │
│   • Dictionary: 1000+ words fast O(1) hash table lookup         │
├─────────────────────────────────────────────────────────────────┤
│            AUTHENTIC C++ BACKEND (`backend/`)                   │
│   • include/*.h & src/*.cpp                                     │
│   • CMakeLists.txt & Native Compilation Suite                   │
│   • Complete Syllabus Verification Suite in main.cpp            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. STL Used in WordRush Arena

| STL Container / Feature | Application in WordRush Arena | Why Selected? |
| :--- | :--- | :--- |
| **`std::vector`** | Round history, dictionary word storage, match logs | Dynamic resizing, contiguous cache locality, random access $O(1)$. |
| **`std::pair`** | Player-score tuple `std::pair<string, int>` | Clean pairing of player identifier with cumulative score without redundant wrapper classes. |
| **Iterators** | Iterating through dictionary words & round history | Standardized container-agnostic traversal demonstrating Module X STL iterator syntax. |
| **`std::deque`** | Recent match event announcements | Fast $O(1)$ push at back and $O(1)$ pop at front when bounded log exceeds capacity. |
| **`std::set`** | Duplicate letter detection in secret words | Guaranteed uniqueness; prevents words like `APPLE` or `LEVEL` with $O(N \log N)$ set operations. |
| **`std::map`** | Room management (`roomCode -> Room`), char frequency | Ordered associative Red-Black tree lookup guaranteeing $O(\log R)$ retrieval. |
| **`std::stack`** | Supporting guess history backtracking | Demonstrates STL stack alongside the custom array-based `HintStack`. |
| **`std::queue`** | Supporting event dispatch | Demonstrates STL queue alongside the custom array-based `PlayerQueue`. |

---

## 6. Data Structure & Algorithm Analysis (Module VII)

### 1. Duplicate Letter Detection (`hasDuplicateLetters`)
* **Algorithm**: Insert each character into `std::set<char>`. If character exists, reject.
* **Time Complexity**:
  * *Best Case*: $O(1)$ (Duplicate detected in first 2 characters, e.g. `AARDVARK`).
  * *Average Case*: $O(N \log K)$ where $N$ is word length (4–6) and $K \le 26$ unique letters.
  * *Worst Case*: $O(N \log N)$ (All characters distinct).
* **Space Complexity**: $O(N)$ auxiliary memory for the set.

### 2. Wordle Two-Pass Guess Matching (`compareGuess`)
* **Algorithm**:
  1. Pass 1: Identifies exact matches at the same index, sets state to `GREEN` (2), and decrements the target character frequency map.
  2. Pass 2: For non-green indices, checks if character exists with frequency $> 0$. If yes, assigns `YELLOW` (1) and decrements frequency; otherwise assigns `GRAY` (0).
* **Time Complexity**:
  * *Best Case*: $O(N)$ (Exact match on all characters).
  * *Average Case*: $O(N)$ (Two linear passes over length $N \in \{4, 5, 6\}$).
  * *Worst Case*: $O(N)$.
* **Space Complexity**: $O(N)$ for letter frequency tracking map and 1D state array.

### 3. 2D Game Board Matrix Traversal (`gameBoard[6][6]`)
* **Algorithm**: Row and column direct indexing `gameBoard[row][col]`.
* **Time Complexity**: $O(\text{Rows} \times \text{Cols}) = O(6 \times 6) = O(1)$ bounded constant time.
* **Space Complexity**: $O(1)$ contiguous memory buffer.

### 4. Stack ADT Operations (`HintStack`)
* **Algorithm**: Top pointer arithmetic `hints[++topIndex]` and `hints[topIndex--]`.
* **Time Complexity**: Push: $O(1)$, Pop: $O(1)$, Peek: $O(1)$.
* **Space Complexity**: $O(M)$ where $M$ is `MAX_STACK_SIZE = 20`.

### 5. Queue ADT Operations (`PlayerQueue`)
* **Algorithm**: Array index tracking with front and rear pointer increments.
* **Time Complexity**: Enqueue: $O(1)$, Dequeue: $O(1)$, Front: $O(1)$.
* **Space Complexity**: $O(C)$ where $C$ is `MAX_QUEUE_CAPACITY = 30`.

---

## 7. Game Rules & Scoring

### Secret Word Constraints
1. Must exist in the official dictionary.
2. Must match the agreed-upon word length (4, 5, or 6 letters).
3. Must contain **NO DUPLICATE LETTERS** (e.g. `CRANE` is valid, `APPLE` is invalid).

### Guessing Constraints
1. Guesses must be valid dictionary words of matching length.
2. Guesses **may** contain repeated letters (e.g. `SPEED` guessing `CRANE` correctly evaluates each `E`).
3. Guesser has exactly 6 attempts.

### Scoring Breakdown
* **Word Successfully Found**: $+10$ base points.
* **Speed / Attempts Bonus**: $+(\text{Max Attempts} - \text{Attempts Used} + 1) \times 2$ points.
* **Unused Hints Bonus**: $+1$ point per unused free hint.
* **Extra Hint Penalty**: $-1$ point per extra hint taken after 3 free hints are consumed.
* **Word Setter Defending Bonus**: If guesser exhausts all 6 attempts without finding the word, the setter defends and earns $+10$ points.

### Alternating Rounds
* 3 or 5 rounds.
* Round 1: Player 1 sets $\rightarrow$ Player 2 guesses.
* Round 2: Player 2 sets $\rightarrow$ Player 1 guesses.
* Round 3: Player 1 sets $\rightarrow$ Player 2 guesses.
* (And so forth for Round 4 and 5).

---

## 8. Directory & Folder Structure
```
wordrush-arena/
├── backend/                        # Complete C++ B.Tech Syllabus Project
│   ├── CMakeLists.txt              # CMake build configuration
│   ├── data/
│   │   └── dictionary.txt          # English word bank (4, 5, 6 letters)
│   ├── include/                    # C++ Header Files
│   │   ├── CircularQueue.h
│   │   ├── Game.h
│   │   ├── GameStateManager.h
│   │   ├── GuessValidator.h
│   │   ├── HintManager.h
│   │   ├── Player.h
│   │   ├── Queue.h
│   │   ├── Room.h
│   │   ├── RoomManager.h
│   │   ├── Round.h
│   │   ├── ScoreManager.h
│   │   ├── Stack.h
│   │   ├── WordDictionary.h
│   │   └── WordValidator.h
│   └── src/                        # C++ Implementation Files
│       ├── CircularQueue.cpp
│       ├── Game.cpp
│       ├── GameStateManager.cpp
│       ├── GuessValidator.cpp
│       ├── HintManager.cpp
│       ├── main.cpp                # Comprehensive verification & test suite
│       ├── Player.cpp
│       ├── Queue.cpp
│       ├── Room.cpp
│       ├── RoomManager.cpp
│       ├── Round.cpp
│       ├── ScoreManager.cpp
│       ├── Stack.cpp
│       ├── WordDictionary.cpp
│       └── WordValidator.cpp
├── server/                         # Server-side mirror of C++ Data Structures
│   ├── dictionary.ts
│   └── engine.ts
├── src/                            # React 19 Client Application
│   ├── components/                 # Modular, Accessible UI Components
│   │   ├── Countdown.tsx
│   │   ├── DataStructuresInspectorModal.tsx # Live Academic C++ Inspector
│   │   ├── GameBoard.tsx
│   │   ├── HintPanel.tsx
│   │   ├── Keyboard.tsx
│   │   ├── LetterTile.tsx
│   │   ├── Lobby.tsx
│   │   ├── Logo.tsx
│   │   ├── Modal.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── RoomCode.tsx
│   │   ├── RoundIndicator.tsx
│   │   ├── RulesModal.tsx
│   │   ├── Scoreboard.tsx
│   │   ├── StatsCard.tsx
│   │   ├── Toast.tsx
│   │   └── WinnerModal.tsx
│   ├── services/
│   │   └── socket.ts               # Resilient WebSocket Client
│   ├── App.tsx                     # Main State Coordinator & Page Router
│   ├── index.css                   # Global Tailwind Styles
│   ├── main.tsx                    # React Entry
│   └── types.ts                    # Shared TypeScript Interfaces
├── DATA_STRUCTURE_USAGE.md         # Detailed Course Syllabus Mapping
├── package.json
├── server.ts                       # Express + WebSocket Server Entry
└── README.md
```

---

## 9. Setup & Running Instructions

### Running the Web Application
```bash
# 1. Install dependencies
npm install

# 2. Run the full-stack multiplayer server
npm run dev

# 3. Open browser
http://localhost:3000
```

### Compiling the C++ Backend Project
```bash
cd backend
mkdir -p build && cd build
cmake ..
make
./wordrush_arena
```
This runs the full test harness verifying Modules I through X, printing array outputs, stack LIFO pops, queue FIFO dequeues, and asymptotic complexity reports!

---

## 10. Author & Academic Context
* **Project**: WordRush Arena — B.Tech Data Structures in C++ Capstone Project.
* **Student/Author**: Rakshitha Konka
* **Course Coverage**: Modules I through X (Variables, Control Statements, 1D Arrays, 2D Arrays, Strings, Structures, Performance Analysis, Stacks, Queues, STL Containers).
