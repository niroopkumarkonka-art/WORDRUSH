import React from "react";
import { LetterTile } from "./LetterTile";
import { Sparkles, HelpCircle, BookOpen } from "lucide-react";
import { classifyWord } from "../utils/wordClassifier";

export const GameBoard = ({
  wordLength = 5,
  maxAttempts = 6,
  gameBoard = [],
  boardStates = [],
  attemptsUsed = 0,
  currentInput = "",
  isGuesserTurn = false,
  isShake = false,
  targetSecretWord = "",
}) => {
  const rows = [];
  const currentWordClassification = currentInput ? classifyWord(currentInput) : null;

  for (let r = 0; r < maxAttempts; r++) {
    const isPastAttempt = r < attemptsUsed;
    const isCurrentAttempt = r === attemptsUsed && isGuesserTurn;

    const rowTiles = [];
    for (let c = 0; c < wordLength; c++) {
      let char = "";
      let state = "EMPTY";
      let isFirstMatch = false;

      if (isPastAttempt) {
        char = gameBoard[r]?.[c] || "";
        const numState = boardStates[r]?.[c] ?? 0;
        if (numState === 2) {
          state = "GREEN";
          // If first character matched between guess and target
          if (c === 0) {
            isFirstMatch = true;
          }
        } else if (numState === 1) {
          state = "YELLOW";
        } else {
          state = "GRAY";
        }
      } else if (isCurrentAttempt) {
        char = currentInput[c] || "";
        state = char ? "TENTATIVE" : "EMPTY";
        // If first character matches target secret word
        if (c === 0 && char && targetSecretWord && char.toUpperCase() === targetSecretWord[0]?.toUpperCase()) {
          isFirstMatch = true;
        }
      }

      rowTiles.push(
        <LetterTile
          key={`tile-${r}-${c}`}
          letter={char}
          state={state}
          index={c}
          size={wordLength === 6 ? "sm" : wordLength === 5 ? "md" : "lg"}
          isFirstCharMatch={isFirstMatch}
        />
      );
    }

    rows.push(
      <div
        key={`row-${r}`}
        id={`board-row-${r}`}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 p-1 rounded-2xl transition-all ${
          isCurrentAttempt
            ? `bg-white/20 ring-2 ring-amber-300 shadow-sm ${isShake ? "animate-shake" : ""}`
            : ""
        }`}
      >
        {rowTiles}
      </div>
    );
  }

  return (
    <div
      id="word-gameboard"
      className={`relative flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#ffffff] via-[#fffdf0] to-[#fef9c3] border-4 border-[#facc15] shadow-[0_14px_30px_rgba(2,132,199,0.25)] backdrop-blur-md transition-transform ${
        isShake ? "animate-shake" : ""
      }`}
    >
      {/* Friendly Top Info Bar */}
      <div className="w-full flex items-center justify-between text-xs px-2 pb-3 border-b-2 border-amber-200 mb-1 font-sans">
        <div className="flex items-center gap-2 text-amber-950 font-black uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Word Puzzle</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black border border-emerald-300">
            {wordLength} Letters
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: maxAttempts }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx < attemptsUsed
                    ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                    : idx === attemptsUsed && isGuesserTurn
                    ? "bg-emerald-500 scale-125 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"
                    : "bg-amber-100 border border-amber-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-amber-900">
            {Math.min(attemptsUsed + 1, maxAttempts)} of {maxAttempts}
          </span>
        </div>
      </div>

      {/* Crossword Rows */}
      <div className="flex flex-col gap-2">{rows}</div>

      {/* Real-time Word/Name Classification Banner (Fulfills user request) */}
      {currentInput && currentInput.length > 0 && currentWordClassification && (
        <div className="w-full mt-2 pt-2 border-t border-amber-200/80 flex flex-col gap-1.5 px-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Linguistic Tag:</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${currentWordClassification.badgeColor}`}
              >
                <span>{currentWordClassification.icon}</span>
                <span>{currentWordClassification.label}</span>
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
              {currentWordClassification.description}
            </span>
          </div>
          {currentWordClassification.note && (
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 font-bold text-xs flex items-center gap-1.5 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{currentWordClassification.note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
