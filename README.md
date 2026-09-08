# WORDRUSH ARENA
### “Think Fast. Choose Smart. Beat Your Opponent.”

A real-time, high-performance competitive word gaming application powered by a native C++ computational backend and a modern full-stack web interface. Features head-to-head 1v1 multiplayer duels, solo word puzzle adventures across multiple difficulties, real-time anagram unscramblers, automated puzzle solvers, and a persistent lexical vault.

---

## 1. Overview & Key Features

**WordRush Arena** combines tactical wordplay with low-latency multiplayer mechanics and robust computational algorithms:

1. **Competitive 1v1 Multiplayer Arena**:
   - Matches two players in turn-based lexical combat using 5-letter room codes.
   - One player secretly sets a valid, non-duplicate word while the other attempts to deduce it within 6 attempts using Wordle-style colored feedback and strategic hints.
   - Alternating rounds with real-time score calculation, defending bonuses, and victory confetti.

2. **Word Puzzles Adventure**:
   - Curated single-player word ciphers spanning **Easy (4 letters)**, **Medium (5 letters)**, and **Hard (6 letters)** difficulties.
   - Dynamic context clues, definitions, and distinct **Electric Cyan** first-letter match indicators.
   - Random puzzle generator and step-by-step solver capabilities.

3. **Anagram Solver & Lexical Inspector**:
   - Interactive modal capable of finding all valid permutations and anagrams for any letter set.
   - Live vocabulary inspector validating words in real time.

4. **Saved Words Vault**:
   - Automatically saves every deciphered word, definition, category, points earned, and timestamp into a searchable, filterable local vault.

5. **Native C++ Performance Backend**:
   - High-throughput computational engine executing word validations, guess evaluations, hints, and anagram computations via low-overhead system execution.

---

## 2. Core Architecture & System Design

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
│   • Port 3000 Ingress Routing & REST API Endpoints              │
│   • Room Code Manager (std::map<string, Room>)                  │
│   • Username Registry & Connection Tracking                     │
│   • Event Ring Buffer & State Broadcast                         │
├─────────────────────────────────────────────────────────────────┤
│                     CORE GAME LOGIC                             │
│   • 2D Board Matrix: char gameBoard[6][6]                       │
│   • 1D Letter States: int states[6] (0=Gray, 1=Yellow, 2=Green) │
│   • Hint Manager: Array-Based Stack ADT (LIFO)                  │
│   • Duplicate Detector: std::set<char>                          │
│   • Two-Pass Guess Deduction Algorithm: O(N)                    │
│   • Dictionary: 1,200+ words fast O(1) hash table lookup        │
├─────────────────────────────────────────────────────────────────┤
│            AUTHENTIC C++ ENGINE (`backend/`)                    │
│   • engine.cpp, validator.cpp, matchmaker.cpp, hints.cpp        │
│   • Compiled Native Binary (wordrush_engine.exe)                │
│   • Sub-millisecond Execution & JSON Output                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Canvas-Confetti, Motion.
* **Backend Runtime**: Node.js, Express, WebSockets (`ws`).
* **High-Performance Logic Engine**: C++17 native binary, Standard Template Library (STL), custom Abstract Data Types.
* **Storage**: Local persistent storage for player profiles, streaks, and the Saved Words Vault.

---

## 4. Algorithms & Data Structures

### 1. Duplicate Letter Detection (`hasDuplicateLetters`)
* **Method**: Character iteration utilizing an associative set (`std::set<char>`).
* **Complexity**:
  * *Time*: $O(N \log N)$ worst-case, $O(1)$ best-case for early duplicates.
  * *Space*: $O(N)$ auxiliary memory for unique characters.

### 2. Two-Pass Wordle Guess Evaluation (`evaluateGuess`)
* **Method**:
  1. *Pass 1*: Identifies exact character and index matches (`GREEN`), marking them and adjusting the target character frequency map.
  2. *Pass 2*: For non-green positions, verifies whether the character exists in the remaining frequency map (`YELLOW`) or is absent (`GRAY`).
* **Complexity**:
  * *Time*: $O(N)$ linear time where $N \in \{4, 5, 6\}$.
  * *Space*: $O(N)$ for character frequency tracking and 1D state vectors.

### 3. 2D Game Board Matrix (`gameBoard[6][6]`)
* **Method**: Direct coordinate indexing `gameBoard[row][col]`.
* **Complexity**: $O(1)$ bounded constant time and $O(1)$ contiguous memory.

### 4. Custom Stack Implementation (`HintStack`)
* **Method**: Array-based Last-In, First-Out (LIFO) pointer arithmetic.
* **Complexity**: Push $O(1)$, Pop $O(1)$, Peek $O(1)$.

### 5. Custom Queue Implementation (`PlayerQueue` & `CircularQueue`)
* **Method**: Array-based First-In, First-Out (FIFO) with front/rear ring buffer indices.
* **Complexity**: Enqueue $O(1)$, Dequeue $O(1)$, Front $O(1)$.

### 6. STL Containers Utilized

| Container / Feature | Application in WordRush Arena | Performance Characteristics |
| :--- | :--- | :--- |
| **`std::vector`** | Dictionary lexicon, round history, past guess vectors | Contiguous cache locality, $O(1)$ random access. |
| **`std::set`** | Duplicate letter validation in secret words | Unique element enforcement, $O(N \log N)$ verification. |
| **`std::map`** | Room code lookup, character frequency calculation | Ordered logarithmic search $O(\log N)$. |
| **`std::deque`** | Bounded match event notifications | Fast $O(1)$ push at back and $O(1)$ pop at front. |
| **`std::pair`** | Player-score tuples | Lightweight key-value pairing without overhead. |

---

## 5. Rules of the Arena

### Secret Word Criteria
1. Must exist in the recognized dictionary lexicon.
2. Must match the designated match length (4, 5, or 6 letters).
3. Must contain **no repeated letters** (e.g. `CRANE` is valid, `APPLE` is invalid).

### Guessing Criteria
1. Guesses must be valid dictionary words of matching length.
2. Guesses may contain repeated letters.
3. The guesser has up to 6 attempts to deduce the secret word.

### Scoring Dynamics
* **Word Deciphered**: $+10$ base points.
* **Speed / Attempts Bonus**: $+(\text{Max Attempts} - \text{Attempts Used} + 1) \times 2$ points.
* **Unused Hints Bonus**: $+1$ point per unused free hint.
* **Extra Hint Penalty**: $-1$ point per additional hint consumed beyond free allocation.
* **Setter Defending Bonus**: If the guesser fails to solve within 6 tries, the word setter earns $+10$ points.

---

## 6. Project Structure

```
WORDRUSH/
├── backend/                        # C++ High-Performance Logic Engine
│   ├── engine.cpp                  # CLI dispatch interface (JSON-RPC)
│   ├── validator.cpp               # Word validation & two-pass evaluator
│   ├── matchmaker.cpp              # Room code generation & player queues
│   ├── dictionary.cpp             # Lexicon loader & fast lookup
│   ├── hints.cpp                   # Context clue generator & solver
│   └── wordrush_engine.exe         # Compiled native binary
├── public/                         # Static assets & dictionary wordlists
│   └── dictionary.txt              # Standard English word bank
├── src/                            # React 19 Client Application
│   ├── components/                 # UI components
│   │   ├── AnagramSolver.jsx       # Unscramble modal
│   │   ├── GameBoard.jsx           # Grid display
│   │   ├── GameEntranceModal.jsx   # Mode & difficulty selection
│   │   ├── Keyboard.jsx            # Unified virtual & physical keyboard
│   │   ├── LetterTile.jsx          # 3D Candy letter tiles
│   │   ├── Lobby.jsx               # Match waiting lobby
│   │   ├── UserDashboard.jsx       # Career stats & avatar selection
│   │   └── WordPuzzleGame.jsx      # Word puzzle adventure & saved vault
│   ├── services/
│   │   ├── socket.js               # WebSocket client & reconnect engine
│   │   └── audio.js                # Sound service
│   ├── utils/
│   │   ├── dictionary.js           # Multi-level word bank & definitions
│   │   └── wordClassifier.js       # Lexical type inspector
│   ├── App.jsx                     # Root application coordinator
│   ├── main.jsx                    # Application bootstrap
│   └── index.css                   # Theme styles & design system
├── server.js                       # Express & WebSocket server application
├── package.json                    # Project dependencies & build scripts
├── vite.config.js                  # Vite configuration & dev proxy
└── README.md                       # Project documentation
```

---

## 7. Setup & Running Instructions

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **g++ / MinGW-w64** (for compiling the C++ engine)

### 1. Install Dependencies
```bash
npm install
```

### 2. Build or Recompile the C++ Engine (Optional)
The pre-compiled binary is provided at `backend/wordrush_engine.exe`. To recompile:
```bash
g++ -O3 -std=c++17 backend/engine.cpp -o backend/wordrush_engine.exe
```

### 3. Run the Application
```bash
# Start the full-stack server (serves frontend & backend on port 3000)
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 8. License & Attribution
WordRush Arena is released under the MIT License. Developed with a focus on real-time multiplayer networking, low-level algorithmic efficiency, and modern web UI craftsmanship.
