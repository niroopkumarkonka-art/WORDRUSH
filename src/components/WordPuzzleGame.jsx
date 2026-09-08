import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Sparkles,
  RotateCcw,
  ArrowRight,
  BookOpen,
  X,
  Star,
  Lightbulb,
  Search,
  Trophy,
  Zap,
  Flame,
  Dices,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  CornerDownLeft,
  Trash2,
  Check,
  Copy,
} from "lucide-react";
import confetti from "canvas-confetti";
import { LetterTile } from "./LetterTile";
import { Keyboard } from "./Keyboard";
import { AnagramSolver } from "./AnagramSolver";
import { classifyWord } from "../utils/wordClassifier";
import {
  DIFFICULTY_LEVELS,
  getPuzzlesByDifficulty,
  getRandomDictionaryWord,
  lookupWord,
} from "../utils/dictionary";

export const WordPuzzleGame = ({
  isOpen = false,
  onClose,
  initialDifficulty = "MEDIUM",
}) => {
  const safeInitialDiff =
    typeof initialDifficulty === "string" &&
    ["EASY", "MEDIUM", "HARD"].includes(initialDifficulty.toUpperCase())
      ? initialDifficulty.toUpperCase()
      : "MEDIUM";

  const [difficulty, setDifficulty] = useState(safeInitialDiff);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [overridePuzzle, setOverridePuzzle] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [isShake, setIsShake] = useState(false);
  const [stars, setStars] = useState(0);

  // Solved Count and Streak
  const [solvedCount, setSolvedCount] = useState(() => {
    try {
      return Number(localStorage.getItem("wordrush_puzzles_solved") || "0");
    } catch {
      return 0;
    }
  });

  const [streak, setStreak] = useState(() => {
    try {
      return Number(localStorage.getItem("wordrush_puzzle_streak") || "0");
    } catch {
      return 0;
    }
  });

  // Cumulative Player Points
  const [playerPoints, setPlayerPoints] = useState(() => {
    try {
      return Number(localStorage.getItem("wordrush_player_points") || "0");
    } catch {
      return 0;
    }
  });

  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [pointsNotification, setPointsNotification] = useState(null);

  // Persistent Saved Words Vault
  const [savedWords, setSavedWords] = useState(() => {
    try {
      const raw = localStorage.getItem("wordrush_saved_puzzle_words");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultFilter, setVaultFilter] = useState("ALL");
  const [copiedWord, setCopiedWord] = useState(null);

  // Modals & Drawers
  const [showDictHelper, setShowDictHelper] = useState(false);
  const [dictSearch, setDictSearch] = useState("");
  const [isAnagramModalOpen, setIsAnagramModalOpen] = useState(false);

  // Refs for synchronous, closure-safe access
  const currentInputRef = useRef(currentInput);
  useEffect(() => {
    currentInputRef.current = currentInput;
  }, [currentInput]);

  const isGameOverRef = useRef(isGameOver);
  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  const activeLevelConfig =
    DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.MEDIUM;
  const wordLength = activeLevelConfig.wordLength;
  const maxAttempts = activeLevelConfig.maxAttempts;

  const wordLengthRef = useRef(wordLength);
  useEffect(() => {
    wordLengthRef.current = wordLength;
  }, [wordLength]);

  // Ref to only react when initialDifficulty prop actually changes from the outside
  const initialDiffRef = useRef(initialDifficulty);
  useEffect(() => {
    if (initialDifficulty && initialDifficulty !== initialDiffRef.current) {
      initialDiffRef.current = initialDifficulty;
      const valid =
        typeof initialDifficulty === "string" &&
        ["EASY", "MEDIUM", "HARD"].includes(initialDifficulty.toUpperCase())
          ? initialDifficulty.toUpperCase()
          : "MEDIUM";
      setDifficulty(valid);
      setOverridePuzzle(null);
      setPuzzleIndex(0);
      setGuesses([]);
      setCurrentInput("");
      setIsGameOver(false);
      setHasWon(false);
      setShowHint(false);
      setHintsRevealed(0);
      setIsShake(false);
      setStars(0);
      setLastPointsEarned(0);
    }
  }, [initialDifficulty]);

  // Curated puzzle list for selected difficulty
  const basePuzzleList = useMemo(() => {
    return getPuzzlesByDifficulty(difficulty);
  }, [difficulty]);

  // Guaranteed fresh puzzle on every puzzleIndex increment or override
  const currentPuzzle = useMemo(() => {
    if (overridePuzzle) return overridePuzzle;
    if (!basePuzzleList || basePuzzleList.length === 0) {
      return {
        word: "ARENA",
        definition: "A place for contests and gaming.",
        clue: "Grand venue for duels",
        category: "Noun",
      };
    }
    const idx = Math.abs(puzzleIndex) % basePuzzleList.length;
    return basePuzzleList[idx];
  }, [overridePuzzle, basePuzzleList, puzzleIndex]);

  const targetWord = (currentPuzzle?.word || "ARENA").toUpperCase();
  const targetWordRef = useRef(targetWord);
  useEffect(() => {
    targetWordRef.current = targetWord;
  }, [targetWord]);

  // Save Solved/Deciphered Word to Persistent Vault
  const saveWordToCollection = useCallback(
    (word, definition, clue, category, diff, points, method = "SOLVED") => {
      const clean = (word || "").toUpperCase().trim();
      if (!clean) return;

      setSavedWords((prev) => {
        const existingIdx = prev.findIndex((item) => item.word === clean);
        const entry = {
          word: clean,
          definition:
            definition ||
            lookupWord(clean)?.definition ||
            "Word successfully deciphered in puzzle challenge.",
          clue: clue || lookupWord(clean)?.clue || "Vocabulary master duel",
          category: category || lookupWord(clean)?.category || "Noun",
          difficulty: diff || difficulty,
          points: points || 100,
          method,
          solvedAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        const updated =
          existingIdx >= 0
            ? prev.map((item, idx) => (idx === existingIdx ? { ...item, ...entry } : item))
            : [entry, ...prev];

        try {
          localStorage.setItem("wordrush_saved_puzzle_words", JSON.stringify(updated));
        } catch (e) {
          console.warn("Could not persist saved word to localStorage", e);
        }
        return updated;
      });
    },
    [difficulty]
  );

  // Reset or Switch to another puzzle
  const resetPuzzle = useCallback(
    (newDiff = null, newIndex = null) => {
      if (newDiff) setDifficulty(newDiff);
      if (newIndex !== null) setPuzzleIndex(newIndex);
      setOverridePuzzle(null);
      setGuesses([]);
      setCurrentInput("");
      setIsGameOver(false);
      setHasWon(false);
      setShowHint(false);
      setHintsRevealed(0);
      setIsShake(false);
      setStars(0);
      setLastPointsEarned(0);
    },
    []
  );

  // Next Word Functionality: Unconditionally advance to next word
  const handleNextWord = useCallback(() => {
    setOverridePuzzle(null);
    setPuzzleIndex((prev) => prev + 1);
    setGuesses([]);
    setCurrentInput("");
    setIsGameOver(false);
    setHasWon(false);
    setShowHint(false);
    setHintsRevealed(0);
    setIsShake(false);
    setStars(0);
    setLastPointsEarned(0);
  }, []);

  // Create/Generate Random Puzzle from Native C++ Engine or Dictionary
  const handleGenerateRandomPuzzle = useCallback(async () => {
    let newWord = null;
    let newClue = null;
    let newDef = null;
    let newCat = "Vocabulary";

    try {
      const res = await fetch(`/api/puzzles/generate?difficulty=${difficulty}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.word) {
          newWord = data.word.toUpperCase();
        }
      }
    } catch (e) {
      console.warn("API random puzzle generation fell back to dictionary:", e);
    }

    if (!newWord) {
      const randomEntry = getRandomDictionaryWord(wordLength);
      if (randomEntry) {
        newWord = randomEntry.word.toUpperCase();
        newClue = randomEntry.clue;
        newDef = randomEntry.definition;
        newCat = randomEntry.category;
      }
    }

    if (!newWord) {
      const idx = Math.floor(Math.random() * basePuzzleList.length);
      const entry = basePuzzleList[idx];
      newWord = entry.word.toUpperCase();
      newClue = entry.clue;
      newDef = entry.definition;
      newCat = entry.category;
    }

    const dictData = lookupWord(newWord);
    const generated = {
      word: newWord,
      clue: newClue || dictData?.clue || `Secret ${wordLength}-letter mystery word`,
      definition: newDef || dictData?.definition || "A verified English vocabulary word.",
      category: newCat || dictData?.category || "Noun",
      difficulty,
      isRandom: true,
    };

    setOverridePuzzle(generated);
    setGuesses([]);
    setCurrentInput("");
    setIsGameOver(false);
    setHasWon(false);
    setShowHint(false);
    setHintsRevealed(0);
    setIsShake(false);
    setStars(0);
    setLastPointsEarned(0);
    setPointsNotification(`🎲 Random ${wordLength}-Letter Puzzle Generated!`);
    setTimeout(() => setPointsNotification(null), 3000);
  }, [difficulty, wordLength, basePuzzleList]);

  // Keyboard letter states calculation
  const keyStates = useMemo(() => {
    const states = {};
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        if (targetWord[i] === letter) {
          states[letter] = "GREEN";
        } else if (targetWord.includes(letter)) {
          if (states[letter] !== "GREEN") {
            states[letter] = "YELLOW";
          }
        } else {
          if (!states[letter]) {
            states[letter] = "GRAY";
          }
        }
      }
    }
    return states;
  }, [guesses, targetWord]);

  // Real-time classification of currently typed letters
  const classification = useMemo(() => {
    if (!currentInput) return null;
    return classifyWord(currentInput);
  }, [currentInput]);

  // Handle Guess Submission, Board Saving, and Points Calculation
  const handleSubmitGuess = useCallback(() => {
    const raw = currentInputRef.current.toUpperCase().trim();
    if (raw.length !== wordLengthRef.current) {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    const currentWord = targetWordRef.current;
    const cleanGuess = raw;
    const newGuesses = [...guesses, cleanGuess];
    setGuesses(newGuesses);
    setCurrentInput("");

    // Check if won
    if (cleanGuess === currentWord) {
      setHasWon(true);
      setIsGameOver(true);
      const earnedStars =
        newGuesses.length <= 2 ? 3 : newGuesses.length <= 4 ? 2 : 1;
      setStars(earnedStars);

      // Points: 1st=160, 2nd=130, 3rd=105, 4th=85, 5th=65, 6th=50
      const basePtsTable = [160, 130, 105, 85, 65, 50];
      const basePts = basePtsTable[newGuesses.length - 1] || 50;
      const cleanBonus = hintsRevealed === 0 ? 30 : 0;
      const newStreak = streak + 1;
      setStreak(newStreak);
      const streakBonus = Math.min(newStreak * 10, 60);
      const totalPointsWon = basePts + cleanBonus + streakBonus;

      setLastPointsEarned(totalPointsWon);
      setPointsNotification(`+${totalPointsWon} Points Gained! 🌟 Word Saved!`);
      setTimeout(() => setPointsNotification(null), 3000);

      // Persist cumulative player points
      setPlayerPoints((prev) => {
        const next = prev + totalPointsWon;
        try {
          localStorage.setItem("wordrush_player_points", String(next));
          localStorage.setItem("wordrush_puzzle_streak", String(newStreak));
        } catch {}
        return next;
      });

      // Persist solved count
      const newSolved = solvedCount + 1;
      setSolvedCount(newSolved);
      try {
        localStorage.setItem("wordrush_puzzles_solved", String(newSolved));
      } catch {}

      // PERSIST WORD IN SAVED WORDS VAULT
      saveWordToCollection(
        currentWord,
        currentPuzzle.definition,
        currentPuzzle.clue,
        currentPuzzle.category,
        difficulty,
        totalPointsWon,
        "SOLVED"
      );

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10b981", "#06b6d4", "#facc15", "#38bdf8", "#ec4899"],
        });
      } catch {}
    } else if (newGuesses.length >= maxAttempts) {
      setIsGameOver(true);
      setHasWon(false);
      setStreak(0);
      try {
        localStorage.setItem("wordrush_puzzle_streak", "0");
      } catch {}
    }
  }, [
    guesses,
    hintsRevealed,
    streak,
    solvedCount,
    maxAttempts,
    currentPuzzle,
    difficulty,
    saveWordToCollection,
  ]);

  // Auto-Solve Current Puzzle Cipher with Points, Confetti, and Word Saving
  const handleAutoSolvePuzzle = useCallback(() => {
    if (isGameOverRef.current) return;

    const currentWord = targetWordRef.current;
    setCurrentInput("");
    const newGuesses = [...guesses, currentWord];
    setGuesses(newGuesses);
    setHasWon(true);
    setIsGameOver(true);
    setStars(3);

    const solverPoints = 100;
    setLastPointsEarned(solverPoints);
    setPointsNotification(`+${solverPoints} Points! (Auto-Solved & Saved ⚡)`);
    setTimeout(() => setPointsNotification(null), 3000);

    setPlayerPoints((prev) => {
      const next = prev + solverPoints;
      try {
        localStorage.setItem("wordrush_player_points", String(next));
      } catch {}
      return next;
    });

    const newSolved = solvedCount + 1;
    setSolvedCount(newSolved);
    try {
      localStorage.setItem("wordrush_puzzles_solved", String(newSolved));
    } catch {}

    // Save word into persistent vault
    saveWordToCollection(
      currentWord,
      currentPuzzle.definition,
      currentPuzzle.clue,
      currentPuzzle.category,
      difficulty,
      solverPoints,
      "AUTO_SOLVED"
    );

    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.6 },
        colors: ["#10b981", "#06b6d4", "#facc15", "#a855f7", "#ec4899"],
      });
    } catch {}
  }, [guesses, solvedCount, currentPuzzle, difficulty, saveWordToCollection]);

  // Step-by-Step AI Solver: Fills the next correct letter or submits if full
  const handleSolveStep = useCallback(() => {
    if (isGameOverRef.current) return;
    const currentWord = targetWordRef.current;
    const curr = currentInputRef.current;
    if (curr.length < currentWord.length) {
      const nextChar = currentWord[curr.length];
      setCurrentInput((prev) => (prev + nextChar).toUpperCase());
    } else {
      handleSubmitGuess();
    }
  }, [handleSubmitGuess]);

  // Robust Keypress Handler for Physical and Virtual Keyboards
  const handleKeyPress = useCallback(
    (char) => {
      if (isGameOverRef.current) return;

      if (char === "ENTER") {
        handleSubmitGuess();
      } else if (char === "BACKSPACE" || char === "DELETE") {
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/i.test(char)) {
        setCurrentInput((prev) =>
          prev.length < wordLengthRef.current ? (prev + char).toUpperCase() : prev
        );
      }
    },
    [handleSubmitGuess]
  );

  // Global Keyboard Listener: Captures physical keystrokes reliably
  useEffect(() => {
    if (!isOpen || isAnagramModalOpen || isVaultOpen) return;

    const handleKeyDown = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        handleKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isAnagramModalOpen, isVaultOpen, handleKeyPress]);

  // Copy word helper for Saved Vault
  const handleCopyWord = (word) => {
    navigator.clipboard?.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  // Filtered saved words
  const filteredSavedWords = useMemo(() => {
    return savedWords.filter((item) => {
      const matchesFilter =
        vaultFilter === "ALL" || item.difficulty === vaultFilter;
      const matchesSearch =
        !vaultSearch ||
        item.word.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        item.definition?.toLowerCase().includes(vaultSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [savedWords, vaultFilter, vaultSearch]);

  if (!isOpen) return null;

  return (
    <>
      <div
        id="word-puzzle-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto"
      >
        <div className="relative w-full max-w-xl my-auto rounded-3xl bg-gradient-to-b from-white via-amber-50/40 to-amber-100/30 border-4 border-amber-300 p-4 sm:p-6 shadow-2xl text-slate-800 flex flex-col gap-3 sm:gap-4">
          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md text-slate-900">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wider">
                    Word Puzzles
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                    Puzzle {puzzleIndex + 1}
                  </span>

                  {/* Next Word Button right on header */}
                  <button
                    id="puzzle-header-next-word-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNextWord();
                    }}
                    title="Get another word puzzle"
                    className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider border-2 border-amber-500 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 hover:scale-102"
                  >
                    <span>Next Word</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {/* Random Puzzle Generator Button */}
                  <button
                    type="button"
                    id="puzzle-header-random-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleGenerateRandomPuzzle();
                    }}
                    title="Generate a completely random puzzle"
                    className="px-2.5 py-1 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider border-2 border-purple-600 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 hover:scale-102"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Random</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Solve puzzle ciphers, unscramble anagrams, and save words
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Saved Words Vault Trigger Button */}
              <button
                type="button"
                id="puzzle-vault-btn"
                onClick={() => setIsVaultOpen(true)}
                className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-black text-xs shadow-xs cursor-pointer transition-all active:scale-95"
                title="View your saved puzzle words vault"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-600 fill-indigo-200" />
                <span className="hidden sm:inline">Saved</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                  {savedWords.length}
                </span>
              </button>

              {/* Player Points Counter Badge */}
              <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs border border-white shadow-xs">
                <Trophy className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                <span>{playerPoints.toLocaleString()} PTS</span>

                {pointsNotification && (
                  <span className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black animate-bounce shadow-md whitespace-nowrap">
                    {pointsNotification}
                  </span>
                )}
              </div>

              {/* Streak Badge */}
              {streak > 0 && (
                <div
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900 font-black text-xs border border-orange-200"
                  title={`${streak} consecutive puzzle solve streak!`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>{streak}</span>
                </div>
              )}

              {/* Close Modal Button */}
              <button
                type="button"
                id="puzzle-modal-close-btn"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Difficulty Level Tabs: Easy (4), Medium (5), Hard (6) */}
          <div className="grid grid-cols-3 gap-2">
            {Object.values(DIFFICULTY_LEVELS).map((lvl) => {
              const isActive = difficulty === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  id={`puzzle-diff-${lvl.id.toLowerCase()}-btn`}
                  onClick={() => resetPuzzle(lvl.id, 0)}
                  className={`py-2 px-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border-2 ${
                    isActive
                      ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 border-amber-500 shadow-md scale-102"
                      : "bg-white hover:bg-amber-50/60 text-slate-600 border-amber-200 shadow-xs"
                  }`}
                >
                  <span className="uppercase tracking-wider">{lvl.name}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      isActive ? "text-amber-900" : "text-slate-500"
                    }`}
                  >
                    {lvl.wordLength} Letters
                  </span>
                </button>
              );
            })}
          </div>

          {/* Puzzle Clue Card with Quick Actions */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/90 border border-amber-300 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Puzzle Clue
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white text-amber-800 font-bold border border-amber-200">
                  {currentPuzzle.category || "Noun"}
                </span>
                {currentPuzzle.isRandom && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-black border border-purple-300">
                    🎲 Random
                  </span>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {/* Auto-Solve Current Puzzle Button */}
                <button
                  type="button"
                  id="puzzle-clue-autosolve-btn"
                  onClick={handleAutoSolvePuzzle}
                  disabled={isGameOver}
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-40"
                  title="Automatically solve this puzzle and gain points"
                >
                  <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                  <span>Auto-Solve Puzzle</span>
                </button>

                {/* Anagram Solver Trigger */}
                <button
                  type="button"
                  id="puzzle-clue-anagram-btn"
                  onClick={() => setIsAnagramModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs border border-purple-200 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Unscramble letters for this cipher"
                >
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Anagram Solver</span>
                </button>

                {/* Need Hint Link */}
                <button
                  type="button"
                  id="puzzle-clue-hint-btn"
                  onClick={() => {
                    setShowHint(true);
                    setHintsRevealed((prev) => prev + 1);
                  }}
                  className="text-xs font-black text-amber-700 hover:text-amber-900 underline cursor-pointer flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Need Hint?</span>
                </button>

                {/* Get Other Word Link */}
                <button
                  type="button"
                  id="puzzle-clue-other-word-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextWord();
                  }}
                  className="text-xs font-black text-emerald-800 hover:text-emerald-950 underline cursor-pointer flex items-center gap-1"
                  title="Switch to next word puzzle"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Get Other Word</span>
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-700 italic">
              "{currentPuzzle.clue || "Decipher the secret letters from context clues."}"
            </p>

            {showHint && (
              <div className="p-2.5 rounded-xl bg-white/90 border border-amber-300 text-xs text-slate-700 animate-fadeIn">
                <span className="font-bold text-amber-900">Hint Clue: </span>
                {hintsRevealed === 1
                  ? `Starts with letter '${targetWord[0]}' and ends with '${targetWord[targetWord.length - 1]}'.`
                  : `Definition: ${currentPuzzle.definition}`}
              </div>
            )}
          </div>

          {/* The Word Puzzle Grid */}
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
              const isPastGuess = rowIndex < guesses.length;
              const isCurrentRow = rowIndex === guesses.length;
              const rowGuess = isPastGuess
                ? guesses[rowIndex]
                : isCurrentRow
                ? currentInput
                : "";

              return (
                <div
                  key={rowIndex}
                  className={`flex items-center justify-center gap-2 p-1 rounded-2xl transition-all ${
                    isCurrentRow && isShake ? "animate-shake" : ""
                  }`}
                >
                  {Array.from({ length: wordLength }).map((_, colIndex) => {
                    const letter = rowGuess[colIndex] || "";
                    let state = "EMPTY";
                    let isFirstCharMatch = false;

                    if (isPastGuess) {
                      if (letter === targetWord[colIndex]) {
                        state = "GREEN";
                        if (colIndex === 0) {
                          isFirstCharMatch = true;
                        }
                      } else if (targetWord.includes(letter)) {
                        state = "YELLOW";
                      } else {
                        state = "GRAY";
                      }
                    } else if (isCurrentRow && letter) {
                      state = "TENTATIVE";
                      if (colIndex === 0 && letter === targetWord[0]) {
                        isFirstCharMatch = true;
                      }
                    }

                    return (
                      <LetterTile
                        key={colIndex}
                        letter={letter}
                        state={state}
                        index={colIndex}
                        size={
                          wordLength === 6
                            ? "sm"
                            : wordLength === 5
                            ? "md"
                            : "lg"
                        }
                        isFirstCharMatch={isFirstCharMatch}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Action Row: Random, Auto-Solve, Anagram, and Saved Vault Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-1 text-xs">
            <div className="flex items-center flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">
              <button
                type="button"
                id="puzzle-bottom-next-word-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNextWord();
                }}
                className="px-3 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                title="Get another word puzzle immediately"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Next Word</span>
              </button>

              <button
                type="button"
                id="puzzle-bottom-random-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGenerateRandomPuzzle();
                }}
                className="px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                title="Generate a completely random puzzle"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Random Puzzle</span>
              </button>

              <button
                type="button"
                id="puzzle-bottom-autosolve-btn"
                onClick={handleAutoSolvePuzzle}
                disabled={isGameOver}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs disabled:opacity-50"
                title="Automatically solve this puzzle and save word"
              >
                <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                <span>Auto-Solve</span>
              </button>

              <button
                type="button"
                id="puzzle-bottom-solvestep-btn"
                onClick={handleSolveStep}
                disabled={isGameOver}
                className="px-3 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-950 font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs disabled:opacity-50"
                title="Reveal next letter or solve step"
              >
                <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                <span>Solve Step</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setIsVaultOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black border border-indigo-200 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Vault ({savedWords.length})</span>
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-600 font-bold border border-slate-200 shadow-xs">
                {guesses.length} / {maxAttempts} tries used
              </div>
            </div>
          </div>

          {/* Real-Time Word & Name Detector Mention + Direct Submit Button */}
          {currentInput && classification && (
            <div className="p-3 rounded-2xl bg-white border border-amber-200 flex flex-col gap-2 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                    Lexical Inspector:
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black border flex items-center gap-1 ${classification.badgeColor}`}
                  >
                    <span>{classification.icon}</span>
                    <span>{classification.label}</span>
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-600">
                  {currentInput.length} / {wordLength} letters
                </span>
              </div>

              {classification.note && (
                <p className="text-[11px] text-purple-900 bg-purple-50 p-1.5 rounded-lg border border-purple-200">
                  {classification.note}
                </p>
              )}

              {/* Direct Submit Word Button when full word length is typed */}
              {currentInput.length === wordLength && !isGameOver && (
                <button
                  type="button"
                  id="puzzle-direct-submit-btn"
                  onClick={handleSubmitGuess}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 animate-bounce"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Word "{currentInput}" (Press ENTER)</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Game Over Modal / Result Banner with Points Earned */}
          {isGameOver && (
            <div
              className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-3 animate-pop ${
                hasWon
                  ? "bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950"
                  : "bg-gradient-to-b from-rose-50 to-orange-50 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{hasWon ? "🎉" : "💥"}</span>
                <h3 className="text-lg font-black uppercase tracking-wider">
                  {hasWon ? "Puzzle Deciphered!" : "Attempts Exhausted"}
                </h3>
              </div>

              {hasWon ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < stars
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-emerald-800">
                    +{lastPointsEarned} Points Earned! • Streak: {streak} 🔥
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 mt-1">
                    💾 Word Saved to Your Solved Vault!
                  </span>
                </div>
              ) : (
                <p className="text-xs font-semibold text-rose-800">
                  Better luck on the next cipher!
                </p>
              )}

              <div className="p-3 rounded-xl bg-white/90 border border-slate-200 flex flex-col items-center w-full max-w-sm shadow-xs">
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  The Secret Word Was:
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-widest mt-0.5">
                  {targetWord}
                </span>
                <p className="text-xs text-slate-600 mt-1 italic max-w-md">
                  "{currentPuzzle.definition}"
                </p>
              </div>

              <div className="flex gap-2 w-full max-w-sm mt-1">
                <button
                  type="button"
                  onClick={() => resetPuzzle(difficulty, puzzleIndex)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Word</span>
                </button>
                <button
                  type="button"
                  id="puzzle-victory-next-word-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextWord();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl btn-candy-green text-white font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-102"
                >
                  <span>Next Word Puzzle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Dictionary Helper Drawer / Lookup Button */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              id="puzzle-dict-toggle-btn"
              onClick={() => setShowDictHelper(!showDictHelper)}
              className="text-xs font-black text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>
                {showDictHelper ? "Hide Dictionary Words" : "Browse Dictionary Words"}
              </span>
            </button>
            <span className="text-[11px] text-slate-500 font-medium">
              Click any word to fill • First letter matches get Cyan
            </span>
          </div>

          {/* Collapsible Dictionary Helper */}
          {showDictHelper && (
            <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col gap-2 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-teal-700" />
                <input
                  type="text"
                  placeholder={`Search ${wordLength}-letter dictionary words...`}
                  value={dictSearch}
                  onChange={(e) => setDictSearch(e.target.value.toUpperCase())}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-teal-300 text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {basePuzzleList
                  .filter((p) => !dictSearch || p.word.includes(dictSearch))
                  .slice(0, 16)
                  .map((p) => (
                    <button
                      key={p.word}
                      type="button"
                      onClick={() => {
                        if (!isGameOver) {
                          setCurrentInput(p.word);
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-teal-100 text-teal-900 font-bold text-xs border border-teal-200 cursor-pointer transition-colors"
                      title={p.definition}
                    >
                      {p.word}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* On-Screen Virtual Keyboard */}
          <div className="w-full mt-1">
            <Keyboard
              onChar={(c) => handleKeyPress(c)}
              onEnter={() => handleKeyPress("ENTER")}
              onDelete={() => handleKeyPress("BACKSPACE")}
              onKeyPress={handleKeyPress}
              letterStates={keyStates}
              keyStates={keyStates}
              disabled={isGameOver}
              listenGlobalKeyboard={false}
            />
          </div>
        </div>
      </div>

      {/* Embedded Anagram Solver Modal */}
      <AnagramSolver
        isOpen={isAnagramModalOpen}
        onClose={() => setIsAnagramModalOpen(false)}
        initialLetters={targetWord}
        onSelectWord={(word) => {
          if (!isGameOver && word.length === wordLength) {
            setCurrentInput(word);
            setIsAnagramModalOpen(false);
          }
        }}
      />

      {/* Saved Words Vault Modal */}
      {isVaultOpen && (
        <div
          id="saved-words-vault-modal"
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-lg max-h-[90vh] rounded-3xl bg-gradient-to-b from-white to-indigo-50/50 border-4 border-indigo-300 p-5 shadow-2xl text-slate-800 flex flex-col gap-4 overflow-hidden">
            {/* Vault Header */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-700">
                  <BookmarkCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider">
                      Saved Words Vault
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-indigo-200 text-indigo-900">
                      {savedWords.length} Words
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your collection of solved puzzle words and lexical definitions
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsVaultOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-indigo-200">
                <Search className="w-4 h-4 text-indigo-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search in saved words and definitions..."
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
                />
                {vaultSearch && (
                  <button
                    type="button"
                    onClick={() => setVaultSearch("")}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {["ALL", "EASY", "MEDIUM", "HARD"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setVaultFilter(f)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      vaultFilter === f
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Words List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[50vh]">
              {filteredSavedWords.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Bookmark className="w-8 h-8 stroke-1 text-slate-300" />
                  <p className="text-xs font-bold">
                    {savedWords.length === 0
                      ? "No puzzle words saved yet! Solve puzzles to save words into your vault."
                      : "No words matching your filter."}
                  </p>
                </div>
              ) : (
                filteredSavedWords.map((item) => (
                  <div
                    key={item.word}
                    className="p-3 rounded-2xl bg-white border border-indigo-100 hover:border-indigo-300 shadow-xs flex flex-col gap-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 tracking-wider">
                          {item.word}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${
                            item.difficulty === "EASY"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : item.difficulty === "HARD"
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {item.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {item.category || "Noun"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyWord(item.word)}
                          className="p-1 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Copy word"
                        >
                          {copiedWord === item.word ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          +{item.points} pts
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{item.definition}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Solved: {item.solvedAt || "Recently"}</span>
                      <span className="font-semibold text-indigo-700">
                        Method: {item.method === "AUTO_SOLVED" ? "⚡ Auto-Solved" : "🌟 Solved"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Vault Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-indigo-100 text-xs">
              <span className="text-slate-500 font-semibold">
                Total Saved: {savedWords.length} words
              </span>

              {savedWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear your saved words vault?")) {
                      setSavedWords([]);
                      localStorage.removeItem("wordrush_saved_puzzle_words");
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Vault</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WordPuzzleGame;
