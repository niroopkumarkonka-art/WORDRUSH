import React from "react";
import { X, CheckCircle2, AlertCircle, BookOpen, Lightbulb } from "lucide-react";

export const RulesModal = ({ isOpen = false, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="rules-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn select-none"
    >
      <div
        id="rules-modal-card"
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white border-4 border-amber-300 p-6 sm:p-7 shadow-2xl text-slate-700 animate-pop"
      >
        <button
          id="close-rules-btn"
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 border border-amber-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-800 tracking-tight">
              HOW TO PLAY
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Simple rules for your 1v1 word battle!
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm">
          <section className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <h3 className="font-black text-amber-800 uppercase text-xs tracking-wider mb-2">
              1. GAMEPLAY
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">★</span>
                <span><strong>Multiplayer 1v1:</strong> Play with a friend using a 5-letter room code.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">★</span>
                <span><strong>Take Turns:</strong> Round 1: Player 1 sets the word, Player 2 guesses. Round 2: You switch roles!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">★</span>
                <span><strong>6 Tries:</strong> The guesser has up to 6 guesses to find the secret word.</span>
              </li>
            </ul>
          </section>

          <section className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200">
            <h3 className="font-black text-sky-800 uppercase text-xs tracking-wider mb-2">
              2. COLOR CLUES
            </h3>
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-xs">GREEN</span>
                <span>Letter is in the word and in the <strong>exact right spot</strong>.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-bold text-xs">YELLOW</span>
                <span>Letter is in the word, but in the <strong>wrong spot</strong>.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 font-bold text-xs">GRAY</span>
                <span>Letter is <strong>not in the word</strong> at all.</span>
              </div>
            </div>
          </section>

          <section className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
            <h3 className="font-black text-emerald-800 uppercase text-xs tracking-wider mb-2">
              3. SECRET WORD RULES
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Must be a real English dictionary word.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>No repeating letters:</strong> All letters must be unique (e.g. <code>CRANE</code> or <code>PLANT</code> are valid ✅, <code>APPLE</code> is not ❌).</span>
              </li>
            </ul>
          </section>

          <section className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
            <h3 className="font-black text-purple-800 uppercase text-xs tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              <span>4. AI HINTS</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Guesser gets <strong>3 free clues</strong> per game from AI. If you ask for more after using all 3, you lose 1 point.
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            id="got-it-rules-btn"
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto py-3 px-8 rounded-2xl btn-candy-green text-white font-black text-sm uppercase tracking-wider cursor-pointer"
          >
            GOT IT, LET'S PLAY!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;

