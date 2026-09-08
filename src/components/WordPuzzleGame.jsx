import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  Award,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  X,
  Volume2,
  VolumeX,
  Star,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";
import { LetterTile } from "./LetterTile";
import { Keyboard } from "./Keyboard";
import { classifyWord } from "../utils/wordClassifier";
import {
  DIFFICULTY_LEVELS,
  getPuzzlesByDifficulty,
  lookupWord,
} from "../utils/dictionary";
import { soundManager } from "../services/audio";

export const WordPuzzleGame = ({
  isOpen = false,
  onClose,
  initialDifficulty = "MEDIUM",
}) => {
  const safeInitialDiff = typeof initialDifficulty === "string" && ["EASY", "MEDIUM", "HARD"].includes(initialDifficulty.toUpperCase())
    ? initialDifficulty.toUpperCase()
    : "MEDIUM";
  const [difficulty, setDifficulty] = useState(safeInitialDiff);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [isShake, setIsShake] = useState(false);
  const [stars, setStars] = useState(0);
  const [solvedCount, setSolvedCount] = useState(() => {
    try {
      return Number(localStorage.getItem("wordrush_puzzles_solved") || "0");
    } catch {
      return 0;
    }
  });
  const [showDictHelper, setShowDictHelper] = useState(false);
  const [dictSearch, setDictSearch] = useState("");

  // Sync state if initialDifficulty prop changes
  useEffect(() => {
    const valid = typeof initialDifficulty === "string" && ["EASY", "MEDIUM", "HARD"].includes(initialDifficulty.toUpperCase())
      ? initialDifficulty.toUpperCase()
      : "MEDIUM";
    setDifficulty(valid);
    setPuzzleIndex(0);
    setGuesses([]);
    setCurrentInput("");
    setIsGameOver(false);
    setHasWon(false);
    setShowHint(false);
    setHintsRevealed(0);
    setIsShake(false);
    setStars(0);
  }, [initialDifficulty]);

  const activeLevelConfig = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.MEDIUM;
  const wordLength = activeLevelConfig.wordLength;
  const maxAttempts = activeLevelConfig.maxAttempts;

  // Curated puzzle list for selected difficulty
  const puzzleList = useMemo(() => {
    return getPuzzlesByDifficulty(difficulty);
  }, [difficulty]);

  const currentPuzzle = useMemo(() => {
    if (!puzzleList || puzzleList.length === 0) {
      return {
        word: "ARENA",
        definition: "A place for contests and gaming.",
        clue: "Grand venue for duels",
        category: "Noun",
      };
    }
    return puzzleList[puzzleIndex % puzzleList.length];
  }, [puzzleList, puzzleIndex]);

  const targetWord = (currentPuzzle?.word || "ARENA").toUpperCase();

  // Reset board when puzzle or difficulty changes
  const resetPuzzle = useCallback((newDiff = null, newIndex = null) => {
    if (newDiff) setDifficulty(newDiff);
    if (newIndex !== null) setPuzzleIndex(newIndex);
    setGuesses([]);
    setCurrentInput("");
    setIsGameOver(false);
    setHasWon(false);
    setShowHint(false);
    setHintsRevealed(0);
    setIsShake(false);
    setStars(0);
  }, []);

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

  // Handle Letter Submission
  const handleSubmitGuess = useCallback(() => {
    if (currentInput.length !== wordLength) {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      try {
        soundManager.play("error");
      } catch {}
      return;
    }

    const cleanGuess = currentInput.toUpperCase();
    const newGuesses = [...guesses, cleanGuess];
    setGuesses(newGuesses);
    setCurrentInput("");

    // Check if won
    if (cleanGuess === targetWord) {
      setHasWon(true);
      setIsGameOver(true);
      const earnedStars = newGuesses.length <= 2 ? 3 : newGuesses.length <= 4 ? 2 : 1;
      setStars(earnedStars);

      try {
        soundManager.play("win");
      } catch {}

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#06b6d4", "#facc15", "#38bdf8"],
        });
      } catch {}

      const newSolved = solvedCount + 1;
      setSolvedCount(newSolved);
      try {
        localStorage.setItem("wordrush_puzzles_solved", String(newSolved));
      } catch {}
    } else if (newGuesses.length >= maxAttempts) {
      setIsGameOver(true);
      setHasWon(false);
      try {
        soundManager.play("error");
      } catch {}
    } else {
      try {
        soundManager.play("tilePop");
      } catch {}
    }
  }, [currentInput, wordLength, guesses, targetWord, maxAttempts, solvedCount]);

  // Handle physical and on-screen key presses
  const handleKeyPress = useCallback(
    (char) => {
      if (isGameOver) return;

      if (char === "ENTER") {
        handleSubmitGuess();
      } else if (char === "BACKSPACE" || char === "DELETE") {
        setCurrentInput((prev) => prev.slice(0, -1));
        try {
          soundManager.play("keyPress");
        } catch {}
      } else if (/^[A-Z]$/i.test(char)) {
        if (currentInput.length < wordLength) {
          setCurrentInput((prev) => (prev + char).toUpperCase());
          try {
            soundManager.play("keyPress");
          } catch {}
        }
      }
    },
    [isGameOver, currentInput, wordLength, handleSubmitGuess]
  );

  // Listen to physical keyboard when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyPress]);

  if (!isOpen) return null;

  return (
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wider">
                  Word Puzzles
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                  Level {puzzleIndex + 1}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Solve puzzle ciphers with lexical hints & dictionary clues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-xs border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{solvedCount} Solved</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Difficulty Level Switcher (Easy, Medium, Hard) */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          {Object.values(DIFFICULTY_LEVELS).map((lvl) => {
            const isSelected = difficulty === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => resetPuzzle(lvl.id, 0)}
                className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                  isSelected
                    ? `bg-gradient-to-r ${lvl.color} text-white shadow-md scale-102 border-white`
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="font-extrabold">{lvl.name}</span>
                <span className="text-[10px] opacity-90">{lvl.wordLength} Letters</span>
              </button>
            );
          })}
        </div>

        {/* Active Clue & Hint Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-100/70 via-yellow-50 to-emerald-50/70 border-2 border-amber-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Puzzle Clue
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white text-amber-800 font-bold border border-amber-200">
                {currentPuzzle.category || "Vocabulary"}
              </span>
            </div>

            <button
              onClick={() => {
                setShowHint(true);
                setHintsRevealed((prev) => prev + 1);
              }}
              className="text-xs font-black text-amber-700 hover:text-amber-900 underline cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Need Hint?</span>
            </button>
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
            const rowGuess = isPastGuess ? guesses[rowIndex] : isCurrentRow ? currentInput : "";

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
                      // First Character Match: Distinct Electric Cyan Color!
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
                    // If player typed first letter and it matches target word's first letter!
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
                      size={wordLength === 6 ? "sm" : wordLength === 5 ? "md" : "lg"}
                      isFirstCharMatch={isFirstCharMatch}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Real-Time Word & Name Detector Mention (Fulfills user request) */}
        {currentInput && classification && (
          <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex flex-col gap-1 shadow-xs animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
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

            {/* If a Name or specific type is detected, clearly explain to the player */}
            {classification.note && (
              <p className="text-[11px] text-purple-900 bg-purple-50 p-1.5 rounded-lg border border-purple-200">
                {classification.note}
              </p>
            )}
          </div>
        )}

        {/* Game Over Modal / Result Banner */}
        {isGameOver && (
          <div
            className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-3 animate-pop ${
              hasWon
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-rose-50 border-rose-300 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-2">
              {hasWon ? (
                <>
                  <Award className="w-6 h-6 text-emerald-600" />
                  <span className="text-lg font-black uppercase tracking-wider">
                    Cipher Solved!
                  </span>
                  <div className="flex gap-1 ml-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < stars
                            ? "fill-amber-400 text-amber-500 animate-bounce"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                  <span className="text-lg font-black uppercase tracking-wider">
                    Attempts Exhausted
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-col items-center">
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
                onClick={() => resetPuzzle(difficulty, puzzleIndex)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => resetPuzzle(difficulty, (puzzleIndex + 1) % puzzleList.length)}
                className="flex-1 py-2.5 px-4 rounded-xl btn-candy-green text-white font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-102"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Dictionary Helper Drawer / Lookup Button */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setShowDictHelper(!showDictHelper)}
            className="text-xs font-black text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>{showDictHelper ? "Hide Dictionary Words" : "Browse Dictionary Words"}</span>
          </button>
          <span className="text-[11px] text-slate-500 font-medium">
            First letter matches get distinct Cyan coloring
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
              {puzzleList
                .filter((p) => !dictSearch || p.word.includes(dictSearch))
                .slice(0, 16)
                .map((p) => (
                  <button
                    key={p.word}
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
          <Keyboard onKeyPress={handleKeyPress} keyStates={keyStates} disabled={isGameOver} />
        </div>
      </div>
    </div>
  );
};

export default WordPuzzleGame;
