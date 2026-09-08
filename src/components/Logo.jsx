import React from "react";

export const Logo = ({ size = "md", showTagline = false, lightMode = true }) => {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Golden-Yellow Flower Squircle (Matches screenshot 2) */}
        <div
          className={`flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#fde047] to-[#eab308] border-2 border-[#fef08a] shadow-[0_4px_10px_rgba(0,0,0,0.15)] transform transition-transform hover:scale-105 ${
            isSm
              ? "w-8 h-8 rounded-xl"
              : isLg
              ? "w-16 h-16 sm:w-20 sm:h-20 rounded-3xl"
              : "w-10 h-10 rounded-2xl"
          }`}
        >
          {/* Flower Icon */}
          <svg
            width={isSm ? 18 : isLg ? 42 : 24}
            height={isSm ? 18 : isLg ? 42 : 24}
            viewBox="0 0 100 100"
            fill="none"
          >
            {/* Dark flower petals matching screenshot */}
            <circle cx="50" cy="24" r="14" fill="#1e293b" />
            <circle cx="76" cy="50" r="14" fill="#1e293b" />
            <circle cx="50" cy="76" r="14" fill="#1e293b" />
            <circle cx="24" cy="50" r="14" fill="#1e293b" />
            <circle cx="32" cy="32" r="13" fill="#1e293b" />
            <circle cx="68" cy="32" r="13" fill="#1e293b" />
            <circle cx="68" cy="68" r="13" fill="#1e293b" />
            <circle cx="32" cy="68" r="13" fill="#1e293b" />
            {/* Inner ring */}
            <circle cx="50" cy="50" r="15" fill="#facc15" stroke="#1e293b" strokeWidth="4" />
          </svg>
        </div>

        {/* Brand Text: WORDRUSH ARENA */}
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black uppercase tracking-tight ${
              lightMode ? "text-slate-900" : "text-white"
            } drop-shadow-sm ${
              isSm
                ? "text-base sm:text-lg"
                : isLg
                ? "text-4xl sm:text-5xl"
                : "text-xl sm:text-2xl"
            }`}
          >
            WORDRUSH
          </span>
          <span
            className={`font-black uppercase tracking-wider rounded-full bg-[#22c55e] text-white border border-[#86efac] shadow-sm ${
              isSm
                ? "text-[10px] px-2 py-0.5"
                : isLg
                ? "text-sm px-3.5 py-1"
                : "text-xs px-2.5 py-0.5"
            }`}
          >
            ARENA
          </span>
        </div>
      </div>

      {showTagline && (
        <p className="text-xs sm:text-sm font-semibold text-emerald-100 tracking-wide mt-1.5 drop-shadow-sm">
          Connect letters • Solve puzzles • Duel your rivals!
        </p>
      )}
    </div>
  );
};

export default Logo;
