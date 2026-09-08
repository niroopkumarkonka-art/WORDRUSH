import React from "react";
import { Sparkles } from "lucide-react";

export const Countdown = ({ seconds = 3 }) => {
  return (
    <div
      id="battle-countdown-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
    >
      <div className="flex items-center justify-center p-7 rounded-3xl bg-white border-4 border-amber-300 shadow-2xl flex-col gap-3 text-center max-w-xs mx-4 animate-pop">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-sm">
          <Sparkles className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-xl font-black uppercase tracking-wide text-slate-800">
          GET READY!
        </h3>

        <div className="text-7xl font-black text-amber-500 drop-shadow-md animate-pulse">
          {seconds > 0 ? seconds : "GO!"}
        </div>

        <p className="text-sm font-semibold text-slate-500">
          Round is starting...
        </p>
      </div>
    </div>
  );
};

export default Countdown;

