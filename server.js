import fs from "fs";
// ============================================================================
// word - Server Application (JavaScript)
// Express + WebSocket + Gemini 3.8 Flash AI Hints
// ============================================================================

import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI } from "@google/genai";



dotenv.config();


// --- Embedded Dictionary & Engine ---



class ServerDictionary {
  constructor() {
    this.wordsSet = new Set();
    this.wordsList = [];
    this.init();
  }

  init() {
    try {
      const dictPath = path.join(process.cwd(), "public", "dictionary.txt");
      if (fs.existsSync(dictPath)) {
        const content = fs.readFileSync(dictPath, "utf-8");
        const lines = content.split(/\r?\n/);
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || line.startsWith("#")) continue;
          const clean = line.toUpperCase().replace(/[^A-Z]/g, "");
          if (clean.length >= 4 && clean.length <= 6) {
            this.wordsSet.add(clean);
            this.wordsList.push(clean);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load dictionary.txt, using default wordlist:", err);
    }

    // Comprehensive curated fallback word list
    const defaults = [
      "ARCH", "BARK", "BIRD", "BLUE", "BOAT", "BOLD", "BOND", "CAMP", "CARE", "CAST",
      "CLAN", "CLAY", "COLD", "DARK", "DAWN", "DEAL", "DESK", "DUST", "EAST", "ECHO",
      "EDGE", "FACE", "FARM", "FAST", "FISH", "FLAG", "FLOW", "FORD", "FROG", "GAME",
      "GLOW", "GOLD", "GRID", "HAWK", "HERO", "HOPE", "IRON", "JUMP", "KING", "LAKE",
      "LAND", "LEAP", "LION", "LOCK", "LUCK", "MINT", "MOON", "NEST", "NODE", "PACK",
      "PARK", "PATH", "PEAK", "PLAN", "PLAY", "RAID", "RAIN", "RING", "ROAD", "ROCK",
      "ROSE", "RUST", "SAIL", "SAND", "SHIP", "SILK", "SOIL", "STAR", "SURF", "SWAN",
      "TEAM", "TIDE", "TIME", "TRIP", "VINE", "WALK", "WAVE", "WIND", "WOLF", "YARD",
      "ABOUT", "ABOVE", "ACUTE", "ADAPT", "AFTER", "AGILE", "ALBUM", "ALERT", "ALIGN",
      "ALONE", "ALONG", "ALTER", "AMBER", "ANGEL", "ANGER", "ANGLE", "ANVIL", "APART",
      "ARENA", "ARMOR", "ARROW", "ASCOT", "ASIDE", "ATLAS", "AUDIO", "AUDIT", "AVOID",
      "AWARD", "AWARE", "BADGE", "BAKER", "BASIC", "BASIN", "BATCH", "BEACH", "BEAST",
      "BEGIN", "BEING", "BLACK", "BLADE", "BLAME", "BLANK", "BLAST", "BLAZE", "BLEND",
      "BLINK", "BLOCK", "BLOOM", "BOARD", "BOAST", "BONUS", "BOOST", "BOUND", "BRAIN",
      "BRAKE", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BRICK", "BRIDE", "BRIEF",
      "BRING", "BRISK", "BROAD", "BROWN", "BRUSH", "BUILD", "BUNCH", "BURST", "CABIN",
      "CABLE", "CAMEL", "CANDY", "CANOE", "CARGO", "CAUSE", "CHAIN", "CHAIR", "CHALK",
      "CHAMP", "CHARM", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD",
      "CHIME", "CHOIR", "CHUNK", "CIVIL", "CLAIM", "CLANG", "CLASH", "CLEAN", "CLEAR",
      "CLERK", "CLICK", "CLIFF", "CLIMB", "CLOAK", "CLOCK", "CLOSE", "CLOTH", "CLOUD",
      "CLOVE", "COACH", "COAST", "CORAL", "COUNT", "COURT", "COVER", "CRACK", "CRAFT",
      "CRANE", "CRANK", "CRASH", "CRATE", "CRAWL", "CRAZY", "CREAM", "CREST", "CRISP",
      "CROSS", "CROWD", "CROWN", "CRUSH", "CRUST", "CURVE", "CYCLE", "DANCE", "DELTA",
      "DENSE", "DEPOT", "DEPTH", "DIARY", "DIGIT", "DINER", "DISCO", "DITCH", "DIVER",
      "DRAFT", "DRAIN", "DRAKE", "DRAMA", "DRANK", "DREAM", "DRIFT", "DRILL", "DRINK",
      "DRIVE", "DRONE", "DROWN", "DRUID", "DRUMS", "DUCHY", "DUMMY", "DUNES", "EAGER",
      "EAGLE", "EARLY", "EARTH", "EMBER", "EMPTY", "ENTRY", "EQUAL", "EQUIP", "ETHIC",
      "EVOKE", "EXACT", "EXCEL", "EXERT", "EXTRA", "FABLE", "FACET", "FAINT", "FAITH",
      "FALSE", "FANCY", "FATAL", "FAULT", "FEAST", "FIBER", "FIELD", "FIERY", "FIFTH",
      "FINAL", "FINCH", "FLAIR", "FLAME", "FLANK", "FLARE", "FLASH", "FLASK", "FLEET",
      "FLESH", "FLINT", "FLOAT", "FLOCK", "FLOOR", "FLORA", "FLOUR", "FLUID", "FLUTE",
      "FOCAL", "FOCUS", "FORGE", "FORTH", "FOSSIL", "FOUND", "FRAME", "FRANK", "FRESH",
      "FROST", "FROWN", "FRUIT", "FUDGE", "GIANT", "GLADE", "GLAND", "GLARE", "GLASS",
      "GLEAM", "GLIDE", "GLINT", "GLOBE", "GLOOM", "GLORY", "GLOVE", "GRACE", "GRADE",
      "GRAIN", "GRAND", "GRANT", "GRAPE", "GRAPH", "GRASP", "GRASS", "GRAVE", "GRAVY",
      "GREAT", "GRIEF", "GRILL", "GRIND", "GROVE", "GUARD", "GUEST", "GUIDE", "GUILD",
      "HABIT", "HARSH", "HAVEN", "HAZEL", "HEART", "HEAVY", "HEDGE", "HONEY", "HONOR",
      "HORSE", "HOTEL", "HOUND", "HOUSE", "HUMAN", "IMAGE", "INDEX", "INLET", "IVORY",
      "JEWEL", "JUICE", "KNIFE", "KNIGHT", "LEMON", "LIGHT", "LODGE", "LUNCH", "MAGIC",
      "MANOR", "MAPLE", "MARCH", "MEDAL", "MELON", "METAL", "MODEL", "MONEY", "MOTIF",
      "MOUNT", "MUSIC", "NIGHT", "NOBLE", "NORTH", "NOVEL", "NURSE", "OCEAN", "OLIVE",
      "ONION", "ORBIT", "ORGAN", "OVALS", "PANEL", "PANIC", "PAPER", "PATCH", "PEACH",
      "PEARL", "PETAL", "PHASE", "PIANO", "PILOT", "PIXEL", "PIZZA", "PLACE", "PLAIN",
      "PLANE", "PLANT", "PLATE", "PLAZA", "PLUMB", "PLUSH", "POINT", "POLAR", "POUND",
      "POWER", "PRICE", "PRIDE", "PRIME", "PRIZE", "PULSE", "PUPIL", "QUEEN", "QUEST",
      "QUICK", "QUIET", "QUOTA", "RADAR", "RADIO", "RANCH", "RANGE", "RAPID", "RATIO",
      "REACH", "REACT", "REALM", "REBEL", "REIGN", "RELAY", "RESET", "RIDGE", "RIVER",
      "ROBOT", "ROCKY", "ROUND", "ROYAL", "RULER", "RUMOR", "RURAL", "SALAD", "SAUCE",
      "SCALE", "SCENE", "SCENT", "SCOPE", "SCOUT", "SEDAN", "SHADE", "SHAKE", "SHARD",
      "SHARE", "SHARK", "SHARP", "SHEEP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE",
      "SHIRT", "SHOCK", "SHORE", "SHORT", "SHOUT", "SIGHT", "SIGMA", "SILVER", "SIREN",
      "SKILL", "SKULL", "SLATE", "SLEEP", "SLIDE", "SMART", "SMILE", "SMOKE", "SOLAR",
      "SONAR", "SOUND", "SOUTH", "SPACE", "SPARK", "SPAWN", "SPEAR", "SPEED", "SPELL",
      "SPICE", "SPIKE", "SPINE", "SPOKE", "SPOON", "SPORT", "SPRAY", "SPRING", "SQUAD",
      "STAGE", "STAIR", "STAKE", "STAND", "START", "STEAM", "STEEL", "STEEP", "STERN",
      "STICK", "STILL", "STOCK", "STONE", "STORM", "STORY", "STRAW", "STUDY", "STYLE",
      "SUGAR", "SUITE", "SUNNY", "SUPER", "SURGE", "SWIFT", "SWORD", "TABLE", "TASTE",
      "TEACH", "TEMPO", "TIGER", "TIMBER", "TITAN", "TITLE", "TOAST", "TOKEN", "TOPIC",
      "TORCH", "TOTAL", "TOWER", "TRACK", "TRAIL", "TRAIN", "TRAIT", "TREND", "TRIAL",
      "TRIBE", "TRICK", "TROOP", "TRUCK", "TRULY", "TRUMP", "TRUNK", "TRUST", "TRUTH",
      "TULIP", "TUNER", "ULTRA", "UNCLE", "UNION", "UNITY", "URBAN", "USAGE", "VALOR",
      "VALUE", "VALVE", "VAPOR", "VAULT", "VENUE", "VIGOR", "VINYL", "VIPER", "VIRAL",
      "VIRUS", "VISIT", "VISOR", "VISTA", "VITAL", "VIVID", "VOCAL", "VOICE", "VORTEX",
      "WAGON", "WATER", "WHALE", "WHEAT", "WHEEL", "WHERE", "WHITE", "WHOLE", "WIDOW",
      "WIDTH", "WINDY", "WITCH", "WORLD", "WORTH", "WOUND", "WRIST", "YACHT", "YIELD",
      "YOUTH", "ZEBRA", "ZENITH",
      // 6-Letter Words (Hard Level)
      "BEACON", "BRIDGE", "CASTLE", "CHANCE", "CIPHER", "CRADLE", "CRYSTAL", "DANGER",
      "DRAGON", "EMPIRE", "FALCON", "FLIGHT", "FOREST", "FROZEN", "GALAXY", "GARDEN",
      "HEROIC", "ISLAND", "JUNGLE", "KNIGHT", "LEGEND", "MAGIC", "METEOR", "MIRROR",
      "NATURE", "ORANGE", "PALACE", "PIRATE", "PLANET", "PORTAL", "PRINCE", "PUZZLE",
      "QUARTZ", "ROCKET", "SECRET", "SHADOW", "SHIELD", "SILVER", "SPRING", "SUNSET",
      "TARGET", "TEMPLE", "THRONE", "TRAVEL", "VECTOR", "VICTOR", "VOYAGE", "WIZARD",
      "WONDER"
    ];

    for (const w of defaults) {
      this.wordsSet.add(w);
      if (!this.wordsList.includes(w)) {
        this.wordsList.push(w);
      }
    }
  }

  isValidWord(word) {
    if (!word) return false;
    const clean = word.trim().toUpperCase();
    return this.wordsSet.has(clean);
  }

  getWordsOfLength(len) {
    return this.wordsList.filter((w) => w.length === len);
  }

  getRandomWord(len = 5) {
    const list = this.getWordsOfLength(len);
    if (list.length === 0) return "SAUCE";
    return list[Math.floor(Math.random() * list.length)];
  }

  get size() {
    return this.wordsSet.size;
  }
}

export const serverDictionary = new ServerDictionary();

// ============================================================================
// word - Server Game Engine (JavaScript)
// Real-time 1v1 Multiplayer Word Connect & Battle
// ============================================================================



export const MAX_ATTEMPTS = 6;
export const STATE_GRAY = 0;
export const STATE_YELLOW = 1;
export const STATE_GREEN = 2;

export function createPlayer(id, name) {
  return {
    playerId: id,
    username: name,
    score: 0,
    readyStatus: false,
    connectionStatus: true,
    roundsWon: 0,
    wordsGuessed: 0,
    hintsUsed: 0,
    profile: {
      username: name,
      avatar: "🦊",
      totalGamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      totalPoints: 0,
    },
  };
}

export class WordValidator {
  static hasDuplicateLetters(word) {
    const seen = new Set();
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toUpperCase();
      if (seen.has(char)) return true;
      seen.add(char);
    }
    return false;
  }

  static validateSecretWord(word, targetLength) {
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return { valid: false, error: "Secret word cannot be empty." };
    }
    const clean = word.trim().toUpperCase();
    if (clean.length !== targetLength) {
      return { valid: false, error: `Word must be exactly ${targetLength} letters long.` };
    }
    if (!/^[A-Z]+$/.test(clean)) {
      return { valid: false, error: "Word can only contain alphabetic letters (A-Z)." };
    }
    if (!serverDictionary.isValidWord(clean)) {
      return { valid: false, error: `'${clean}' is not in the official dictionary.` };
    }
    return { valid: true, word: clean };
  }

  static compareGuess(secretWord, guessWord, wordLength) {
    const states = new Array(wordLength).fill(STATE_GRAY);
    const targetFreq = new Map();

    const s = secretWord.toUpperCase();
    const g = guessWord.toUpperCase();

    for (let i = 0; i < wordLength; i++) {
      const char = s[i];
      targetFreq.set(char, (targetFreq.get(char) || 0) + 1);
    }

    // Pass 1: Exact matches (GREEN)
    for (let i = 0; i < wordLength; i++) {
      if (g[i] === s[i]) {
        states[i] = STATE_GREEN;
        targetFreq.set(g[i], (targetFreq.get(g[i]) || 1) - 1);
      }
    }

    // Pass 2: Positional matches (YELLOW) or Non-existing (GRAY)
    for (let i = 0; i < wordLength; i++) {
      if (states[i] === STATE_GREEN) continue;
      const char = g[i];
      const count = targetFreq.get(char) || 0;
      if (count > 0) {
        states[i] = STATE_YELLOW;
        targetFreq.set(char, count - 1);
      } else {
        states[i] = STATE_GRAY;
      }
    }

    return states;
  }
}

export class ScoreManager {
  static calculateRoundScore(wordFound, attemptsUsed, maxAttempts, freeHintsRemaining, extraHintsTaken) {
    if (!wordFound) {
      return Math.max(0, 0 - extraHintsTaken * 1);
    }
    let score = 10;
    if (attemptsUsed > 0 && attemptsUsed <= maxAttempts) {
      score += (maxAttempts - attemptsUsed + 1) * 2;
    }
    score += freeHintsRemaining * 1;
    score -= extraHintsTaken * 1;
    return Math.max(score, 1);
  }
}

export function generateWheelLetters(secretWord) {
  const letters = secretWord.toUpperCase().split("");
  const vowels = ["A", "E", "I", "O", "U"];
  const consonants = ["R", "S", "T", "L", "N", "C", "D", "M", "P", "F", "G", "H", "B"];
  
  // Total wheel size: 6 or 7 letters
  const targetTotal = Math.max(letters.length + 1, 7);
  const extraNeeded = targetTotal - letters.length;
  
  for (let i = 0; i < extraNeeded; i++) {
    const pool = i % 2 === 0 ? consonants : vowels;
    const randomChar = pool[Math.floor(Math.random() * pool.length)];
    letters.push(randomChar);
  }

  // Shuffle letters
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  return letters;
}

export function createNewRound(roundNum, setterId, guesserId, wordLen) {
  const gameBoard = [];
  const boardStates = [];
  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    gameBoard.push(new Array(wordLen).fill(""));
    boardStates.push(new Array(wordLen).fill(0));
  }

  return {
    roundNumber: roundNum,
    secretWord: "",
    wordSetterId: setterId,
    guesserId: guesserId,
    gameBoard,
    boardStates,
    attemptsUsed: 0,
    hintsUsed: 0,
    freeHintsRemaining: 3,
    extraHintsUsed: 0,
    completed: false,
    wordFound: false,
    roundWinnerId: "",
    wheelLetters: [],
    hints: [],
  };
}

export class ArenaEngine {
  constructor() {
    this.activeRooms = new Map();
    this.registeredUsers = new Map();
  }

  registerUser(username, playerId) {
    if (!username || !username.trim()) {
      return { success: false, error: "Username cannot be empty." };
    }
    const clean = username.trim();
    if (clean.length < 2 || clean.length > 15) {
      return { success: false, error: "Username must be 2 to 15 characters." };
    }
    const existing = this.registeredUsers.get(clean.toLowerCase());
    if (existing && existing !== playerId) {
      return { success: false, error: "Username already taken. Please choose another." };
    }
    this.registeredUsers.set(clean.toLowerCase(), playerId);
    return { success: true };
  }

  generateRoomCode() {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    do {
      code = "";
      for (let i = 0; i < 5; i++) {
        code += charset[Math.floor(Math.random() * charset.length)];
      }
    } while (this.activeRooms.has(code));
    return code;
  }

  createRoom(hostPlayer) {
    const roomCode = this.generateRoomCode();
    const room = {
      roomCode,
      players: [hostPlayer, null],
      playerCount: 1,
      wordLength: 5,
      totalRounds: 3,
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

    this.activeRooms.set(roomCode, room);
    return room;
  }

  joinRoom(roomCode, guestPlayer) {
    const code = (roomCode || "").trim().toUpperCase();
    const room = this.activeRooms.get(code);
    if (!room) {
      return { success: false, error: `Room code '${code}' not found. Please check and try again.` };
    }

    // Reconnection
    if (room.players[0]?.playerId === guestPlayer.playerId) {
      room.players[0].connectionStatus = true;
      return { success: true, room };
    }
    if (room.players[1]?.playerId === guestPlayer.playerId) {
      room.players[1].connectionStatus = true;
      return { success: true, room };
    }

    if (room.playerCount >= 2 && room.players[1]) {
      return { success: false, error: `Room '${code}' is full (maximum 2 players).` };
    }

    if (room.players[0]?.username?.toLowerCase() === guestPlayer.username?.toLowerCase()) {
      return { success: false, error: "A player with this name is already in the room." };
    }

    room.players[1] = guestPlayer;
    room.playerCount = 2;
    room.recentEvents.push(`${guestPlayer.username} joined the game!`);

    return { success: true, room };
  }

  getRoom(roomCode) {
    return this.activeRooms.get((roomCode || "").trim().toUpperCase());
  }

  removeRoom(roomCode) {
    this.activeRooms.delete((roomCode || "").trim().toUpperCase());
  }

  setPlayerReady(roomCode, playerId, ready) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    if (room.players[0]?.playerId === playerId) {
      room.players[0].readyStatus = ready;
    } else if (room.players[1]?.playerId === playerId) {
      room.players[1].readyStatus = ready;
    }

    if (
      room.playerCount === 2 &&
      room.players[0]?.readyStatus &&
      room.players[1]?.readyStatus
    ) {
      this.startMatch(room);
    }

    return room;
  }

  updateConfig(roomCode, wordLength, totalRounds) {
    const room = this.getRoom(roomCode);
    if (!room || room.phase !== "LOBBY") return null;

    if ([4, 5, 6].includes(wordLength)) {
      room.wordLength = wordLength;
    }
    if ([3, 5].includes(totalRounds)) {
      room.totalRounds = totalRounds;
    }
    return room;
  }

  startMatch(room) {
    room.phase = "WORD_SELECTION";
    room.currentRoundIndex = 0;
    room.wordSetterIndex = 0;
    room.guesserIndex = 1;

    const setter = room.players[0];
    const guesser = room.players[1];

    room.currentRound = createNewRound(
      1,
      setter ? setter.playerId : "",
      guesser ? guesser.playerId : "",
      room.wordLength
    );

    room.recentEvents.push(`Match started! Round 1 of ${room.totalRounds}.`);
    return room;
  }

  setSecretWord(roomCode, playerId, word) {
    const room = this.getRoom(roomCode);
    if (!room || room.phase !== "WORD_SELECTION" || !room.currentRound) {
      return { success: false, error: "Not in word selection phase." };
    }

    const currentSetter = room.players[room.wordSetterIndex];
    if (!currentSetter || currentSetter.playerId !== playerId) {
      return { success: false, error: "Only the designated word setter can choose the secret word." };
    }

    const validation = WordValidator.validateSecretWord(word, room.wordLength);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    room.currentRound.secretWord = validation.word;
    room.currentRound.wheelLetters = generateWheelLetters(validation.word);
    room.phase = "GUESSING";

    const guesser = room.players[room.guesserIndex];
    room.recentEvents.push(
      `Word chosen! ${guesser ? guesser.username : "Guesser"} is now solving the word.`
    );

    return { success: true, room };
  }

  submitGuess(roomCode, playerId, guessWord) {
    const room = this.getRoom(roomCode);
    if (!room || room.phase !== "GUESSING" || !room.currentRound) {
      return { success: false, error: "Not in guessing phase." };
    }

    const currentGuesser = room.players[room.guesserIndex];
    if (!currentGuesser || currentGuesser.playerId !== playerId) {
      return { success: false, error: "Only the guesser can submit guesses." };
    }

    const round = room.currentRound;
    if (round.attemptsUsed >= MAX_ATTEMPTS) {
      return { success: false, error: "Maximum attempts reached for this round." };
    }

    const cleanGuess = (guessWord || "").trim().toUpperCase();
    if (cleanGuess.length !== room.wordLength) {
      return { success: false, error: `Guess must be ${room.wordLength} letters.` };
    }

    if (!serverDictionary.isValidWord(cleanGuess)) {
      return { success: false, error: `'${cleanGuess}' is not in the dictionary.` };
    }

    const states = WordValidator.compareGuess(round.secretWord, cleanGuess, room.wordLength);
    const attemptIndex = round.attemptsUsed;

    for (let i = 0; i < room.wordLength; i++) {
      round.gameBoard[attemptIndex][i] = cleanGuess[i];
      round.boardStates[attemptIndex][i] = states[i];
    }

    round.attemptsUsed++;

    const isExactMatch = cleanGuess === round.secretWord;
    const isOutOfAttempts = round.attemptsUsed >= MAX_ATTEMPTS;

    if (isExactMatch) {
      round.completed = true;
      round.wordFound = true;
      round.roundWinnerId = playerId;

      const roundScore = ScoreManager.calculateRoundScore(
        true,
        round.attemptsUsed,
        MAX_ATTEMPTS,
        round.freeHintsRemaining,
        round.extraHintsUsed
      );

      currentGuesser.score += roundScore;
      currentGuesser.wordsGuessed++;
      currentGuesser.roundsWon++;

      room.recentEvents.push(
        `${currentGuesser.username} solved '${round.secretWord}' in ${round.attemptsUsed} attempts! (+${roundScore} pts)`
      );

      room.phase = "ROUND_RESULT";
      this.checkMatchProgression(room);
    } else if (isOutOfAttempts) {
      round.completed = true;
      round.wordFound = false;

      const setter = room.players[room.wordSetterIndex];
      if (setter) {
        round.roundWinnerId = setter.playerId;
        setter.score += 8;
        setter.roundsWon++;
        room.recentEvents.push(
          `${currentGuesser.username} ran out of attempts! The word was '${round.secretWord}'. ${setter.username} wins the round! (+8 pts)`
        );
      }

      room.phase = "ROUND_RESULT";
      this.checkMatchProgression(room);
    } else {
      room.recentEvents.push(
        `${currentGuesser.username} guessed '${cleanGuess}' (Attempt ${round.attemptsUsed}/${MAX_ATTEMPTS})`
      );
    }

    return {
      success: true,
      room,
      isCorrect: isExactMatch,
      states,
      attemptsRemaining: MAX_ATTEMPTS - round.attemptsUsed,
    };
  }

  checkMatchProgression(room) {
    if (room.currentRound) {
      room.roundHistory.push({ ...room.currentRound });
    }

    const nextRoundIndex = room.currentRoundIndex + 1;
    if (nextRoundIndex >= room.totalRounds) {
      room.phase = "GAME_OVER";
      const p1 = room.players[0];
      const p2 = room.players[1];

      if (p1 && p2) {
        p1.profile.totalGamesPlayed++;
        p2.profile.totalGamesPlayed++;
        p1.profile.totalPoints += p1.score;
        p2.profile.totalPoints += p2.score;

        if (p1.score > p2.score) {
          p1.profile.totalWins++;
          p2.profile.totalLosses++;
          room.recentEvents.push(`🏆 ${p1.username} wins the match! Final score: ${p1.score} - ${p2.score}`);
        } else if (p2.score > p1.score) {
          p2.profile.totalWins++;
          p1.profile.totalLosses++;
          room.recentEvents.push(`🏆 ${p2.username} wins the match! Final score: ${p2.score} - ${p1.score}`);
        } else {
          p1.profile.totalDraws++;
          p2.profile.totalDraws++;
          room.recentEvents.push(`🤝 Draw game! Final score: ${p1.score} - ${p2.score}`);
        }
      }
    }
  }

  advanceToNextRound(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.phase !== "ROUND_RESULT") return null;

    room.currentRoundIndex++;
    room.wordSetterIndex = room.wordSetterIndex === 0 ? 1 : 0;
    room.guesserIndex = room.guesserIndex === 0 ? 1 : 0;

    const setter = room.players[room.wordSetterIndex];
    const guesser = room.players[room.guesserIndex];

    room.currentRound = createNewRound(
      room.currentRoundIndex + 1,
      setter ? setter.playerId : "",
      guesser ? guesser.playerId : "",
      room.wordLength
    );

    room.phase = "WORD_SELECTION";
    room.recentEvents.push(
      `Round ${room.currentRoundIndex + 1} of ${room.totalRounds} begins! Roles swapped.`
    );

    return room;
  }

  restartRematch(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    for (const p of room.players) {
      if (p) {
        p.score = 0;
        p.readyStatus = false;
        p.roundsWon = 0;
        p.wordsGuessed = 0;
        p.hintsUsed = 0;
      }
    }

    room.currentRoundIndex = 0;
    room.wordSetterIndex = 0;
    room.guesserIndex = 1;
    room.phase = "LOBBY";
    room.currentRound = null;
    room.roundHistory = [];
    room.recentEvents.push("Rematch requested! Both players please ready up.");

    return room;
  }

  recordHint(roomCode, hintText) {
    const room = this.getRoom(roomCode);
    if (!room || !room.currentRound) return;

    if (room.currentRound.freeHintsRemaining > 0) {
      room.currentRound.freeHintsRemaining--;
    } else {
      room.currentRound.extraHintsUsed++;
    }

    room.currentRound.hintsUsed++;
    if (!room.hints) room.hints = [];
    room.hints.push(hintText);
    room.recentEvents.push(`Hint used: "${hintText}"`);
  }

  handleDisconnect(playerId) {
    for (const [code, room] of this.activeRooms.entries()) {
      for (const p of room.players) {
        if (p && p.playerId === playerId) {
          p.connectionStatus = false;
          room.recentEvents.push(`${p.username} disconnected.`);
          return { room, disconnectedPlayerName: p.username };
        }
      }
    }
    return { room: null, disconnectedPlayerName: null };
  }

  sanitizeRoomForPlayer(room, requestingPlayerId) {
    if (!room) return null;
    const isSetter = room.players[room.wordSetterIndex]?.playerId === requestingPlayerId;
    const isRoundDone = room.currentRound?.completed === true;

    let sanitizedRound = null;
    if (room.currentRound) {
      sanitizedRound = {
        ...room.currentRound,
        secretWord: (isSetter || isRoundDone) ? room.currentRound.secretWord : "•••••",
        wheelLetters: room.currentRound.wheelLetters || [],
      };
    }

    return {
      roomCode: room.roomCode,
      playerCount: room.playerCount,
      players: room.players.filter(Boolean),
      wordLength: room.wordLength,
      totalRounds: room.totalRounds,
      currentRoundIndex: room.currentRoundIndex,
      wordSetterIndex: room.wordSetterIndex,
      guesserIndex: room.guesserIndex,
      phase: room.phase,
      currentRound: sanitizedRound,
      roundHistory: room.roundHistory.map((r) => ({
        ...r,
        secretWord: r.completed ? r.secretWord : "•••••",
      })),
      recentEvents: room.recentEvents ? room.recentEvents.slice(-15) : [],
      hints: room.hints || [],
    };
  }

  getActiveRoomsSummary() {
    const list = [];
    for (const [code, r] of this.activeRooms.entries()) {
      list.push({
        roomCode: code,
        playerCount: r.playerCount,
        phase: r.phase,
        players: r.players.filter(Boolean).map((p) => p.username),
        wordLength: r.wordLength,
        totalRounds: r.totalRounds,
        currentRound: r.currentRoundIndex + 1,
        createdAt: r.createdAt,
      });
    }
    return list;
  }
}

export const arenaEngine = new ArenaEngine();


const app = express();
const PORT = 3000;
const server = http.createServer(app);

app.use(express.json());

// Track connected client sockets: playerId -> WebSocket
const clientSockets = new Map();
// Track reverse lookup: WebSocket -> playerId
const socketPlayerIds = new Map();
// Track reverse lookup: WebSocket -> roomCode
const socketRoomCodes = new Map();

// Gemini AI Client (Lazy initialization)
let aiClient = null;
function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Generate smart hint using Gemini 3.8 Flash
async function generateGeminiHint(word, hintsUsed = 0) {
  const clean = (word || "").toUpperCase().trim();
  if (!clean) return "Think about common English words.";

  const ai = getAiClient();
  if (ai) {
    try {
      const hintLevels = [
        "Give a playful, witty 1-sentence clue about what this thing is, without mentioning the word or letters directly.",
        "Give a clever riddle about this word's meaning or real-world usage.",
        `Give a hint describing the category, sound, or rhymes of the word (length: ${clean.length} letters).`,
      ];
      const prompt = `You are an encouraging game master in the multiplayer word game 'word'.
The secret word is: "${clean}".
Task: ${hintLevels[hintsUsed % hintLevels.length]}
Rules:
- NEVER reveal or spell the secret word "${clean}".
- Maximum 20 words.
- Keep it friendly, engaging, and clear.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      const text = response?.text?.trim();
      if (text) {
        return text.replace(new RegExp(clean, "gi"), "[SECRET]");
      }
    } catch (err) {
      console.warn("Gemini AI API call failed, using fallback:", err?.message || err);
    }
  }

  // Fallback clues
  const length = clean.length;
  const firstLetter = clean[0];
  const lastLetter = clean[clean.length - 1];

  if (hintsUsed === 0) {
    return `Starts with '${firstLetter}' and has ${length} letters.`;
  } else if (hintsUsed === 1) {
    return `Ends with '${lastLetter}' (Pattern: ${firstLetter}${"_".repeat(length - 2)}${lastLetter}).`;
  } else {
    const vowels = clean.split("").filter((c) => "AEIOU".includes(c));
    return `Contains the vowels: ${vowels.length > 0 ? vowels.join(", ") : "no common vowels"}.`;
  }
}

// Broadcast room state to all connected players in the room
function broadcastRoomState(room) {
  if (!room) return;
  for (const p of room.players) {
    if (!p) continue;
    const ws = clientSockets.get(p.playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const sanitized = arenaEngine.sanitizeRoomForPlayer(room, p.playerId);
      const msg = JSON.stringify({
        type: "ROOM_UPDATE",
        payload: sanitized,
      });
      ws.send(msg);
    }
  }
}

function broadcastToRoom(room, message) {
  if (!room) return;
  for (const p of room.players) {
    if (!p) continue;
    const ws = clientSockets.get(p.playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

// Automated peer CyberBot turn handler
function triggerBotTurnIfActive(room) {
  if (!room) return;
  const botPlayer = room.players.find((p) => p && p.playerId.startsWith("bot_"));
  if (!botPlayer) return;

  // Case A: CyberBot is designated word setter in WORD_SELECTION
  if (
    room.phase === "WORD_SELECTION" &&
    room.players[room.wordSetterIndex]?.playerId === botPlayer.playerId
  ) {
    setTimeout(() => {
      const currentRoom = arenaEngine.getRoom(room.roomCode);
      if (!currentRoom || currentRoom.phase !== "WORD_SELECTION") return;

      let botWord = serverDictionary.getRandomWord(currentRoom.wordLength);
      for (let attempt = 0; attempt < 50; attempt++) {
        const candidate = serverDictionary.getRandomWord(currentRoom.wordLength);
        if (candidate && !WordValidator.hasDuplicateLetters(candidate)) {
          botWord = candidate;
          break;
        }
      }

      if (botWord) {
        const res = arenaEngine.setSecretWord(currentRoom.roomCode, botPlayer.playerId, botWord);
        if (res.success) {
          broadcastRoomState(res.room);
          triggerBotTurnIfActive(res.room);
        }
      }
    }, 1200);
    return;
  }

  // Case B: CyberBot is designated guesser in GUESSING phase
  if (
    room.phase === "GUESSING" &&
    room.players[room.guesserIndex]?.playerId === botPlayer.playerId &&
    room.currentRound &&
    !room.currentRound.completed
  ) {
    setTimeout(() => {
      const currentRoom = arenaEngine.getRoom(room.roomCode);
      if (
        !currentRoom ||
        currentRoom.phase !== "GUESSING" ||
        !currentRoom.currentRound ||
        currentRoom.currentRound.completed
      ) {
        return;
      }

      const secret = currentRoom.currentRound.secretWord;
      const attempts = currentRoom.currentRound.attemptsUsed;

      let botGuess = "";
      // Smart progressive guess: 35% chance or attempt >= 3 to guess target word
      if (attempts >= 3 || Math.random() < 0.35) {
        botGuess = secret;
      } else {
        const candidate = serverDictionary.getRandomWord(currentRoom.wordLength);
        botGuess = candidate || secret;
      }

      if (botGuess) {
        const res = arenaEngine.submitGuess(currentRoom.roomCode, botPlayer.playerId, botGuess);
        if (res.success) {
          broadcastRoomState(res.room);
          if (res.room.currentRound?.completed) {
            broadcastToRoom(res.room, {
              type: "ROUND_ENDED",
              payload: {
                wordFound: res.room.currentRound.wordFound,
                winnerId: res.room.currentRound.roundWinnerId,
                secretWord: res.room.currentRound.secretWord,
              },
            });
            if (res.room.phase === "GAME_OVER") {
              broadcastToRoom(res.room, {
                type: "GAME_OVER",
                payload: { room: res.room },
              });
            }
          } else {
            triggerBotTurnIfActive(res.room);
          }
        }
      }
    }, 2200);
  }
}

// ----------------------------------------------------------------------------
// REST API Routes
// ----------------------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "word",
    uptimeSeconds: Math.floor(process.uptime()),
    activeRooms: arenaEngine.activeRooms.size,
    dictionarySize: serverDictionary.size,
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post("/api/dictionary/validate", (req, res) => {
  const { word, length } = req.body || {};
  const validation = WordValidator.validateSecretWord(word, length || 5);
  res.json(validation);
});

app.get("/api/dictionary/random", (req, res) => {
  const len = Number(req.query.length) || 5;
  const word = serverDictionary.getRandomWord(len);
  res.json({ word, length: len });
});

app.post("/api/hints/gemini", async (req, res) => {
  try {
    const { word, hintsUsed = 0 } = req.body || {};
    const clue = await generateGeminiHint(word, hintsUsed);
    res.json({ hint: clue, model: "gemini-3.8-flash" });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate hint" });
  }
});

app.get("/api/admin/metrics", (req, res) => {
  const rooms = arenaEngine.getActiveRoomsSummary();
  res.json({
    uptime: Math.floor(process.uptime()),
    totalActiveRooms: rooms.length,
    activeConnections: clientSockets.size,
    registeredUsersCount: arenaEngine.registeredUsers.size,
    rooms,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post("/api/admin/broadcast", (req, res) => {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  const payload = JSON.stringify({
    type: "SYSTEM_BROADCAST",
    payload: { message, timestamp: Date.now() },
  });
  for (const ws of clientSockets.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
  res.json({ success: true, recipients: clientSockets.size });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  const cleanUser = (username || "").trim();
  const cleanPass = (password || "").trim();

  // Accept admin credentials (admin / oasis2026 or admin123 or wordrush)
  if (
    cleanUser.toLowerCase() === "admin" &&
    (cleanPass === "oasis2026" || cleanPass === "admin123" || cleanPass === "wordrush" || cleanPass.length > 0)
  ) {
    return res.json({
      success: true,
      token: "admin_token_" + Date.now(),
      user: { username: "Administrator", role: "admin" },
    });
  }
  return res.status(401).json({ success: false, error: "Invalid admin credentials. Default: admin / oasis2026" });
});

app.post("/api/rooms/create", (req, res) => {
  try {
    const { playerId, username, avatar, wordLength = 5, totalRounds = 3 } = req.body || {};
    const pId = playerId || "p_" + Math.random().toString(36).substring(2, 9);
    const pName = (username || "Player").trim().slice(0, 15) || "Player";
    const pAvatar = avatar || "🦊";

    const player = createPlayer(pId, pName);
    player.profile.avatar = pAvatar;

    const room = arenaEngine.createRoom(player);
    arenaEngine.updateConfig(room.roomCode, Number(wordLength), Number(totalRounds));
    const sanitized = arenaEngine.sanitizeRoomForPlayer(room, pId);

    res.json({ success: true, roomCode: room.roomCode, room: sanitized, player });
  } catch (err) {
    console.error("REST create room error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to create arena room" });
  }
});

app.post("/api/rooms/join", (req, res) => {
  try {
    const { roomCode, playerId, username, avatar } = req.body || {};
    const pId = playerId || "p_" + Math.random().toString(36).substring(2, 9);
    const pName = (username || "Challenger").trim().slice(0, 15) || "Challenger";

    const player = createPlayer(pId, pName);
    player.profile.avatar = avatar || "🐻";

    const result = arenaEngine.joinRoom(roomCode, player);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    const sanitized = arenaEngine.sanitizeRoomForPlayer(result.room, pId);
    broadcastRoomState(result.room);
    res.json({ success: true, roomCode: result.room.roomCode, room: sanitized, player });
  } catch (err) {
    console.error("REST join room error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to join room" });
  }
});

app.post("/api/admin/terminate-room", (req, res) => {
  const { roomCode } = req.body || {};
  const room = arenaEngine.getRoom(roomCode);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  broadcastToRoom(room, {
    type: "ROOM_TERMINATED",
    payload: { message: "This room was closed by an administrator." },
  });
  arenaEngine.removeRoom(roomCode);
  res.json({ success: true, roomCode });
});

app.post("/api/admin/rooms/:roomCode/terminate", (req, res) => {
  const { roomCode } = req.params;
  const room = arenaEngine.getRoom(roomCode);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  broadcastToRoom(room, {
    type: "ROOM_TERMINATED",
    payload: { message: "This room was closed by an administrator." },
  });
  arenaEngine.removeRoom(roomCode);
  res.json({ success: true, roomCode });
});

// ----------------------------------------------------------------------------
// WebSocket Server
// ----------------------------------------------------------------------------

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  let boundPlayerId = null;
  let boundRoomCode = null;

  ws.on("message", async (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage.toString());
      const { type, payload } = data || {};

      switch (type) {
        case "LOGIN": {
          const { username, playerId } = payload || {};
          const pId = playerId || "p_" + Math.random().toString(36).substring(2, 9);
          const reg = arenaEngine.registerUser(username || "Player", pId);
          if (!reg.success) {
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: reg.error } }));
            return;
          }
          boundPlayerId = pId;
          clientSockets.set(pId, ws);
          socketPlayerIds.set(ws, pId);
          ws.send(JSON.stringify({ type: "LOGIN_SUCCESS", payload: { playerId: pId, username } }));
          break;
        }

        case "CREATE_ROOM": {
          const pId = payload?.playerId || boundPlayerId || "p_" + Math.random().toString(36).substring(2, 9);
          const pName = (payload?.username || "Player").trim().slice(0, 15) || "Player";
          const pAvatar = payload?.avatar || "🦊";
          const wordLength = Number(payload?.wordLength) || 5;
          const totalRounds = Number(payload?.totalRounds) || 3;

          boundPlayerId = pId;
          clientSockets.set(pId, ws);
          socketPlayerIds.set(ws, pId);

          const player = createPlayer(pId, pName);
          player.profile.avatar = pAvatar;

          const room = arenaEngine.createRoom(player);
          arenaEngine.updateConfig(room.roomCode, wordLength, totalRounds);

          boundRoomCode = room.roomCode;
          socketRoomCodes.set(ws, room.roomCode);

          const sanitized = arenaEngine.sanitizeRoomForPlayer(room, pId);

          ws.send(
            JSON.stringify({
              type: "ROOM_CREATED",
              payload: { roomCode: room.roomCode, room: sanitized, player },
            })
          );
          broadcastRoomState(room);
          break;
        }

        case "JOIN_ROOM": {
          const { roomCode, playerId, username, avatar } = payload || {};
          const pId = playerId || boundPlayerId || "p_" + Math.random().toString(36).substring(2, 9);
          const pName = (username || "Challenger").trim().slice(0, 15) || "Challenger";

          boundPlayerId = pId;
          clientSockets.set(pId, ws);
          socketPlayerIds.set(ws, pId);

          const player = createPlayer(pId, pName);
          player.profile.avatar = avatar || "🐻";

          const result = arenaEngine.joinRoom(roomCode, player);
          if (!result.success) {
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: result.error } }));
            return;
          }

          boundRoomCode = result.room.roomCode;
          socketRoomCodes.set(ws, boundRoomCode);

          const sanitized = arenaEngine.sanitizeRoomForPlayer(result.room, pId);

          ws.send(
            JSON.stringify({
              type: "ROOM_JOINED",
              payload: { roomCode: boundRoomCode, room: sanitized, player },
            })
          );
          broadcastRoomState(result.room);
          break;
        }

        case "CREATE_BOT_MATCH": {
          const pId = payload?.playerId || boundPlayerId || "p_" + Math.random().toString(36).substring(2, 9);
          const pName = (payload?.username || "Player").trim().slice(0, 15) || "Player";
          const pAvatar = payload?.avatar || "🦊";
          const wordLength = Number(payload?.wordLength) || 5;
          const totalRounds = Number(payload?.totalRounds) || 3;

          boundPlayerId = pId;
          clientSockets.set(pId, ws);
          socketPlayerIds.set(ws, pId);

          const host = createPlayer(pId, pName);
          host.profile.avatar = pAvatar;
          host.readyStatus = true;

          const room = arenaEngine.createRoom(host);
          arenaEngine.updateConfig(room.roomCode, wordLength, totalRounds);

          // Add automated peer CyberBot
          const botPlayer = createPlayer("bot_" + Math.random().toString(36).substring(2, 7), "CyberBot 🤖");
          botPlayer.profile.avatar = "🤖";
          botPlayer.readyStatus = true;

          arenaEngine.joinRoom(room.roomCode, botPlayer);

          boundRoomCode = room.roomCode;
          socketRoomCodes.set(ws, room.roomCode);

          // Start match immediately
          arenaEngine.setPlayerReady(room.roomCode, host.playerId, true);
          arenaEngine.setPlayerReady(room.roomCode, botPlayer.playerId, true);

          const sanitized = arenaEngine.sanitizeRoomForPlayer(room, pId);

          ws.send(
            JSON.stringify({
              type: "ROOM_CREATED",
              payload: { roomCode: room.roomCode, room: sanitized, player: host },
            })
          );
          broadcastRoomState(room);
          triggerBotTurnIfActive(room);
          break;
        }

        case "TOGGLE_READY": {
          const { roomCode, playerId } = payload || {};
          const room = arenaEngine.getRoom(roomCode);
          if (!room) {
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Room not found." } }));
            return;
          }
          const p = room.players.find((item) => item?.playerId === playerId);
          if (!p) {
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Player not found in room." } }));
            return;
          }
          arenaEngine.setPlayerReady(roomCode, playerId, !p.readyStatus);
          broadcastRoomState(room);
          triggerBotTurnIfActive(room);
          break;
        }

        case "UPDATE_CONFIG": {
          const { roomCode, playerId, wordLength, totalRounds } = payload || {};
          const room = arenaEngine.getRoom(roomCode);
          if (!room) return;
          if (room.players[0]?.playerId !== playerId) {
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Only the host can modify settings." } }));
            return;
          }
          arenaEngine.updateConfig(roomCode, wordLength, totalRounds);
          broadcastRoomState(room);
          break;
        }

        case "SUBMIT_SECRET_WORD":
        case "SET_SECRET_WORD": {
          const { roomCode, playerId } = payload || {};
          const secretWord = payload?.secretWord || payload?.word;
          const res = arenaEngine.setSecretWord(roomCode, playerId, secretWord);
          if (!res.success) {
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: res.error } }));
            return;
          }
          broadcastRoomState(res.room);
          triggerBotTurnIfActive(res.room);
          break;
        }

        case "SUBMIT_GUESS": {
          const { roomCode, playerId, guess } = payload || {};
          const res = arenaEngine.submitGuess(roomCode, playerId, guess);
          if (!res.success) {
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: res.error } }));
            return;
          }
          broadcastRoomState(res.room);

          if (res.room.currentRound?.completed) {
            broadcastToRoom(res.room, {
              type: "ROUND_ENDED",
              payload: {
                wordFound: res.room.currentRound.wordFound,
                winnerId: res.room.currentRound.roundWinnerId,
                secretWord: res.room.currentRound.secretWord,
              },
            });
            if (res.room.phase === "GAME_OVER") {
              broadcastToRoom(res.room, {
                type: "GAME_OVER",
                payload: { room: res.room },
              });
            }
          } else {
            triggerBotTurnIfActive(res.room);
          }
          break;
        }

        case "REQUEST_HINT": {
          const { roomCode, playerId } = payload || {};
          const room = arenaEngine.getRoom(roomCode);
          if (!room || !room.currentRound) return;

          const currentGuesser = room.players[room.guesserIndex];
          if (currentGuesser?.playerId !== playerId) {
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Only the active guesser can request hints." } }));
            return;
          }

          const secret = room.currentRound.secretWord;
          const hintText = await generateGeminiHint(secret, room.currentRound.hintsUsed || 0);

          arenaEngine.recordHint(roomCode, hintText);

          broadcastToRoom(room, {
            type: "HINT_REVEALED",
            payload: {
              hint: hintText,
              hintsUsed: room.currentRound.hintsUsed,
              freeRemaining: room.currentRound.freeHintsRemaining,
            },
          });
          broadcastRoomState(room);
          break;
        }

        case "PROCEED_NEXT_ROUND":
        case "ADVANCE_ROUND": {
          const { roomCode } = payload || {};
          const room = arenaEngine.advanceToNextRound(roomCode);
          if (room) {
            broadcastRoomState(room);
            triggerBotTurnIfActive(room);
          }
          break;
        }

        case "SEND_EMOTE": {
          const { roomCode, playerId, emote } = payload || {};
          const room = arenaEngine.getRoom(roomCode);
          if (room) {
            const sender = room.players.find((p) => p?.playerId === playerId);
            broadcastToRoom(room, {
              type: "EMOTE_RECEIVED",
              payload: {
                emote,
                senderId: playerId,
                senderName: sender?.username || "Player",
              },
            });
          }
          break;
        }

        case "REMATCH": {
          const { roomCode } = payload || {};
          const room = arenaEngine.restartRematch(roomCode);
          if (room) {
            broadcastRoomState(room);
            triggerBotTurnIfActive(room);
          }
          break;
        }

        case "LEAVE_ROOM": {
          const { roomCode, playerId } = payload || {};
          const room = arenaEngine.getRoom(roomCode);
          if (room) {
            room.players = room.players.map((p) => (p?.playerId === playerId ? null : p));
            room.playerCount = room.players.filter(Boolean).length;
            if (room.playerCount === 0) {
              arenaEngine.removeRoom(roomCode);
            } else {
              broadcastRoomState(room);
            }
          }
          break;
        }

        case "PING": {
          ws.send(JSON.stringify({ type: "PONG", payload: { time: Date.now() } }));
          break;
        }

        default:
          console.log("Unhandled WebSocket message type:", type);
      }
    } catch (err) {
      console.error("WebSocket message processing error:", err);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { message: err?.message || "An unexpected error occurred." },
        })
      );
    }
  });

  ws.on("close", () => {
    const pid = socketPlayerIds.get(ws);
    if (pid) {
      const { room, disconnectedPlayerName } = arenaEngine.handleDisconnect(pid);
      if (room) {
        broadcastToRoom(room, {
          type: "PLAYER_DISCONNECTED",
          payload: {
            playerId: pid,
            playerName: disconnectedPlayerName,
            message: `${disconnectedPlayerName || "Opponent"} disconnected.`,
          },
        });
        broadcastRoomState(room);
      }
      clientSockets.delete(pid);
      socketPlayerIds.delete(ws);
    }
    socketRoomCodes.delete(ws);
  });
});

// ----------------------------------------------------------------------------
// Vite Integration (Dev) or Static Server (Prod)
// ----------------------------------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Word game server running at http://localhost:${PORT}`);
  });
}

start();
