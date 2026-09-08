import React from "react";

export const WordCandyBanner = ({
  word = "",
  targetLength,
  placeholder = "SPELL YOUR WORD",
  isError = false,
  firstCharMatch = false,
}) => {
  const letters = (word || "").toUpperCase().split("");

  return (
    <div className="flex flex-col items-center justify-center min-h-[64px] sm:min-h-[74px] select-none py-1">
      {letters.length === 0 ? (
        <div className="px-6 py-2.5 rounded-full bg-white/95 border-2 border-emerald-300 text-emerald-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md animate-pulse">
          ✨ {placeholder} ✨
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-2 sm:gap-2.5 px-3 py-2 ${
            isError ? "animate-shake" : ""
          }`}
        >
          {letters.map((char, idx) => {
            const isFirstCyan = idx === 0 && firstCharMatch;
            return (
              <div
                key={`candy-banner-char-${idx}-${char}`}
                className={`relative flex items-center justify-center w-11 h-13 sm:w-14 sm:h-16 rounded-2xl font-black text-2xl sm:text-3xl text-white uppercase border-2 border-white transform hover:-translate-y-0.5 transition-transform ${
                  isFirstCyan
                    ? "bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-600 shadow-[0_5px_0_#0284c7,0_8px_16px_rgba(2,132,199,0.4)]"
                    : "bg-gradient-to-b from-red-500 via-red-600 to-red-700 shadow-[0_5px_0_#991b1b,0_8px_16px_rgba(220,38,38,0.4)]"
                }`}
              >
                {/* Glossy top shine */}
                <div className="absolute top-1 inset-x-2 h-2.5 rounded-t-xl bg-white/35 pointer-events-none" />
                <span className="z-10 leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                  {char}
                </span>
                {isFirstCyan && (
                  <span className="absolute -top-2 -right-1 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-cyan-200 text-cyan-950 border border-cyan-300 shadow-xs">
                    1ST
                  </span>
                )}
              </div>
            );
          })}

          {targetLength &&
            letters.length < targetLength &&
            Array.from({ length: targetLength - letters.length }).map((_, i) => (
              <div
                key={`empty-banner-slot-${i}`}
                className="w-11 h-13 sm:w-14 sm:h-16 rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-900/20 flex items-center justify-center text-emerald-200 text-2xl font-black shadow-inner"
              >
                &bull;
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default WordCandyBanner;
