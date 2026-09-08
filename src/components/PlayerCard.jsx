import React from "react";
import { PenTool, Target, Wifi, WifiOff } from "lucide-react";

export const PlayerCard = ({
  player = null,
  playerIndex = 0,
  isWordSetter = false,
  isGuesser = false,
  isCurrentTurn = false,
  isSelf = false,
}) => {
  if (!player) {
    return (
      <div
        id={`player-card-empty-${playerIndex}`}
        className="flex-1 min-w-[200px] p-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center text-slate-500 gap-1.5 min-h-[110px] select-none"
      >
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-lg animate-bounce">
          👋
        </div>
        <p className="text-xs font-bold text-slate-700">WAITING FOR PLAYER {playerIndex + 1}...</p>
        <p className="text-[11px] text-slate-500">Share room code to invite a friend</p>
      </div>
    );
  }

  return (
    <div
      id={`player-card-${player.playerId}`}
      className={`flex-1 min-w-[200px] p-3.5 sm:p-4 rounded-2xl transition-all duration-200 relative overflow-hidden select-none ${
        isCurrentTurn
          ? "border-2 border-emerald-500 bg-emerald-50/70 shadow-lg ring-3 ring-emerald-300/40"
          : "border-2 border-slate-200 bg-white/90 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shadow-sm">
            {player.profile?.avatar || "⚡"}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-[120px] sm:max-w-[150px]">
                {player.username}
              </h3>
              {isSelf && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-white shadow-xs">
                  YOU
                </span>
              )}
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-1 mt-0.5">
              {isWordSetter && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <PenTool className="w-3 h-3 text-amber-600" />
                  <span>Word Setter</span>
                </span>
              )}
              {isGuesser && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Target className="w-3 h-3 text-emerald-600" />
                  <span>Guesser</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Connection status */}
        <div className="flex items-center">
          {player.connectionStatus ? (
            <Wifi className="w-4 h-4 text-emerald-500" title="Connected" />
          ) : (
            <WifiOff className="w-4 h-4 text-rose-500" title="Disconnected" />
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600 font-medium">
        <div className="flex items-center gap-1">
          <span className="text-slate-400">Score:</span>
          <span className="font-black text-amber-600">{player.score}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400">Wins:</span>
          <span className="font-black text-emerald-600">{player.roundsWon}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;

