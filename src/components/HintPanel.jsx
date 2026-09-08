import React from "react";
import { Lightbulb, Sparkles, AlertCircle } from "lucide-react";

export const HintPanel = ({
  freeHintsRemaining = 3,
  extraHintsUsed = 0,
  lastRevealedHint = null,
  onRequestHint,
  isGuesser = false,
  disabled = false,
}) => {
  return (
    <div
      id="hint-panel"
      className="w-full max-w-xl mx-auto p-4 rounded-3xl bg-white/95 border-2 border-purple-200 shadow-md flex flex-col gap-3 select-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 shadow-sm">
            <Lightbulb className="w-5 h-5 fill-purple-200" />
          </div>
          <div>
            <h4 className="text-xs font-black text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
              <span>AI HINT</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                HELPER
              </span>
            </h4>
            <span className="text-[11px] font-medium text-slate-500">
              {freeHintsRemaining > 0
                ? `${freeHintsRemaining} free hints left`
                : "Extra hints cost 1 point penalty"}
            </span>
          </div>
        </div>

        {/* Free Hint Indicator Stars */}
        <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200 text-xs">
          <span className="text-[11px] font-bold text-purple-700 mr-0.5">FREE:</span>
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className={`text-sm transition-all ${
                idx < freeHintsRemaining
                  ? "text-amber-400 drop-shadow-sm scale-110"
                  : "text-slate-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Last Revealed Hint Box */}
      {lastRevealedHint ? (
        <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-purple-700 tracking-wider">
              CLUE:
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 whitespace-pre-wrap">{lastRevealedHint}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
          Stuck? Tap below to get a smart clue about the secret word!
        </p>
      )}

      {/* Action Button for Guesser */}
      {isGuesser && (
        <div className="flex items-center justify-between pt-1">
          {freeHintsRemaining > 0 ? (
            <button
              id="get-free-hint-btn"
              type="button"
              disabled={disabled}
              onClick={onRequestHint}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl btn-candy-purple text-white font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              <Lightbulb className="w-4 h-4 fill-white" />
              <span>GET A FREE CLUE ({freeHintsRemaining} Left)</span>
            </button>
          ) : (
            <button
              id="get-extra-hint-btn"
              type="button"
              disabled={disabled}
              onClick={onRequestHint}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl btn-candy-red text-white font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4" />
              <span>GET EXTRA CLUE (-1 POINT PENALTY)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HintPanel;

