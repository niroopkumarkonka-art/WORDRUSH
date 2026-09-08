import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  Search,
  Shuffle,
  Trophy,
  ArrowRight,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  X,
  Star,
  Copy,
  Check,
  Flame,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { solveAnagramLocally, scrambleWord } from "../utils/anagramSolver";
import { DICTIONARY_ENTRIES, getRandomDictionaryWord } from "../utils/dictionary";
import { soundManager } from "../services/audio";

export const AnagramSolver = ({
  isOpen = false,
  onClose,
  initialLetters = "",
  onSelectWord,
}) => {
  const [activeTab, setActiveTab] = useState("solver"); // 'solver' | 'challenge'
  const [inputLetters, setInputLetters] = useState(initialLetters || "ARENA");
  const [lengthFilter, setLengthFilter] = useState("ALL");
  const [copiedWord, setCopiedWord] = useState(null);

  // Player Cumulative Points (persisted across puzzles)
  const [playerPoints, setPlayerPoints] = useState(() => {
    try {
      return Number(localStorage.getItem("wordrush_player_points") || "0");
    } catch {
      return 0;
    }
  });

  const [pointsGainedAnim, setPointsGainedAnim] = useState(null);

  // Challenge Mode State
  const [challengeTarget, setChallengeTarget] = useState(() => {
    return getRandomDictionaryWord(5)?.word || "ARENA";
  });
  const [challengeScramble, setChallengeScramble] = useState(() => {
    return scrambleWord(challengeTarget);
  });
  const [challengeInput, setChallengeInput] = useState("");
  const [foundWords, setFoundWords] = useState(new Set());
  const [challengeShake, setChallengeShake] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState("");

  // Sync initial letters when prop changes
  useEffect(() => {
    if (initialLetters) {
      setInputLetters(initialLetters.toUpperCase());
    }
  }, [initialLetters]);

  // Award points and save
  const awardPoints = useCallback((amount, reason = "") => {
    setPlayerPoints((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem("wordrush_player_points", String(next));
      } catch {}
      return next;
    });
    setPointsGainedAnim({ amount, reason });
    setTimeout(() => setPointsGainedAnim(null), 2000);
  }, []);

  // Compute Anagrams for solver tab (Checks C++ server API with instant local fallback)
  const [solverResults, setSolverResults] = useState(() => {
    return solveAnagramLocally(inputLetters);
  });

  useEffect(() => {
    if (!inputLetters || inputLetters.length < 3) {
      setSolverResults({ letters: inputLetters, anagrams: [], count: 0 });
      return;
    }

    // Instant local results
    const local = solveAnagramLocally(inputLetters);
    setSolverResults(local);

    // Also query backend C++ engine for any newly learned words
    fetch(`/api/anagram/solve?letters=${encodeURIComponent(inputLetters)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.anagrams) && data.anagrams.length > 0) {
          // Merge definitions from local dictionary
          const merged = data.anagrams.map((a) => {
            const entry = DICTIONARY_ENTRIES[a.word];
            return {
              ...a,
              definition: entry?.definition || "Verified Lexical English Word",
              category: entry?.category || "General",
              clue: entry?.clue || "",
            };
          });
          setSolverResults({
            letters: data.letters,
            count: merged.length,
            anagrams: merged,
          });
        }
      })
      .catch(() => {
        // Safe offline fallback already set
      });
  }, [inputLetters]);

  // Challenge Anagrams list for current challenge word
  const challengeSolutions = useMemo(() => {
    return solveAnagramLocally(challengeTarget);
  }, [challengeTarget]);

  // Shuffle Challenge Letters
  const handleShuffleChallenge = useCallback(() => {
    soundManager.play("tilePop");
    setChallengeScramble(scrambleWord(challengeTarget));
  }, [challengeTarget]);

  // Next Challenge Word Puzzle
  const handleNextChallenge = useCallback(() => {
    const randomLengths = [4, 5, 6];
    const chosenLen = randomLengths[Math.floor(Math.random() * randomLengths.length)];
    const newEntry = getRandomDictionaryWord(chosenLen);
    const word = newEntry?.word || "CANDY";
    setChallengeTarget(word);
    setChallengeScramble(scrambleWord(word));
    setChallengeInput("");
    setFoundWords(new Set());
    setChallengeMessage("");
    soundManager.play("start");
  }, []);

  // Submit guess in Challenge Mode
  const handleChallengeSubmit = useCallback(() => {
    const clean = challengeInput.trim().toUpperCase();
    if (!clean) return;

    if (foundWords.has(clean)) {
      setChallengeMessage(`"${clean}" already discovered!`);
      setChallengeShake(true);
      setTimeout(() => setChallengeShake(false), 500);
      soundManager.play("error");
      return;
    }

    const match = challengeSolutions.anagrams.find((a) => a.word === clean);
    if (match) {
      const newFound = new Set(foundWords);
      newFound.add(clean);
      setFoundWords(newFound);
      setChallengeInput("");

      const pts = match.points || clean.length * 20;
      awardPoints(pts, `Solved "${clean}"!`);
      soundManager.play("win");

      if (clean === challengeTarget || newFound.size === challengeSolutions.anagrams.length) {
        setChallengeMessage(`🎉 Target Anagram Unlocked: ${challengeTarget}! +${pts} PTS`);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      } else {
        setChallengeMessage(`Great word: "${clean}"! +${pts} PTS`);
      }
    } else {
      setChallengeMessage(`"${clean}" is not a valid anagram of these letters.`);
      setChallengeShake(true);
      setTimeout(() => setChallengeShake(false), 500);
      soundManager.play("error");
    }
  }, [challengeInput, foundWords, challengeSolutions, challengeTarget, awardPoints]);

  // Auto-Solve all remaining anagrams in Challenge Mode
  const handleAutoSolveChallenge = useCallback(() => {
    if (!challengeSolutions?.anagrams || challengeSolutions.anagrams.length === 0) return;
    const allWords = challengeSolutions.anagrams.map((a) => a.word);
    const newFound = new Set(allWords);

    // Calculate points for remaining un-found words
    let bonusPoints = 0;
    challengeSolutions.anagrams.forEach((a) => {
      if (!foundWords.has(a.word)) {
        bonusPoints += a.points || a.length * 20;
      }
    });

    setFoundWords(newFound);
    setChallengeInput("");
    setChallengeMessage(`🎉 All Anagram Puzzles Solved! +${bonusPoints} Bonus PTS`);

    if (bonusPoints > 0) {
      awardPoints(bonusPoints, `Auto-Solved ${challengeSolutions.count} Anagrams`);
    }

    soundManager.play("win");
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  }, [challengeSolutions, foundWords, awardPoints]);

  // Filtered solver results
  const filteredAnagrams = useMemo(() => {
    if (!solverResults?.anagrams) return [];
    if (lengthFilter === "ALL") return solverResults.anagrams;
    const targetLen = Number(lengthFilter);
    return solverResults.anagrams.filter((a) => a.length === targetLen);
  }, [solverResults, lengthFilter]);

  // Available length options
  const lengthTabs = useMemo(() => {
    if (!solverResults?.anagrams) return ["ALL"];
    const lens = new Set(solverResults.anagrams.map((a) => a.length));
    const sorted = Array.from(lens).sort((a, b) => b - a);
    return ["ALL", ...sorted.map(String)];
  }, [solverResults]);

  // Copy word to clipboard
  const handleCopy = (word) => {
    try {
      navigator.clipboard.writeText(word);
      setCopiedWord(word);
      setTimeout(() => setCopiedWord(null), 1500);
      soundManager.play("tilePop");
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div
      id="anagram-solver-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-gradient-to-b from-white via-amber-50/50 to-orange-50/40 border-4 border-amber-300 p-4 sm:p-6 shadow-2xl text-slate-800 flex flex-col gap-4">
        {/* Header with Title, Points, and Close */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md text-slate-900">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wider">
                  Anagram Solver & Word Generator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  C++ Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Unscramble letter ciphers, find all dictionary words, and earn bonus points
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Player Cumulative Points Badge */}
            <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs border border-white shadow-sm">
              <Trophy className="w-4 h-4 fill-amber-900 text-amber-900" />
              <span>{playerPoints.toLocaleString()} PTS</span>

              {/* Floating Points Gained Animation */}
              {pointsGainedAnim && (
                <span className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black animate-bounce shadow-md">
                  +{pointsGainedAnim.amount} PTS!
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Instant Solver vs Anagram Challenge */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab("solver")}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "solver"
                ? "bg-amber-400 text-amber-950 shadow-md scale-101 border border-amber-300"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Instant Unscrambler</span>
          </button>
          <button
            onClick={() => setActiveTab("challenge")}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "challenge"
                ? "bg-amber-400 text-amber-950 shadow-md scale-101 border border-amber-300"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-600" />
            <span>Anagram Challenge (+Points)</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: INSTANT ANAGRAM SOLVER                                       */}
        {/* ==================================================================== */}
        {activeTab === "solver" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Letters Input Card */}
            <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-200 shadow-xs flex flex-col gap-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Enter Scrambled Letters:</span>
                <span className="text-[11px] text-amber-700 font-bold">
                  {inputLetters.length} Letters Entered
                </span>
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputLetters}
                    onChange={(e) => setInputLetters(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                    placeholder="TYPE LETTERS (E.G. RUSH, CANDY, ARENA)..."
                    className="w-full text-base font-black px-3.5 py-2.5 rounded-xl bg-amber-50/50 border-2 border-amber-300 text-slate-900 tracking-wider placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setInputLetters(scrambleWord(inputLetters));
                    soundManager.play("tilePop");
                  }}
                  className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs border border-amber-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Shuffle letter order"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>

                <button
                  onClick={() => {
                    const rand = getRandomDictionaryWord(5);
                    if (rand) setInputLetters(rand.word);
                    soundManager.play("tilePop");
                  }}
                  className="px-3 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-xs border border-emerald-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Get Random Dictionary Letters"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Random Word</span>
                </button>
              </div>

              {/* Scrambled Visual Chips */}
              {inputLetters.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Tiles:</span>
                  {inputLetters.split("").map((ch, i) => (
                    <span
                      key={i}
                      className="w-7 h-7 rounded-lg bg-amber-300 border-b-2 border-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Results Header & Length Filters */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Discovered Words:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-950 border border-amber-300">
                  {solverResults.count} Words Found
                </span>
              </div>

              {/* Filter Tabs (All, 6L, 5L, 4L, 3L) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {lengthTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setLengthFilter(t)}
                    className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      lengthFilter === t
                        ? "bg-white text-slate-900 shadow-xs border border-slate-300"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t === "ALL" ? "All" : `${t}L`}
                  </button>
                ))}
              </div>
            </div>

            {/* Anagram Words List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredAnagrams.length === 0 ? (
                <div className="col-span-2 p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 text-xs font-medium">
                  No dictionary anagrams could be formed from "{inputLetters}". Try adding more vowels or letters!
                </div>
              ) : (
                filteredAnagrams.map((item) => (
                  <div
                    key={item.word}
                    className={`p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2 shadow-xs ${
                      item.isExact
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950"
                        : "bg-white border-amber-200 text-slate-800 hover:bg-amber-50/50"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm tracking-wider">{item.word}</span>
                        {item.isExact && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-200 text-emerald-900 font-extrabold text-[9px] uppercase tracking-wider">
                            Exact Anagram
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-bold text-[9px]">
                          {item.length} Letters
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                        "{item.definition}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-200">
                        +{item.points} PTS
                      </span>
                      <button
                        onClick={() => handleCopy(item.word)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Copy word"
                      >
                        {copiedWord === item.word ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: ANAGRAM CHALLENGE MINI-GAME                                   */}
        {/* ==================================================================== */}
        {activeTab === "challenge" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Scrambled Tile Board */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/80 via-yellow-100/60 to-orange-100/70 border-2 border-amber-300 flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Unscramble The Mystery Tiles:
                </span>
                <button
                  onClick={handleNextChallenge}
                  className="text-xs font-black text-amber-800 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Next Word Puzzle</span>
                </button>
              </div>

              {/* Scrambled Letter Tiles */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {challengeScramble.split("").map((ch, idx) => (
                  <div
                    key={idx}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-400 border-b-4 border-amber-600 shadow-md text-amber-950 font-black text-xl sm:text-2xl flex items-center justify-center select-none transform hover:scale-105 transition-transform"
                  >
                    {ch}
                  </div>
                ))}
              </div>

              {/* Action Buttons: Shuffle, Auto-Solve, New Anagram */}
              <div className="flex items-center flex-wrap justify-center gap-2">
                <button
                  onClick={handleShuffleChallenge}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-black text-xs border border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Re-shuffle</span>
                </button>
                <button
                  onClick={handleAutoSolveChallenge}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-violet-400"
                  title="Automatically solve all anagrams for these letters"
                >
                  <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                  <span>Auto-Solve All</span>
                </button>
                <button
                  onClick={handleNextChallenge}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs border border-amber-500 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Challenge Puzzle</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleChallengeSubmit();
                  }
                }}
                placeholder="TYPE ANAGRAM WORD & PRESS ENTER..."
                className={`flex-1 text-sm font-black px-4 py-3 rounded-xl bg-white border-2 text-slate-900 tracking-wider placeholder:text-slate-400 focus:outline-none ${
                  challengeShake ? "border-rose-500 animate-shake" : "border-amber-300 focus:border-amber-500"
                }`}
              />

              <button
                onClick={handleChallengeSubmit}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider shadow-md hover:scale-102 active:scale-95 cursor-pointer transition-all"
              >
                SUBMIT
              </button>
            </div>

            {/* Status Message */}
            {challengeMessage && (
              <p
                className={`text-xs font-bold text-center py-1 px-3 rounded-lg animate-fadeIn ${
                  challengeMessage.includes("+")
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-rose-100 text-rose-900 border border-rose-300"
                }`}
              >
                {challengeMessage}
              </p>
            )}

            {/* Discovered Words in this Challenge */}
            <div className="p-3.5 rounded-2xl bg-white border border-amber-200 flex flex-col gap-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Discovered ({foundWords.size} / {challengeSolutions.count} Available):
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  Target Length: {challengeTarget.length} Letters
                </span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-12 items-center">
                {foundWords.size === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Type words you can make with the letters above to earn points!
                  </span>
                ) : (
                  Array.from(foundWords).map((w) => (
                    <span
                      key={w}
                      className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs flex items-center gap-1.5 animate-pop"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{w}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnagramSolver;
