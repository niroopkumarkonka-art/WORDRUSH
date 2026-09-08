import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Swords,
  DoorOpen,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Shield,
  Send,
  Sparkles,
  Award,
  Zap,
  RotateCcw,
  User,
  ShieldAlert,
  SlidersHorizontal,
  X,
  Radio,
  ArrowLeft,
} from "lucide-react";
import confetti from "canvas-confetti";
import { socketService } from "./services/socket";
import { soundManager } from "./services/audio";
import { classifyWord } from "./utils/wordClassifier";
import { RealisticBackground } from "./components/RealisticBackground";
import { Logo } from "./components/Logo";
import { GameBoard } from "./components/GameBoard";
import { WordCandyBanner } from "./components/WordCandyBanner";
import { LetterWheel } from "./components/LetterWheel";
import { Keyboard } from "./components/Keyboard";
import { Scoreboard } from "./components/Scoreboard";
import { PlayerCard } from "./components/PlayerCard";
import { HintPanel } from "./components/HintPanel";
import { RoomCode } from "./components/RoomCode";
import { RulesModal } from "./components/RulesModal";
import { Countdown } from "./components/Countdown";
import { WinnerModal } from "./components/WinnerModal";
import { Toast } from "./components/Toast";
import { LandingPage } from "./components/LandingPage";
import { WordPuzzleGame } from "./components/WordPuzzleGame";
import { GameEntranceModal } from "./components/GameEntranceModal";
import { DictionaryHelperModal } from "./components/DictionaryHelperModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { AnagramSolver } from "./components/AnagramSolver";

export default function App() {
  // --------------------------------------------------------------------------
  // Application View Mode (Distinct Role Gateways & Only Multiplayer)
  // --------------------------------------------------------------------------
  const [currentView, setCurrentView] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("room")) return "MULTIPLAYER";
    } catch {}
    return "LANDING";
  });
  const [adminUser, setAdminUser] = useState(null);
  const [createRoomWordLength, setCreateRoomWordLength] = useState(5);
  const [createRoomTotalRounds, setCreateRoomTotalRounds] = useState(3);

  // --------------------------------------------------------------------------
  // User Identity & Profile State (Local Persistence)
  // --------------------------------------------------------------------------
  const [playerId] = useState(() => {
    const saved = localStorage.getItem("wordrush_player_id");
    if (saved) return saved;
    const newId = "peer_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("wordrush_player_id", newId);
    return newId;
  });

  const [username, setUsername] = useState(() => {
    return (
      localStorage.getItem("wordrush_username") ||
      "Peer_" + Math.floor(100 + Math.random() * 900)
    );
  });

  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem("wordrush_avatar") || "🌿";
  });

  // --------------------------------------------------------------------------
  // Navigation & Layer Overlays
  // --------------------------------------------------------------------------
  const [isEntranceModalOpen, setIsEntranceModalOpen] = useState(false);
  const [isDictionaryHelperOpen, setIsDictionaryHelperOpen] = useState(false);
  const [isPuzzleModeActive, setIsPuzzleModeActive] = useState(false);
  const [puzzleDifficulty, setPuzzleDifficulty] = useState("MEDIUM");
  const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);
  const [matchmakerTab, setMatchmakerTab] = useState("host");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isAnagramModalOpen, setIsAnagramModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundManager.isMuted());

  const handleToggleMute = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  // --------------------------------------------------------------------------
  // Room & Game State (Strictly Multiplayer)
  // --------------------------------------------------------------------------
  const [room, setRoom] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("room") || "";
      return code.trim().toUpperCase().slice(0, 5);
    } catch {
      return "";
    }
  });

  const [secretWordInput, setSecretWordInput] = useState("");
  const [currentGuessInput, setCurrentGuessInput] = useState("");
  const [lastRevealedHint, setLastRevealedHint] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(null);
  const [isBoardShake, setIsBoardShake] = useState(false);
  const [inputMode, setInputMode] = useState("wheel");
  const [floatingEmotes, setFloatingEmotes] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Toast Helper (Pop-up time limit: 1.5 sec only)
  const addToast = useCallback((type, message, title) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      type,
      message,
      title,
    };
    setToasts((prev) => [...prev, newToast]);
    // Strict 1.5 second auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update Profile
  const handleUpdateProfile = ({ username: newName, avatar: newAvatar }) => {
    if (newName !== undefined) {
      const val = newName.trim().slice(0, 15);
      setUsername(val);
      localStorage.setItem("wordrush_username", val);
    }
    if (newAvatar !== undefined) {
      setAvatar(newAvatar);
      localStorage.setItem("wordrush_avatar", newAvatar);
    }
    if (room) {
      socketService.send("UPDATE_PROFILE", {
        roomCode: room.roomCode,
        playerId,
        username: newName || username,
        avatar: newAvatar || avatar,
      });
    }
  };

  // --------------------------------------------------------------------------
  // WebSocket Lifecycle & Dispatch Handlers
  // --------------------------------------------------------------------------
  useEffect(() => {
    socketService.connect();
    setIsConnected(socketService.connected);

    socketService.on("connection_status", (status) => {
      setIsConnected(status.connected);
    });

    socketService.on("ROOM_SYNC", (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom) setIsMatchmakerOpen(false);
    });

    socketService.on("ROOM_UPDATE", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socketService.on("ROOM_CREATED", (data) => {
      soundManager.playSuccess();
      if (data.room) {
        setRoom(data.room);
        setCurrentView("MULTIPLAYER");
      }
      setIsMatchmakerOpen(false);
      addToast("success", `Game room created! Share code: ${data.roomCode}`, "Room Ready");
    });

    socketService.on("JOINED_SUCCESS", (data) => {
      soundManager.playSuccess();
      if (data.room) {
        setRoom(data.room);
        setCurrentView("MULTIPLAYER");
      }
      setIsMatchmakerOpen(false);
      addToast("success", `Joined room ${data.roomCode}!`, "Ready to Play");
    });

    socketService.on("ROOM_JOINED", (data) => {
      soundManager.playSuccess();
      if (data.room) {
        setRoom(data.room);
        setCurrentView("MULTIPLAYER");
      }
      setIsMatchmakerOpen(false);
      addToast("success", `Joined room ${data.roomCode}!`, "Ready to Play");
    });

    socketService.on("GUESS_FEEDBACK", (data) => {
      if (data.isCorrect) {
        soundManager.playSuccess();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
        });
      } else {
        soundManager.playTileFlip();
      }
    });

    socketService.on("HINT_REVEALED", (data) => {
      setLastRevealedHint(data.hintText);
      soundManager.playHint();
      addToast("info", data.hintText, "Gemini AI Clue");
    });

    socketService.on("COUNTDOWN", (data) => {
      setCountdownSeconds(data.seconds);
      soundManager.playCountdown();
      if (data.seconds === 0) {
        setTimeout(() => setCountdownSeconds(null), 500);
      }
    });

    socketService.on("BATTLE_COUNTDOWN", (data) => {
      setCountdownSeconds(data.seconds);
      soundManager.playCountdown();
      if (data.seconds === 0) {
        setTimeout(() => setCountdownSeconds(null), 500);
      }
    });

    socketService.on("PLAYER_DISCONNECTED", (data) => {
      soundManager.playRoundLost();
      addToast("warning", data.message || "Opponent pilot disconnected", "Telemetry Alert");
    });

    socketService.on("ROUND_ENDED", (data) => {
      if (data.wordFound) {
        soundManager.playSuccess();
        confetti({ particleCount: 110, spread: 90, origin: { y: 0.5 } });
      } else {
        soundManager.playRoundLost();
      }
    });

    socketService.on("GAME_OVER", () => {
      soundManager.playGameOver();
      confetti({ particleCount: 160, spread: 120, origin: { y: 0.4 } });
    });

    socketService.on("EMOTE_RECEIVED", (data) => {
      const id = Math.random().toString(36).substring(2, 9);
      setFloatingEmotes((prev) => [
        ...prev,
        { id, emote: data.emote, senderName: data.senderName },
      ]);
      soundManager.playPop();
      setTimeout(() => {
        setFloatingEmotes((prev) => prev.filter((item) => item.id !== id));
      }, 3500);
    });

    socketService.on("SYSTEM_BROADCAST", (data) => {
      soundManager.playPop();
      addToast("info", data.message, "Oasis Broadcast");
    });

    socketService.on("ERROR", (err) => {
      soundManager.playError();
      setIsBoardShake(true);
      setTimeout(() => setIsBoardShake(false), 500);
      addToast("error", err.message);
    });

    return () => {
      socketService.disconnect();
    };
  }, [addToast]);

  // If a room URL query is present, open join layer immediately
  useEffect(() => {
    if (joinCodeInput && !room) {
      setIsMatchmakerOpen(true);
    }
  }, [joinCodeInput, room]);

  // Reset local state between phases
  useEffect(() => {
    if (room?.phase === "WORD_SELECTION") {
      setSecretWordInput("");
      setCurrentGuessInput("");
      setLastRevealedHint(null);
    }
    if (room?.phase === "GUESSING") {
      setCurrentGuessInput("");
    }
  }, [room?.phase, room?.currentRoundIndex]);

  // --------------------------------------------------------------------------
  // Multiplayer Actions
  // --------------------------------------------------------------------------
  const handleCreateRoom = async (overrideWordLength, overrideTotalRounds) => {
    const wLen = Number(overrideWordLength) || createRoomWordLength || 5;
    const tRounds = Number(overrideTotalRounds) || createRoomTotalRounds || 3;
    soundManager.playKeyClick();
    if (socketService.connected) {
      socketService.send("CREATE_ROOM", {
        playerId,
        username,
        avatar,
        wordLength: wLen,
        totalRounds: tRounds,
      });
      setCurrentView("MULTIPLAYER");
    } else {
      try {
        const res = await fetch("/api/rooms/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            username,
            avatar,
            wordLength: wLen,
            totalRounds: tRounds,
          }),
        });
        const data = await res.json();
        if (data.success && data.room) {
          setRoom(data.room);
          setCurrentView("MULTIPLAYER");
          addToast("success", `Game room created! Share code: ${data.roomCode}`, "Room Ready");
        } else {
          throw new Error(data.error || "Failed to create room");
        }
      } catch (err) {
        soundManager.playError();
        const diff = wLen === 4 ? "EASY" : wLen === 6 ? "HARD" : "MEDIUM";
        setPuzzleDifficulty(diff);
        setIsPuzzleModeActive(true);
        setCurrentView("PUZZLES");
        addToast("info", `Multiplayer offline. Launched ${diff} (${wLen}-letter) Solo Game!`, "Offline Mode");
      }
    }
  };

  const handlePlayBot = (overrideWordLength, overrideTotalRounds) => {
    const wLen = Number(overrideWordLength) || createRoomWordLength || 5;
    const tRounds = Number(overrideTotalRounds) || createRoomTotalRounds || 3;
    soundManager.playKeyClick();
    if (socketService.connected) {
      socketService.send("CREATE_BOT_MATCH", {
        playerId,
        username,
        avatar,
        wordLength: wLen,
        totalRounds: tRounds,
      });
      setCurrentView("MULTIPLAYER");
    } else {
      const diff = wLen === 4 ? "EASY" : wLen === 6 ? "HARD" : "MEDIUM";
      setPuzzleDifficulty(diff);
      setIsPuzzleModeActive(true);
      setCurrentView("PUZZLES");
      addToast("info", `Launched ${diff} (${wLen}-letter) Practice Game!`, "Practice Mode");
    }
  };

  const handleJoinRoom = async (codeToJoin) => {
    const cleanCode = (codeToJoin || joinCodeInput).trim().toUpperCase();
    if (cleanCode.length !== 5) {
      soundManager.playError();
      addToast("warning", "Room code must be exactly 5 letters.");
      return;
    }
    soundManager.playKeyClick();
    if (socketService.connected) {
      socketService.send("JOIN_ROOM", {
        roomCode: cleanCode,
        playerId,
        username,
        avatar,
      });
    } else {
      try {
        const res = await fetch("/api/rooms/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomCode: cleanCode,
            playerId,
            username,
            avatar,
          }),
        });
        const data = await res.json();
        if (data.success && data.room) {
          setRoom(data.room);
          setCurrentView("MULTIPLAYER");
          addToast("success", `Joined room ${data.roomCode}!`, "Ready to Play");
        } else {
          throw new Error(data.error || "Failed to join room");
        }
      } catch (err) {
        soundManager.playError();
        addToast("error", err.message || "Failed to join room");
      }
    }
  };

  const handleLeaveRoom = () => {
    if (!room) return;
    socketService.send("LEAVE_ROOM", {
      roomCode: room.roomCode,
      playerId,
    });
    setRoom(null);
  };

  const handleToggleReady = () => {
    if (!room) return;
    soundManager.playKeyClick();
    socketService.send("TOGGLE_READY", {
      roomCode: room.roomCode,
      playerId,
    });
  };

  const handleUpdateConfig = (wordLength, totalRounds) => {
    if (!room) return;
    soundManager.playKeyClick();
    socketService.send("UPDATE_CONFIG", {
      roomCode: room.roomCode,
      playerId,
      wordLength,
      totalRounds,
    });
  };

  const handleSubmitSecretWord = (e) => {
    if (e) e.preventDefault();
    if (!room) return;
    const clean = secretWordInput.trim().toUpperCase();

    if (clean.length !== room.wordLength) {
      soundManager.playError();
      addToast("warning", `Cipher must be exactly ${room.wordLength} characters.`);
      return;
    }

    const seen = new Set();
    for (const c of clean) {
      if (seen.has(c)) {
        soundManager.playError();
        addToast(
          "error",
          "Duplicate letters detected! Secret ciphers must contain strictly unique characters.",
          "Invalid Cipher"
        );
        return;
      }
      seen.add(c);
    }

    socketService.send("SUBMIT_SECRET_WORD", {
      roomCode: room.roomCode,
      playerId,
      secretWord: clean,
      word: clean,
    });
    setSecretWordInput("");
    soundManager.playSuccess();
  };

  const handleCharInput = (char) => {
    if (!room) return;
    if (currentGuessInput.length < room.wordLength) {
      soundManager.playKeyClick();
      setCurrentGuessInput((prev) => prev + char);
    }
  };

  const handleDeleteInput = () => {
    soundManager.playKeyClick();
    setCurrentGuessInput((prev) => prev.slice(0, -1));
  };

  const handleEnterGuess = (customWord) => {
    if (!room) return;
    const wordToSubmit = (customWord || currentGuessInput).trim().toUpperCase();
    if (wordToSubmit.length !== room.wordLength) {
      soundManager.playError();
      setIsBoardShake(true);
      setTimeout(() => setIsBoardShake(false), 500);
      addToast("warning", `Cipher guess must be ${room.wordLength} characters.`);
      return;
    }

    socketService.send("SUBMIT_GUESS", {
      roomCode: room.roomCode,
      playerId,
      guess: wordToSubmit,
    });
    setCurrentGuessInput("");
  };

  const handleRequestHint = () => {
    if (!room) return;
    socketService.send("REQUEST_HINT", {
      roomCode: room.roomCode,
      playerId,
    });
  };

  const handleSendEmote = (emote) => {
    if (!room) return;
    soundManager.playPop();
    socketService.send("SEND_EMOTE", {
      roomCode: room.roomCode,
      playerId,
      emote,
    });
  };

  const handleNextRound = () => {
    if (!room) return;
    socketService.send("PROCEED_NEXT_ROUND", {
      roomCode: room.roomCode,
      playerId,
    });
  };

  const handleRematch = () => {
    if (!room) return;
    socketService.send("REMATCH", {
      roomCode: room.roomCode,
      playerId,
    });
  };

  // Roles & Turn calculations
  const isHost = room?.players[0]?.playerId === playerId;
  const wordSetter = room ? room.players[room.wordSetterIndex] : null;
  const guesser = room ? room.players[room.guesserIndex] : null;
  const isWordSetter = wordSetter?.playerId === playerId;
  const isGuesser = guesser?.playerId === playerId;

  // Keyboard letter states
  const letterStates = {};
  if (room?.currentRound) {
    const round = room.currentRound;
    for (let r = 0; r < round.attemptsUsed; r++) {
      for (let c = 0; c < room.wordLength; c++) {
        const char = round.gameBoard[r]?.[c];
        const state = round.boardStates[r]?.[c];
        if (char && state !== undefined) {
          const currentBest = letterStates[char] ?? -1;
          if (state > currentBest) {
            letterStates[char] = state;
          }
        }
      }
    }
  }

  const secretWordDuplicates = useMemo(() => {
    if (!secretWordInput) return false;
    const seen = new Set();
    for (const c of secretWordInput.toUpperCase()) {
      if (seen.has(c)) return true;
      seen.add(c);
    }
    return false;
  }, [secretWordInput]);

  const wheelLetters = useMemo(() => {
    if (room?.currentRound?.wheelLetters && room.currentRound.wheelLetters.length > 0) {
      return room.currentRound.wheelLetters;
    }
    return ["S", "A", "U", "C", "E", "T", "F"];
  }, [room?.currentRound?.wheelLetters]);

  return (
    <div className="relative min-h-screen w-full text-slate-800 flex flex-col justify-between selection:bg-amber-300 selection:text-amber-950 font-sans overflow-x-hidden">
      {/* Background & Header during active gameplay match */}
      {room && (
        <>
          <RealisticBackground />
          <header className="w-full sticky top-0 z-40 px-3 sm:px-4 py-2.5 backdrop-blur-md bg-[#0284c7]/90 border-b-2 border-[#38bdf8]/40 shadow-md text-white">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  if (window.confirm("Leave current match and return to home?")) {
                    handleLeaveRoom();
                    setCurrentView("LANDING");
                  }
                }}
                title="WORDRUSH ARENA"
              >
                <Logo size="sm" showTagline={false} lightMode={false} />
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Live Connection Status */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-[#bbf7d0] border border-white/30 shadow-xs">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    }`}
                  />
                  <span>{isConnected ? "Arena Live" : "Connecting..."}</span>
                </div>

                {/* Rules Button */}
                <button
                  id="header-rules-btn"
                  onClick={() => setIsRulesOpen(true)}
                  title="Rules"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#facc15] hover:bg-[#eab308] text-slate-900 text-xs font-black shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 border border-yellow-200"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-[#facc15] flex items-center justify-center text-[10px] font-black">
                    ?
                  </span>
                  <span>Rules</span>
                </button>

                {/* My Stats Dashboard */}
                <button
                  id="header-user-dashboard-btn"
                  onClick={() => setIsUserDashboardOpen(true)}
                  title="My Stats"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden md:inline">My Stats</span>
                </button>

                {/* Admin Dashboard */}
                <button
                  id="header-admin-btn"
                  onClick={() => setIsAdminOpen(true)}
                  title="Admin Dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef08a] hover:bg-[#fde047] text-amber-950 text-xs font-black border border-amber-300 transition-all cursor-pointer shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden md:inline">Admin</span>
                </button>

                <button
                  id="leave-room-btn"
                  onClick={handleLeaveRoom}
                  className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all cursor-pointer shadow-md"
                >
                  LEAVE GAME
                </button>
              </div>
            </div>
          </header>
        </>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Main Content Area */}
      {/* -------------------------------------------------------------------- */}
      {!room ? (
        currentView === "PUZZLES" || isPuzzleModeActive ? (
          <main className="flex-1 w-full relative z-10">
            <WordPuzzleGame
              isOpen={true}
              onClose={() => {
                setIsPuzzleModeActive(false);
                setCurrentView("LANDING");
              }}
              initialDifficulty={puzzleDifficulty}
            />
          </main>
        ) : (
          <main className="flex-1 w-full relative z-10">
            <LandingPage
              username={username}
              avatar={avatar}
              onUpdateProfile={handleUpdateProfile}
              onOpenArena={() => setIsEntranceModalOpen(true)}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onPlayBot={handlePlayBot}
              onOpenPuzzles={(diff) => {
                const safe = typeof diff === "string" && ["EASY", "MEDIUM", "HARD"].includes(diff.toUpperCase())
                  ? diff.toUpperCase()
                  : "MEDIUM";
                setPuzzleDifficulty(safe);
                setIsPuzzleModeActive(true);
                setCurrentView("PUZZLES");
              }}
              onOpenAnagrams={() => setIsAnagramModalOpen(true)}
              onOpenRules={() => setIsRulesOpen(true)}
              onOpenUserStats={() => setIsUserDashboardOpen(true)}
              onOpenAdmin={() => setIsAdminOpen(true)}
              onlineCount={28}
              serverStatus={isConnected ? "Online" : "Connecting..."}
            />
          </main>
        )
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 flex flex-col justify-center relative z-10">

        {/* ACTIVE MULTIPLAYER LOBBY (When room is created/joined) */}
        {currentView === "MULTIPLAYER" && room && room.phase === "LOBBY" && (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5 my-auto animate-fadeIn">
            <div className="w-full flex items-center justify-between gap-3">
              <button
                id="lobby-leave-room-btn"
                onClick={handleLeaveRoom}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 hover:bg-white text-rose-600 hover:text-rose-700 font-black text-xs uppercase tracking-wider border-2 border-rose-200 hover:border-rose-400 shadow-[0_4px_12px_rgba(225,29,72,0.2)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Leave Game Room</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#fef08a] border-2 border-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
                <span>WAITING FOR PLAYERS</span>
              </div>
            </div>

            {/* Room Code Card */}
            <RoomCode roomCode={room.roomCode} />

            {/* Players List */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <PlayerCard
                player={room.players[0] || null}
                playerIndex={0}
                isWordSetter={false}
                isGuesser={false}
                isCurrentTurn={false}
                isSelf={room.players[0]?.playerId === playerId}
              />
              <PlayerCard
                player={room.players[1] || null}
                playerIndex={1}
                isWordSetter={false}
                isGuesser={false}
                isCurrentTurn={false}
                isSelf={room.players[1]?.playerId === playerId}
              />
            </div>

            {/* Game Configuration */}
            <div className="w-full p-5 rounded-3xl bg-white/95 border-2 border-amber-200 flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  GAME SETTINGS
                </span>
                {!isHost && (
                  <span className="text-[11px] text-slate-400 italic">
                    (Chosen by Room Host)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    WORD LENGTH
                  </label>
                  <div className="flex gap-2">
                    {[4, 5, 6].map((len) => (
                      <button
                        key={len}
                        disabled={!isHost}
                        onClick={() => handleUpdateConfig(len, room.totalRounds)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                          room.wordLength === len
                            ? "bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-2 border-slate-200 hover:bg-slate-100"
                        } disabled:opacity-75 disabled:cursor-not-allowed`}
                      >
                        {len} Letters
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    NUMBER OF ROUNDS
                  </label>
                  <div className="flex gap-2">
                    {[3, 5].map((rnd) => (
                      <button
                        key={rnd}
                        disabled={!isHost}
                        onClick={() => handleUpdateConfig(room.wordLength, rnd)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                          room.totalRounds === rnd
                            ? "bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-2 border-slate-200 hover:bg-slate-100"
                        } disabled:opacity-75 disabled:cursor-not-allowed`}
                      >
                        {rnd} Rounds
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ready Status Button */}
            <div className="w-full flex flex-col items-center gap-2">
              <button
                id="ready-toggle-btn"
                onClick={handleToggleReady}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  room.players.find((p) => p.playerId === playerId)?.readyStatus
                    ? "btn-candy-green text-white"
                    : "btn-candy-yellow text-amber-950"
                }`}
              >
                {room.players.find((p) => p.playerId === playerId)?.readyStatus ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    <span>READY! (TAP TO UNREADY)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 stroke-[2.5]" />
                    <span>I'M READY TO PLAY!</span>
                  </>
                )}
              </button>

              {room.playerCount < 2 ? (
                <p className="text-xs text-amber-800 font-bold flex items-center gap-1 mt-1">
                  <span>🎮 Share the room code with Player 2 to join...</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  The game starts as soon as both players are READY!
                </p>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE COMBAT BATTLE ARENA */}
        {room && room.phase !== "LOBBY" && (
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 animate-fadeIn">
            {/* Scoreboard */}
            <Scoreboard
              roundNumber={room.currentRoundIndex + 1}
              totalRounds={room.totalRounds}
              wordLength={room.wordLength}
              players={room.players}
              activeSetterName={wordSetter?.username || "Cipher Setter"}
              activeGuesserName={guesser?.username || "Decoder"}
              phase={room.phase}
              onOpenRules={() => setIsRulesOpen(true)}
              onLeaveRoom={() => {
                if (window.confirm("Leave current match and return to home?")) {
                  handleLeaveRoom();
                  setCurrentView("LANDING");
                }
              }}
            />

            {/* PHASE A: WORD SELECTION */}
            {room.phase === "WORD_SELECTION" && (
              <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white/95 border-4 border-amber-300 flex flex-col items-center text-center gap-4 shadow-xl">
                {isWordSetter ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-7 h-7 stroke-[2.5]" />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-800 tracking-wide">
                        YOU PICK THE SECRET WORD!
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Choose a <strong className="text-amber-700">{room.wordLength}-letter</strong> word for your opponent to guess.
                      </p>
                    </div>

                    {/* Word Preview Banner */}
                    <div className="py-1">
                      <WordCandyBanner
                        word={secretWordInput}
                        targetLength={room.wordLength}
                        placeholder={`TYPE ${room.wordLength}-LETTER WORD`}
                      />
                    </div>

                    {/* Rules reminder & Dictionary Helper */}
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left text-xs space-y-0.5 text-slate-700 flex-1">
                        <div className="text-amber-800 font-extrabold uppercase text-[11px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>WORD RULES ({room.wordLength} LETTERS, NO DUPLICATES):</span>
                        </div>
                        <div className="text-[11px] text-slate-600">Must be an official English word with unique letters (e.g. CRANE).</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDictionaryHelperOpen(true)}
                        className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Browse verified dictionary words"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                        <span>Dictionary Helper</span>
                      </button>
                    </div>

                    <form onSubmit={handleSubmitSecretWord} className="w-full flex flex-col gap-3">
                      <input
                        id="secret-word-input"
                        type="text"
                        maxLength={room.wordLength}
                        value={secretWordInput}
                        onChange={(e) => setSecretWordInput(e.target.value.toUpperCase())}
                        placeholder={`ENTER ${room.wordLength}-LETTER WORD`}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-amber-300 text-slate-800 text-center font-black text-xl uppercase tracking-widest focus:outline-none focus:border-amber-500 focus:bg-white shadow-inner"
                        autoFocus
                      />

                      {/* Rendered Word Candy Preview */}
                      {secretWordInput.length > 0 && (
                        <div className="py-2 flex justify-center">
                          <WordCandyBanner word={secretWordInput} />
                        </div>
                      )}

                      {/* Real-time Word/Name Classification Indicator */}
                      {secretWordInput.length > 0 && (() => {
                        const info = classifyWord(secretWordInput);
                        return (
                          <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-amber-50/90 border border-amber-200 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-600">Lexical Detection:</span>
                              <span className={`px-2.5 py-0.5 rounded-full font-black border flex items-center gap-1.5 ${info.badgeColor}`}>
                                <span>{info.icon}</span>
                                <span>{info.label}</span>
                              </span>
                            </div>
                            {info.note && (
                              <div className="p-2 rounded-lg bg-purple-100/80 border border-purple-300 text-purple-950 font-bold text-[11px] text-left">
                                {info.note}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {secretWordDuplicates && (
                        <div className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-300 flex items-center justify-center gap-1.5 animate-shake">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          <span>No repeating letters allowed! All letters must be unique.</span>
                        </div>
                      )}

                      <button
                        id="submit-secret-word-btn"
                        type="submit"
                        disabled={secretWordInput.length !== room.wordLength || secretWordDuplicates}
                        className="w-full py-4 rounded-2xl btn-candy-green text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Send className="w-4 h-4 stroke-[2.5]" />
                        <span>LOCK IN SECRET WORD</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center animate-bounce">
                      <Sparkles className="w-7 h-7" />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-800 tracking-wide">
                        WAITING FOR SECRET WORD
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        <strong className="text-amber-800">{wordSetter?.username}</strong> is picking a {room.wordLength}-letter secret word.
                      </p>
                    </div>

                    <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-2 text-slate-500 text-xs">
                      <div className="flex gap-2">
                        {Array.from({ length: room.wordLength }).map((_, i) => (
                          <div
                            key={i}
                            className="w-9 h-10 rounded-xl bg-white border-2 border-dashed border-amber-300 flex items-center justify-center text-amber-600 font-black text-lg animate-pulse"
                          >
                            ?
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Get ready to guess!</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PHASE B: ACTIVE GUESSING */}
            {room.phase === "GUESSING" && room.currentRound && (
              <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-10">
                {/* LEFT: GameBoard & AI Hint Panel */}
                <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
                  <GameBoard
                    wordLength={room.wordLength}
                    maxAttempts={6}
                    gameBoard={room.currentRound.gameBoard}
                    boardStates={room.currentRound.boardStates}
                    attemptsUsed={room.currentRound.attemptsUsed}
                    currentInput={isGuesser ? currentGuessInput : ""}
                    isGuesserTurn={isGuesser}
                    isShake={isBoardShake}
                    targetSecretWord={room.currentRound.secretWord || ""}
                  />

                  <HintPanel
                    freeHintsRemaining={room.currentRound.freeHintsRemaining}
                    extraHintsUsed={room.currentRound.extraHintsUsed}
                    lastRevealedHint={lastRevealedHint}
                    onRequestHint={handleRequestHint}
                    isGuesser={isGuesser}
                  />
                </div>

                {/* RIGHT: Active Input Banner + Circular Gesture Wheel */}
                <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
                  <WordCandyBanner
                    word={isGuesser ? currentGuessInput : ""}
                    targetLength={room.wordLength}
                    isError={isBoardShake}
                    firstCharMatch={Boolean(
                      isGuesser &&
                        currentGuessInput &&
                        room.currentRound?.secretWord &&
                        currentGuessInput[0]?.toUpperCase() ===
                          room.currentRound.secretWord[0]?.toUpperCase()
                    )}
                  />

                  {isGuesser ? (
                    inputMode === "wheel" ? (
                      <LetterWheel
                        letters={wheelLetters}
                        currentInput={currentGuessInput}
                        onLetterAdd={handleCharInput}
                        onWordSubmit={handleEnterGuess}
                        onClear={() => setCurrentGuessInput("")}
                        onDeleteChar={handleDeleteInput}
                        onToggleKeyboard={() => setInputMode("keyboard")}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="w-full flex justify-end">
                          <button
                            type="button"
                            onClick={() => setInputMode("wheel")}
                            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-amber-300 shadow-sm cursor-pointer"
                          >
                            &bull; Switch to Letter Wheel
                          </button>
                        </div>
                        <Keyboard
                          onChar={handleCharInput}
                          onEnter={() => handleEnterGuess()}
                          onDelete={handleDeleteInput}
                          letterStates={letterStates}
                        />
                      </div>
                    )
                  ) : (
                    <div className="w-full max-w-sm p-6 rounded-3xl bg-white/95 border-2 border-amber-200 shadow-md flex flex-col items-center text-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
                      <h4 className="text-base font-black text-slate-800 uppercase">
                        OPPONENT'S TURN TO GUESS
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Watching <strong className="text-amber-800">{guesser?.username}</strong> connect letters in real time...
                      </p>
                    </div>
                  )}

                  {/* Reaction Emote Bar */}
                  <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-white/95 border-2 border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 pl-2">REACT:</span>
                    {["🔥", "🎯", "🤯", "😎", "👏", "⚡", "🎮", "⭐"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleSendEmote(emoji)}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-amber-100 hover:scale-125 active:scale-95 transition-all text-base flex items-center justify-center cursor-pointer border border-slate-200"
                        title={`Send ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PHASE C: ROUND RESULT */}
            {room.phase === "ROUND_RESULT" && room.currentRound && (
              <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/95 border-4 border-amber-300 flex flex-col items-center text-center gap-4 animate-pop shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center shadow-md">
                  <Award className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div>
                  <h3 className="text-2xl font-black uppercase text-slate-800 tracking-wide">
                    {room.currentRound.wordFound ? "WORD GUESSED!" : "OUT OF GUESSES!"}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">The secret word was:</p>
                </div>

                <WordCandyBanner word={room.currentRound.secretWord} />

                <div className="w-full p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 font-bold">
                  Round Winner:{" "}
                  <strong className="text-amber-900 text-sm font-black">
                    {room.players.find((p) => p.playerId === room.currentRound?.roundWinnerId)?.username || "Nobody"}
                  </strong>
                </div>

                <button
                  id="next-round-btn"
                  onClick={handleNextRound}
                  className="w-full py-4 rounded-2xl btn-candy-green text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>NEXT ROUND &rarr;</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 1: MULTIPLAYER MATCHMAKER MODAL (Host / Join / Bot) */}
      {/* -------------------------------------------------------------------- */}
      {isMatchmakerOpen && (
        <div
          id="matchmaker-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white border-4 border-amber-300 p-6 sm:p-7 shadow-2xl text-slate-700 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-sm text-slate-900">
                  <Swords className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                    BATTLE ARENA LOBBY
                  </h3>
                  <p className="text-xs text-slate-500">Host a match, join a friend, or duel our AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsMatchmakerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matchmaker Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMatchmakerTab("host")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  matchmakerTab === "host"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Host Match</span>
              </button>
              <button
                type="button"
                onClick={() => setMatchmakerTab("join")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  matchmakerTab === "join"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Join Code</span>
              </button>
              <button
                type="button"
                onClick={() => setMatchmakerTab("bot")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  matchmakerTab === "bot"
                    ? "bg-purple-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>AI Practice</span>
              </button>
            </div>

            {/* TAB 1: HOST ARENA */}
            {matchmakerTab === "host" && (
              <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>CUSTOM MATCH SETTINGS</span>
                </div>

                {/* Word Length Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    CIPHER WORD LENGTH:
                  </label>
                  <div className="flex gap-2">
                    {[4, 5, 6].map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setCreateRoomWordLength(len)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          createRoomWordLength === len
                            ? "bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105"
                            : "bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50"
                        }`}
                      >
                        {len} Letters
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Rounds Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    MATCH LENGTH:
                  </label>
                  <div className="flex gap-2">
                    {[3, 5].map((rounds) => (
                      <button
                        key={rounds}
                        type="button"
                        onClick={() => setCreateRoomTotalRounds(rounds)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          createRoomTotalRounds === rounds
                            ? "bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105"
                            : "bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50"
                        }`}
                      >
                        {rounds} Rounds
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="modal-host-arena-btn"
                  onClick={handleCreateRoom}
                  className="w-full py-4 px-4 rounded-2xl btn-candy-green text-white font-black text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
                >
                  CREATE ARENA ROOM
                </button>
              </div>
            )}

            {/* TAB 2: JOIN ARENA */}
            {matchmakerTab === "join" && (
              <div className="p-5 rounded-2xl bg-sky-50/70 border-2 border-sky-200 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sky-950 font-black text-sm">
                  <DoorOpen className="w-4 h-4 text-sky-600" />
                  <span>ENTER 5-LETTER ROOM CODE</span>
                </div>
                <p className="text-xs text-slate-600">
                  Ask your friend for their 5-letter room code and enter it below:
                </p>
                <div className="flex gap-2">
                  <input
                    id="modal-join-code-input"
                    type="text"
                    maxLength={5}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    className="flex-1 px-4 py-3 rounded-2xl bg-white border-2 border-sky-300 text-slate-800 text-center font-black text-xl uppercase tracking-widest focus:outline-none focus:border-sky-500 shadow-inner"
                  />
                  <button
                    id="modal-join-btn"
                    onClick={handleJoinRoom}
                    disabled={joinCodeInput.trim().length !== 5}
                    className="px-6 py-3 rounded-2xl btn-candy-blue text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102 active:scale-98"
                  >
                    JOIN ROOM
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SOLO BOT ARENA */}
            {matchmakerTab === "bot" && (
              <div className="p-5 rounded-2xl bg-purple-50/70 border-2 border-purple-200 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-purple-950 font-black text-sm">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>SOLO AI CIPHER DUEL</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Face our adaptive Lexical Bot! The Bot will choose tricky words, guess your secrets, and provide instant training with zero wait time.
                </p>
                <button
                  id="modal-bot-match-btn"
                  onClick={() => {
                    handlePlayBot();
                    setIsMatchmakerOpen(false);
                  }}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-b from-purple-500 to-indigo-600 text-white font-black text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
                >
                  START BOT DUEL NOW
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 2: PLAYER PROFILE & AVATAR MODAL */}
      {/* -------------------------------------------------------------------- */}
      {isLoginOpen && (
        <div
          id="login-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white border-4 border-amber-300 p-6 sm:p-7 shadow-2xl text-slate-700 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                    PLAYER PROFILE
                  </h3>
                  <p className="text-[11px] text-slate-500">Choose your name & game icon</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">YOUR NAME:</label>
              <input
                id="login-username-input"
                type="text"
                maxLength={15}
                value={username}
                onChange={(e) => handleUpdateProfile({ username: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-sm focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">CHOOSE AN ICON:</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {["⚡", "🎮", "⭐", "🦊", "🦉", "🚀", "💎", "🔥", "🐱", "🐶"].map((av) => (
                  <button
                    key={av}
                    onClick={() => handleUpdateProfile({ avatar: av })}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                      avatar === av
                        ? "bg-amber-400 text-amber-950 scale-110 border-2 border-amber-500 shadow-md"
                        : "bg-slate-50 text-slate-700 hover:bg-amber-50 border-2 border-slate-200"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsLoginOpen(false)}
              className="mt-2 w-full py-3.5 rounded-2xl btn-candy-green text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              SAVE PROFILE
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 3: USER DASHBOARD LAYER */}
      {/* -------------------------------------------------------------------- */}
      <UserDashboard
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
        username={username}
        playerId={playerId}
        avatar={avatar}
        onUpdateProfile={handleUpdateProfile}
        onCreateRoom={() => setIsMatchmakerOpen(true)}
        onJoinRoom={() => setIsMatchmakerOpen(true)}
      />

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 4: ADMIN DASHBOARD LAYER */}
      {/* -------------------------------------------------------------------- */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* -------------------------------------------------------------------- */}
      {/* GAME ENTRANCE MODAL (EASY, MEDIUM, HARD, MODES) */}
      {/* -------------------------------------------------------------------- */}
      <GameEntranceModal
        isOpen={isEntranceModalOpen}
        onClose={() => setIsEntranceModalOpen(false)}
        onStartPuzzles={(diff) => {
          const safe = typeof diff === "string" && ["EASY", "MEDIUM", "HARD"].includes(diff.toUpperCase())
            ? diff.toUpperCase()
            : "MEDIUM";
          setPuzzleDifficulty(safe);
          setIsPuzzleModeActive(true);
          setCurrentView("PUZZLES");
        }}
        onCreateRoom={(wLen, tRounds) => {
          handleCreateRoom(wLen, tRounds);
        }}
        onJoinRoom={(code) => {
          handleJoinRoom(code);
        }}
        onPlayBot={(wLen, tRounds) => {
          handlePlayBot(wLen, tRounds);
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* DICTIONARY HELPER MODAL */}
      {/* -------------------------------------------------------------------- */}
      <DictionaryHelperModal
        isOpen={isDictionaryHelperOpen}
        onClose={() => setIsDictionaryHelperOpen(false)}
        targetLength={room ? room.wordLength : 5}
        onSelectWord={(word) => {
          setSecretWordInput(word);
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* LAYER 6: RULES CODEX MODAL */}
      {/* -------------------------------------------------------------------- */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* -------------------------------------------------------------------- */}
      {/* ANAGRAM SOLVER & CHALLENGE MODAL */}
      {/* -------------------------------------------------------------------- */}
      <AnagramSolver
        isOpen={isAnagramModalOpen}
        onClose={() => setIsAnagramModalOpen(false)}
      />

      {/* Countdown Overlay */}
      {countdownSeconds !== null && <Countdown seconds={countdownSeconds} />}

      {/* Game Over Winner Modal */}
      {room && room.phase === "GAME_OVER" && (
        <WinnerModal
          isOpen={true}
          room={room}
          selfPlayerId={playerId}
          onRematch={handleRematch}
          onGoHome={handleLeaveRoom}
        />
      )}

      {/* Floating Emote Overlays */}
      {floatingEmotes.length > 0 && (
        <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-2 pointer-events-none">
          {floatingEmotes.map((fe) => (
            <div
              key={fe.id}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 border-2 border-amber-300 shadow-xl backdrop-blur-md animate-bounce"
            >
              <span className="text-2xl">{fe.emote}</span>
              <span className="text-xs font-black text-slate-800">{fe.senderName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toast Alerts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* -------------------------------------------------------------------- */}
      {/* Footer */}
      {/* -------------------------------------------------------------------- */}
      <footer className="w-full py-4 px-4 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto relative z-10 font-sans">
        <div className="flex items-center gap-2">
          <span className="font-black text-emerald-800">word</span>
          <span>&bull;</span>
          <span className="font-medium text-slate-600">Friendly 1v1 Multiplayer Word Game</span>
        </div>
        <div className="flex items-center gap-3 mt-1 sm:mt-0 text-slate-500 font-medium">
          <span>Live Real-Time Multiplayer &bull; Gemini AI Hints &bull; Simple & Fun</span>
        </div>
      </footer>
    </div>
  );
}
