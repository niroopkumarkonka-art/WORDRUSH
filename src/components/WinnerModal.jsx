import React, { useEffect } from "react";
import { Trophy, RotateCcw, Home, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export const WinnerModal = ({
  isOpen = false,
  room,
  selfPlayerId = "",
  onRematch,
  onGoHome,
}) => {
  if (!isOpen || !room) return null;

  const p1 = room.players?.[0];
  const p2 = room.players?.[1];

  let outcome = "DRAW";
  let winner = null;

  if (p1 && p2) {
    if (p1.score > p2.score) {
      winner = p1;
      outcome = p1.playerId === selfPlayerId ? "WIN" : "LOSS";
    } else if (p2.score > p1.score) {
      winner = p2;
      outcome = p2.playerId === selfPlayerId ? "WIN" : "LOSS";
    } else {
      outcome = "DRAW";
    }
  }

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: outcome === "WIN" ? 140 : 60,
        spread: 90,
        origin: { y: 0.55 },
        colors: ["#f59e0b", "#10b981", "#0284c7", "#ec4899", "#8b5cf6"],
      });
    }
  }, [isOpen, outcome]);

  return (
    <div
      id="winner-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn select-none"
    >
      <div
        id="winner-modal-card"
        className="relative w-full max-w-md rounded-3xl bg-white border-4 border-amber-300 p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center animate-pop"
      >
        {/* Animated Trophy Icon */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-md">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-spin" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-slate-800">
          {outcome === "WIN" ? (
            <span className="text-emerald-600">
              VICTORY! YOU WON! 🎉
            </span>
          ) : outcome === "LOSS" ? (
            <span className="text-amber-600">
              GOOD GAME! {winner?.username} WON!
            </span>
          ) : (
            <span className="text-sky-600">
              IT'S A TIE! 🤝
            </span>
          )}
        </h2>

        <p className="text-sm text-slate-500 mt-1 mb-5 font-medium">
          {outcome === "WIN"
            ? "Great word skills! You scored more points across all rounds!"
            : outcome === "LOSS"
            ? "A super close match. Ready to challenge them again?"
            : "Both players finished with the exact same score!"}
        </p>

        {/* Final Scoreboard Comparison */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div
            className={`p-4 rounded-2xl border-2 text-center ${
              winner?.playerId === p1?.playerId
                ? "bg-amber-50 border-amber-400 shadow-sm"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="text-3xl mb-1">{p1?.profile?.avatar || "⚡"}</div>
            <div className="font-bold text-slate-800 text-sm truncate">{p1?.username}</div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {p1?.score} pts
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {p1?.roundsWon} rounds won
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 text-center ${
              winner?.playerId === p2?.playerId
                ? "bg-amber-50 border-amber-400 shadow-sm"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="text-3xl mb-1">{p2?.profile?.avatar || "🎯"}</div>
            <div className="font-bold text-slate-800 text-sm truncate">{p2?.username}</div>
            <div className="text-2xl font-black text-sky-600 mt-1">
              {p2?.score} pts
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {p2?.roundsWon} rounds won
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            id="rematch-btn"
            onClick={onRematch}
            className="w-full py-3.5 px-5 rounded-2xl btn-candy-green text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="winner-home-btn"
            onClick={onGoHome}
            className="w-full py-3.5 px-5 rounded-2xl btn-candy-white text-slate-700 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;

