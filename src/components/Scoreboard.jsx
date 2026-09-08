import React from "react";
import { Trophy, HelpCircle } from "lucide-react";

export const Scoreboard = ({
  roundNumber = 1,
  totalRounds = 3,
  wordLength = 5,
  players = [],
  activeSetterName = "",
  activeGuesserName = "",
  phase = "",
  onOpenRules,
  onLeaveRoom,
}) => {
  const p1 = players[0];
  const p2 = players[1];

  return (
    <div
      id="wordrush-scoreboard"
      className="w-full max-w-2xl mx-auto p-3 sm:p-4 rounded-2xl bg-white/95 border-2 border-amber-200 shadow-md flex flex-col gap-2.5 select-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black uppercase tracking-wide shadow-sm">
            ROUND {roundNumber} OF {totalRounds}
          </div>
          <div className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
            {wordLength} Letters
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenRules && (
            <button
              id="scoreboard-rules-btn"
              onClick={onOpenRules}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full border border-slate-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Rules</span>
            </button>
          )}
          {onLeaveRoom && (
            <button
              id="scoreboard-leave-btn"
              onClick={onLeaveRoom}
              className="flex items-center gap-1 text-xs font-black text-rose-600 hover:text-rose-700 transition-colors cursor-pointer bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200"
            >
              <span>&larr; Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Head-to-Head Score Bar */}
      <div className="flex items-center justify-between gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl drop-shadow-sm">{p1?.profile?.avatar || "⚡"}</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-slate-800 truncate max-w-[100px] sm:max-w-[140px]">
              {p1?.username || "Player 1"}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              {p1?.roundsWon || 0} Wins
            </span>
          </div>
        </div>

        {/* Central VS / Score Display */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-black text-sm shadow-sm border-b-2 border-amber-600">
            <Trophy className="w-4 h-4 text-amber-950" />
            <span>
              {p1?.score || 0} : {p2?.score || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-right">
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-800 truncate max-w-[100px] sm:max-w-[140px]">
              {p2?.username || "Opponent"}
            </span>
            <span className="text-[11px] font-bold text-sky-600">
              {p2?.roundsWon || 0} Wins
            </span>
          </div>
          <span className="text-3xl drop-shadow-sm">{p2?.profile?.avatar || "🎯"}</span>
        </div>
      </div>

      {/* Current Turn Banner */}
      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-600">
        {phase === "WORD_SELECTION" ? (
          <span>
            ✍️ <strong className="text-amber-700">{activeSetterName}</strong> is picking the secret word...
          </span>
        ) : phase === "GUESSING" ? (
          <span>
            🎯 <strong className="text-emerald-700">{activeGuesserName}</strong> is guessing the word!
          </span>
        ) : (
          <span>🎉 Ready for action!</span>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;

