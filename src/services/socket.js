// ============================================================================
// WORDRUSH ARENA - Hybrid Real-Time Networking Service (JavaScript)
// Supports Native WebSocket (Local/VPS) + WebRTC Peer-to-Peer (GitHub Pages)
// Allows players to create room, share 5-letter code, join, and play together
// ============================================================================

import { Peer } from "peerjs";

const ROOM_CODES = [
  "BLAZE", "STORM", "FROST", "SPARK", "VIPER", "TITAN", "SOLAR", "LUNAR",
  "SWORD", "CYBER", "EAGLE", "HAWK", "CROWN", "SHIELD", "ORBIT", "PULSE",
  "BRAVO", "MAGIC", "DELTA", "RAVEN", "TIGER", "COMET", "FLAME", "PRISM",
  "CHAMP", "ARROW", "NINJA", "LASER", "RIDER", "FORCE", "GHOST", "PIXEL",
];

function generateClientRoomCode() {
  const chosen = ROOM_CODES[Math.floor(Math.random() * ROOM_CODES.length)];
  return chosen.slice(0, 5).toUpperCase();
}

// Wordle Two-Pass Guess Deduction (identical to C++ engine logic)
function evaluateWordleGuess(secret, guess, wordLength) {
  const s = (secret || "").toUpperCase();
  const g = (guess || "").toUpperCase();
  const states = new Array(wordLength).fill(0);
  const targetFreq = new Map();

  for (let i = 0; i < wordLength; i++) {
    const char = s[i];
    targetFreq.set(char, (targetFreq.get(char) || 0) + 1);
  }

  // Pass 1: Exact matches (GREEN)
  for (let i = 0; i < wordLength; i++) {
    if (g[i] === s[i]) {
      states[i] = 2; // Green
      targetFreq.set(g[i], (targetFreq.get(g[i]) || 1) - 1);
    }
  }

  // Pass 2: Positional matches (YELLOW) or Absent (GRAY)
  for (let i = 0; i < wordLength; i++) {
    if (states[i] === 2) continue;
    const char = g[i];
    const count = targetFreq.get(char) || 0;
    if (count > 0) {
      states[i] = 1; // Yellow
      targetFreq.set(char, count - 1);
    } else {
      states[i] = 0; // Gray
    }
  }

  return states;
}

export function generateWheelLetters(secretWord) {
  if (!secretWord) return ["S", "A", "U", "C", "E", "T", "F"];
  const letters = secretWord.toUpperCase().split("");
  const vowels = ["A", "E", "I", "O", "U"];
  const consonants = ["R", "S", "T", "L", "N", "C", "D", "M", "P", "F", "G", "H", "B"];
  
  const targetTotal = Math.max(letters.length + 1, 7);
  const extraNeeded = targetTotal - letters.length;
  
  for (let i = 0; i < extraNeeded; i++) {
    const pool = i % 2 === 0 ? consonants : vowels;
    const available = pool.filter((c) => !letters.includes(c));
    const randomChar = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : pool[Math.floor(Math.random() * pool.length)];
    letters.push(randomChar);
  }

  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  return letters;
}

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.isConnected = false;
    this.messageQueue = [];
    this.localRoom = null;

    // WebRTC PeerJS state
    this.peer = null;
    this.activePeerConn = null;
    this.isHostPeer = false;

    // Cross-tab broadcast channel for instant local testing
    this.bc = null;
    try {
      if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
        this.bc = new BroadcastChannel("wordrush_arena_p2p_channel");
        this.bc.onmessage = (event) => {
          if (event?.data?.type) {
            this.handleIncomingP2PMessage(event.data.type, event.data.payload);
          }
        };
      }
    } catch {}
  }

  get connected() {
    return Boolean(this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN);
  }

  connect() {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      // If on GitHub Pages static deployment, rely on WebRTC P2P
      if (window.location.hostname.endsWith("github.io")) {
        this.isConnected = false;
        resolve(false);
        return;
      }

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.isConnected = true;
        resolve(true);
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let host = window.location.host;
      if (window.location.port === "5173") {
        host = `${window.location.hostname}:3000`;
      }
      const wsUrl = `${protocol}//${host}`;

      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.isConnected = true;
          this.emitInternal("connection_status", { connected: true });
          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg && this.socket?.readyState === WebSocket.OPEN) {
              this.socket.send(msg);
            }
          }
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { type, payload } = data;
            this.emitInternal(type, payload);
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        this.socket.onclose = () => {
          this.isConnected = false;
          this.emitInternal("connection_status", { connected: false });
          this.scheduleReconnect();
        };

        this.socket.onerror = () => {
          this.isConnected = false;
          this.emitInternal("connection_status", { connected: false });
          resolve(false);
        };
      } catch {
        resolve(false);
      }
    });
  }

  scheduleReconnect() {
    if (typeof window !== "undefined" && window.location.hostname.endsWith("github.io")) {
      return;
    }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  send(type, payload = {}) {
    // 1. If native WebSocket is active, send over server WebSocket
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
      return;
    }

    // 2. If WebRTC P2P DataChannel is active, transmit directly to peer
    if (this.activePeerConn && this.activePeerConn.open) {
      try {
        this.activePeerConn.send({ type, payload });
      } catch {}
    }

    // 3. Broadcast across tabs for instant multi-tab testing
    if (this.bc) {
      try {
        this.bc.postMessage({ type, payload });
      } catch {}
    }

    // 4. Client P2P Simulation Engine (acts as local authoritative host)
    this.handleClientSimulation(type, payload);
  }

  initPeerHost(roomCode) {
    try {
      if (this.peer) {
        try { this.peer.destroy(); } catch {}
      }
      const peerId = `wordrush-${roomCode.toLowerCase()}`;
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on("open", () => {
        this.isHostPeer = true;
      });

      this.peer.on("connection", (conn) => {
        this.activePeerConn = conn;
        conn.on("open", () => {
          if (this.localRoom) {
            conn.send({ type: "ROOM_SYNC", payload: this.localRoom });
          }
        });
        conn.on("data", (data) => {
          if (data?.type) {
            this.handleIncomingP2PMessage(data.type, data.payload);
          }
        });
        conn.on("close", () => {
          this.emitInternal("PLAYER_DISCONNECTED", { message: "Opponent disconnected." });
        });
      });

      this.peer.on("error", (err) => {
        console.warn("PeerJS host notice:", err?.message || err);
      });
    } catch (e) {
      console.warn("PeerJS init host notice:", e?.message || e);
    }
  }

  initPeerJoin(roomCode, joinPayload) {
    try {
      if (this.peer) {
        try { this.peer.destroy(); } catch {}
      }
      this.peer = new Peer({ debug: 1 });

      this.peer.on("open", () => {
        const targetPeerId = `wordrush-${roomCode.toLowerCase()}`;
        const conn = this.peer.connect(targetPeerId, { reliable: true });
        this.activePeerConn = conn;

        conn.on("open", () => {
          conn.send({ type: "P2P_JOIN_REQUEST", payload: joinPayload });
        });

        conn.on("data", (data) => {
          if (data?.type) {
            this.handleIncomingP2PMessage(data.type, data.payload);
          }
        });

        conn.on("close", () => {
          this.emitInternal("PLAYER_DISCONNECTED", { message: "Host left the room." });
        });
      });

      this.peer.on("error", (err) => {
        console.warn("PeerJS join notice:", err?.message || err);
      });
    } catch (e) {
      console.warn("PeerJS init join notice:", e?.message || e);
    }
  }

  handleIncomingP2PMessage(type, payload) {
    // If we are host and received a guest join request:
    if ((type === "P2P_JOIN_REQUEST" || type === "JOIN_ROOM") && this.localRoom) {
      if (!this.localRoom.players[1] || this.localRoom.players[1].playerId === payload.playerId) {
        this.localRoom.players[1] = {
          playerId: payload.playerId || "p2_" + Math.random().toString(36).substring(2, 8),
          username: payload.username || "Challenger",
          score: 0,
          readyStatus: false,
          connectionStatus: true,
          roundsWon: 0,
          wordsGuessed: 0,
          hintsUsed: 0,
          profile: {
            username: payload.username || "Challenger",
            avatar: payload.avatar || "🐻",
          },
        };
        this.localRoom.playerCount = 2;
        this.localRoom.recentEvents = this.localRoom.recentEvents || [];
        this.localRoom.recentEvents.push(`${payload.username || "Challenger"} joined the room!`);

        try {
          localStorage.setItem(`wordrush_active_room_${this.localRoom.roomCode}`, JSON.stringify(this.localRoom));
        } catch {}

        const syncMsg = { type: "ROOM_SYNC", payload: this.localRoom };
        const joinedMsg = { type: "JOINED_SUCCESS", payload: { roomCode: this.localRoom.roomCode, room: this.localRoom } };

        if (this.activePeerConn && this.activePeerConn.open) {
          try {
            this.activePeerConn.send(joinedMsg);
            this.activePeerConn.send(syncMsg);
          } catch {}
        }
        if (this.bc) {
          try {
            this.bc.postMessage(joinedMsg);
            this.bc.postMessage(syncMsg);
          } catch {}
        }

        this.emitInternal("ROOM_SYNC", this.localRoom);
      }
      return;
    }

    // Direct event dispatch
    this.emitInternal(type, payload);
    if (type === "ROOM_SYNC" && payload) {
      this.localRoom = payload;
    }
  }

  handleClientSimulation(type, payload) {
    switch (type) {
      case "CREATE_ROOM": {
        const roomCode = generateClientRoomCode();
        const hostPlayer = {
          playerId: payload.playerId || "p_" + Math.random().toString(36).substring(2, 8),
          username: payload.username || "Player",
          score: 0,
          readyStatus: false,
          connectionStatus: true,
          roundsWon: 0,
          wordsGuessed: 0,
          hintsUsed: 0,
          profile: {
            username: payload.username || "Player",
            avatar: payload.avatar || "🦊",
            totalGamesPlayed: 0,
            totalWins: 0,
            totalLosses: 0,
            totalDraws: 0,
            totalPoints: 0,
          },
        };

        this.localRoom = {
          roomCode,
          players: [hostPlayer, null],
          playerCount: 1,
          wordLength: Number(payload.wordLength) || 5,
          totalRounds: Number(payload.totalRounds) || 3,
          currentRoundIndex: 0,
          wordSetterIndex: 0,
          guesserIndex: 1,
          phase: "LOBBY",
          currentRound: null,
          roundHistory: [],
          recentEvents: [`Room ${roomCode} created by ${hostPlayer.username}`],
          hints: [],
          createdAt: Date.now(),
        };

        this.initPeerHost(roomCode);
        try {
          localStorage.setItem(`wordrush_active_room_${roomCode}`, JSON.stringify(this.localRoom));
        } catch {}
        this.dispatchRoomUpdate("ROOM_CREATED", { roomCode, room: this.localRoom });
        this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        break;
      }

      case "CREATE_BOT_MATCH": {
        const roomCode = generateClientRoomCode();
        const wLen = Number(payload.wordLength) || 5;
        const hostPlayer = {
          playerId: payload.playerId || "p_" + Math.random().toString(36).substring(2, 8),
          username: payload.username || "Player",
          score: 0,
          readyStatus: true,
          connectionStatus: true,
          roundsWon: 0,
          wordsGuessed: 0,
          hintsUsed: 0,
          profile: {
            username: payload.username || "Player",
            avatar: payload.avatar || "🦊",
          },
        };

        const botPlayer = {
          playerId: "bot_cyber_arena",
          username: "CyberBot",
          score: 0,
          readyStatus: true,
          connectionStatus: true,
          roundsWon: 0,
          wordsGuessed: 0,
          hintsUsed: 0,
          isBot: true,
          profile: {
            username: "CyberBot",
            avatar: "🤖",
          },
        };

        const initialRound = {
          roundNumber: 1,
          secretWord: "",
          wordSetterId: hostPlayer.playerId,
          guesserId: botPlayer.playerId,
          gameBoard: Array(6).fill(null).map(() => Array(wLen).fill("")),
          boardStates: Array(6).fill(null).map(() => Array(wLen).fill(0)),
          attemptsUsed: 0,
          hintsUsed: 0,
          freeHintsRemaining: wLen === 4 ? 3 : wLen === 6 ? 1 : 2,
          extraHintsUsed: 0,
          completed: false,
          wordFound: false,
          roundWinnerId: "",
          wheelLetters: [],
          hints: [],
        };

        this.localRoom = {
          roomCode,
          players: [hostPlayer, botPlayer],
          playerCount: 2,
          wordLength: wLen,
          totalRounds: Number(payload.totalRounds) || 3,
          currentRoundIndex: 0,
          wordSetterIndex: 0,
          guesserIndex: 1,
          phase: "WORD_SELECTION",
          currentRound: initialRound,
          roundHistory: [],
          recentEvents: [`Battle room ${roomCode} initialized with CyberBot 🤖! Set your secret cipher!`],
          hints: [],
          createdAt: Date.now(),
        };

        this.dispatchRoomUpdate("ROOM_CREATED", { roomCode, room: this.localRoom });
        this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        break;
      }

      case "JOIN_ROOM": {
        const code = (payload.roomCode || "").toUpperCase().trim();
        this.initPeerJoin(code, payload);

        // If room is present locally in same browser tab/window:
        if (this.localRoom && this.localRoom.roomCode === code) {
          if (!this.localRoom.players[1]) {
            this.localRoom.players[1] = {
              playerId: payload.playerId || "p2_" + Math.random().toString(36).substring(2, 8),
              username: payload.username || "Challenger",
              score: 0,
              readyStatus: false,
              connectionStatus: true,
              roundsWon: 0,
              wordsGuessed: 0,
              hintsUsed: 0,
              profile: {
                username: payload.username || "Challenger",
                avatar: payload.avatar || "🐻",
              },
            };
            this.localRoom.playerCount = 2;
          }
          this.dispatchRoomUpdate("JOINED_SUCCESS", { roomCode: code, room: this.localRoom });
          this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        }
        break;
      }

      case "UPDATE_CONFIG": {
        if (!this.localRoom) return;
        if (payload.wordLength) this.localRoom.wordLength = Number(payload.wordLength);
        if (payload.totalRounds) this.localRoom.totalRounds = Number(payload.totalRounds);
        this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        break;
      }

      case "UPDATE_PROFILE": {
        if (!this.localRoom) return;
        const p = this.localRoom.players.find((pl) => pl && pl.playerId === payload.playerId);
        if (p) {
          if (payload.username) p.username = payload.username;
          if (payload.avatar) p.profile.avatar = payload.avatar;
          this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        }
        break;
      }

      case "TOGGLE_READY": {
        if (!this.localRoom) return;
        const p = this.localRoom.players.find((pl) => pl && pl.playerId === payload.playerId);
        if (p) {
          p.readyStatus = !p.readyStatus;
          // If only 1 player and host readies, add CyberBot to start immediately
          if (this.localRoom.playerCount === 1 && p.readyStatus) {
            const botPlayer = {
              playerId: "bot_cyber_arena",
              username: "CyberBot",
              score: 0,
              readyStatus: true,
              connectionStatus: true,
              roundsWon: 0,
              wordsGuessed: 0,
              hintsUsed: 0,
              isBot: true,
              profile: { username: "CyberBot", avatar: "🤖" },
            };
            this.localRoom.players[1] = botPlayer;
            this.localRoom.playerCount = 2;
          }

          const bothReady = this.localRoom.players.length === 2 &&
            this.localRoom.players[0]?.readyStatus &&
            this.localRoom.players[1]?.readyStatus;

          if (bothReady && this.localRoom.phase === "LOBBY") {
            const wLen = this.localRoom.wordLength;
            this.localRoom.phase = "WORD_SELECTION";
            this.localRoom.currentRoundIndex = 0;
            this.localRoom.wordSetterIndex = 0;
            this.localRoom.guesserIndex = 1;
            this.localRoom.currentRound = {
              roundNumber: 1,
              secretWord: "",
              wordSetterId: this.localRoom.players[0].playerId,
              guesserId: this.localRoom.players[1].playerId,
              gameBoard: Array(6).fill(null).map(() => Array(wLen).fill("")),
              boardStates: Array(6).fill(null).map(() => Array(wLen).fill(0)),
              attemptsUsed: 0,
              hintsUsed: 0,
              freeHintsRemaining: wLen === 4 ? 3 : wLen === 6 ? 1 : 2,
              extraHintsUsed: 0,
              completed: false,
              wordFound: false,
              roundWinnerId: "",
              wheelLetters: [],
              hints: [],
            };
          }
          this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        }
        break;
      }

      case "SUBMIT_SECRET_WORD": {
        if (!this.localRoom || !this.localRoom.currentRound) return;
        const word = (payload.secretWord || payload.word || "").toUpperCase().trim();
        this.localRoom.currentRound.secretWord = word;
        this.localRoom.currentRound.wheelLetters = generateWheelLetters(word);
        this.localRoom.phase = "GUESSING";
        try {
          localStorage.setItem(`wordrush_active_room_${this.localRoom.roomCode}`, JSON.stringify(this.localRoom));
        } catch {}

        // If guesser is bot, bot makes an automated guess
        const guesser = this.localRoom.players[this.localRoom.guesserIndex];
        if (guesser && guesser.isBot) {
          setTimeout(() => {
            if (!this.localRoom || !this.localRoom.currentRound || this.localRoom.currentRound.completed) return;
            this.send("SUBMIT_GUESS", {
              roomCode: this.localRoom.roomCode,
              playerId: guesser.playerId,
              guess: word,
            });
          }, 2000);
        }

        this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        break;
      }

      case "SUBMIT_GUESS": {
        if (!this.localRoom || !this.localRoom.currentRound) return;
        const round = this.localRoom.currentRound;
        const guess = (payload.guess || "").toUpperCase().trim();
        const wLen = this.localRoom.wordLength;
        const secret = round.secretWord;

        const attemptIdx = round.attemptsUsed;
        if (attemptIdx < 6) {
          round.gameBoard[attemptIdx] = guess.split("");
          const states = evaluateWordleGuess(secret, guess, wLen);
          round.boardStates[attemptIdx] = states;
          round.attemptsUsed++;

          const isCorrect = guess === secret;
          this.emitInternal("GUESS_FEEDBACK", { isCorrect, guess, attemptIndex: attemptIdx });

          if (isCorrect || round.attemptsUsed >= 6) {
            round.completed = true;
            round.wordFound = isCorrect;
            const guesser = this.localRoom.players[this.localRoom.guesserIndex];
            const setter = this.localRoom.players[this.localRoom.wordSetterIndex];

            if (isCorrect && guesser) {
              round.roundWinnerId = guesser.playerId;
              guesser.score += (7 - round.attemptsUsed) * 25 + 50;
              guesser.wordsGuessed++;
              guesser.roundsWon++;
            } else if (!isCorrect && setter) {
              round.roundWinnerId = setter.playerId;
              setter.score += 80;
              setter.roundsWon++;
            }

            this.localRoom.roundHistory.push({ ...round });

            this.emitInternal("ROUND_ENDED", {
              wordFound: round.wordFound,
              winnerId: round.roundWinnerId,
              secretWord: round.secretWord,
            });

            if (this.localRoom.currentRoundIndex + 1 >= this.localRoom.totalRounds) {
              this.localRoom.phase = "GAME_OVER";
              this.emitInternal("GAME_OVER", { room: this.localRoom });
            } else {
              this.localRoom.phase = "ROUND_RESULT";
            }
            try {
              localStorage.setItem(`wordrush_active_room_${this.localRoom.roomCode}`, JSON.stringify(this.localRoom));
            } catch {}
          }
        }
        this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        break;
      }

      case "REQUEST_HINT": {
        if (!this.localRoom || !this.localRoom.currentRound) return;
        const round = this.localRoom.currentRound;
        const secret = round.secretWord;
        round.hintsUsed = (round.hintsUsed || 0) + 1;
        if (round.freeHintsRemaining > 0) round.freeHintsRemaining--;

        let hintText = `Starts with '${secret[0]}' and has ${secret.length} letters.`;
        if (round.hintsUsed === 2) {
          hintText = `Ends with '${secret[secret.length - 1]}' (Pattern: ${secret[0]}${"_".repeat(secret.length - 2)}${secret[secret.length - 1]}).`;
        } else if (round.hintsUsed >= 3) {
          const vowels = secret.split("").filter((c) => "AEIOU".includes(c));
          hintText = `Contains vowels: ${vowels.length > 0 ? vowels.join(", ") : "no common vowels"}.`;
        }

        this.emitInternal("HINT_REVEALED", { hintText, hintsUsed: round.hintsUsed });
        this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        break;
      }

      case "PROCEED_NEXT_ROUND": {
        if (!this.localRoom) return;
        const nextIdx = this.localRoom.currentRoundIndex + 1;
        if (nextIdx < this.localRoom.totalRounds) {
          this.localRoom.currentRoundIndex = nextIdx;
          this.localRoom.wordSetterIndex = (this.localRoom.wordSetterIndex + 1) % 2;
          this.localRoom.guesserIndex = (this.localRoom.guesserIndex + 1) % 2;
          this.localRoom.phase = "WORD_SELECTION";
          const wLen = this.localRoom.wordLength;

          const setterId = this.localRoom.players[this.localRoom.wordSetterIndex].playerId;
          const guesserId = this.localRoom.players[this.localRoom.guesserIndex].playerId;

          this.localRoom.currentRound = {
            roundNumber: nextIdx + 1,
            secretWord: "",
            wordSetterId: setterId,
            guesserId: guesserId,
            gameBoard: Array(6).fill(null).map(() => Array(wLen).fill("")),
            boardStates: Array(6).fill(null).map(() => Array(wLen).fill(0)),
            attemptsUsed: 0,
            hintsUsed: 0,
            freeHintsRemaining: wLen === 4 ? 3 : wLen === 6 ? 1 : 2,
            extraHintsUsed: 0,
            completed: false,
            wordFound: false,
            roundWinnerId: "",
            wheelLetters: [],
            hints: [],
          };

          const setter = this.localRoom.players[this.localRoom.wordSetterIndex];
          if (setter && setter.isBot) {
            const botWords = wLen === 4 ? ["ARCH", "BOLD", "COLD", "DARK", "FAST"] :
              wLen === 6 ? ["CASTLE", "CIPHER", "DRAGON", "KNIGHT", "MAGIC"] :
              ["BLAZE", "CRANE", "FLAME", "PRISM", "SWORD", "VIPER"];
            const chosen = botWords[Math.floor(Math.random() * botWords.length)];
            setTimeout(() => {
              this.send("SUBMIT_SECRET_WORD", {
                roomCode: this.localRoom.roomCode,
                playerId: setter.playerId,
                secretWord: chosen,
              });
            }, 1200);
          }
          try {
            localStorage.setItem(`wordrush_active_room_${this.localRoom.roomCode}`, JSON.stringify(this.localRoom));
          } catch {}
        }
        this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        break;
      }

      case "REMATCH": {
        if (!this.localRoom) return;
        this.localRoom.phase = "LOBBY";
        this.localRoom.currentRoundIndex = 0;
        this.localRoom.roundHistory = [];
        this.localRoom.players.forEach((p) => {
          if (p) {
            p.score = 0;
            p.readyStatus = false;
          }
        });
        this.localRoom.currentRound = null;
        this.dispatchRoomUpdate("ROOM_SYNC", this.localRoom);
        break;
      }

      case "LEAVE_ROOM": {
        this.localRoom = null;
        break;
      }
    }
  }

  dispatchRoomUpdate(type, payload) {
    this.emitInternal(type, payload);
    if (this.activePeerConn && this.activePeerConn.open) {
      try {
        this.activePeerConn.send({ type, payload });
      } catch {}
    }
    if (this.bc) {
      try {
        this.bc.postMessage({ type, payload });
      } catch {}
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    return () => {
      this.off(type, callback);
    };
  }

  off(type, callback) {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(callback);
    }
  }

  emitInternal(type, data) {
    const set = this.listeners.get(type);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in socket listener for '${type}':`, e);
        }
      });
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
      this.peer = null;
    }
    this.isConnected = false;
  }
}

export const socketService = new SocketService();

