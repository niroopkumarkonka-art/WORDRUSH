import React from "react";

export const LetterTile = ({
  letter = "",
  state = "EMPTY",
  index = 0,
  size = "md",
  isFirstCharMatch = false,
}) => {
  const sizeClasses = {
    sm: "w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl",
    md: "w-12 h-12 sm:w-15 sm:h-15 text-xl sm:text-2xl",
    lg: "w-14 h-14 sm:w-16 sm:h-16 text-2xl sm:text-3xl",
  }[size] || "w-12 h-12 sm:w-15 sm:h-15 text-xl sm:text-2xl";

  // 1. EMPTY SLOT (Indented word slots)
  if (state === "EMPTY" && !letter) {
    return (
      <div
        id={`tile-empty-${index}`}
        className={`relative flex items-center justify-center rounded-2xl select-none transition-all duration-300 bg-[#3a521e]/80 border-2 border-[#2b3e15] shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] ${sizeClasses}`}
      >
        <span className="w-2 h-2 rounded-full bg-[#52752c]/50" />
      </div>
    );
  }

  // 2. SPECIAL: FIRST CHARACTER MATCH TILE (Cyan / Electric Azure - Distinct from Green)
  if (isFirstCharMatch || state === "FIRST_MATCH") {
    return (
      <div
        id={`tile-first-match-${index}-${letter}`}
        className={`relative flex items-center justify-center rounded-2xl font-black uppercase text-white select-none transition-all duration-300 animate-flip bg-gradient-to-b from-cyan-300 via-sky-500 to-blue-600 border-2 border-cyan-100 shadow-[0_5px_0_#0369a1,0_8px_16px_rgba(14,165,233,0.4)] ${sizeClasses}`}
        style={{ animationDelay: `${index * 80}ms` }}
        title="First Character Match!"
      >
        {/* Top gloss highlight */}
        <div className="absolute top-1 inset-x-2 h-2.5 rounded-t-xl bg-white/60 pointer-events-none" />
        <span className="z-10 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          {letter}
        </span>
        {/* Subtle Badge Tag */}
        <span className="absolute -top-2 -right-1 text-[8px] font-black uppercase px-1 py-0.2 rounded-full bg-cyan-200 text-cyan-950 border border-white shadow-xs pointer-events-none">
          1st
        </span>
      </div>
    );
  }

  // 3. TENTATIVE / TYPED LETTER (Freshly entered letter)
  if (state === "TENTATIVE" || (state === "EMPTY" && letter)) {
    return (
      <div
        id={`tile-tentative-${index}-${letter}`}
        className={`relative flex items-center justify-center rounded-2xl font-black uppercase select-none transition-all duration-200 animate-pop bg-gradient-to-b from-white via-amber-50 to-amber-100 text-amber-950 border-2 border-white shadow-[0_4px_0_#d97706,0_6px_12px_rgba(217,119,6,0.3)] ${sizeClasses}`}
      >
        <div className="absolute top-1 inset-x-2 h-2 rounded-t-xl bg-white/60 pointer-events-none" />
        <span className="z-10 leading-none">{letter}</span>
      </div>
    );
  }

  // 4. CORRECT POSITION (GREEN CANDY TILE)
  if (state === "GREEN") {
    return (
      <div
        id={`tile-green-${index}-${letter}`}
        className={`relative flex items-center justify-center rounded-2xl font-black uppercase text-white select-none transition-all duration-300 animate-flip bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 border-2 border-white shadow-[0_4px_0_#065f46,0_6px_12px_rgba(16,185,129,0.35)] ${sizeClasses}`}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div className="absolute top-1 inset-x-2 h-2 rounded-t-xl bg-white/40 pointer-events-none" />
        <span className="z-10 leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          {letter}
        </span>
      </div>
    );
  }

  // 4. WRONG POSITION (YELLOW CANDY TILE)
  if (state === "YELLOW") {
    return (
      <div
        id={`tile-yellow-${index}-${letter}`}
        className={`relative flex items-center justify-center rounded-2xl font-black uppercase text-amber-950 select-none transition-all duration-300 animate-flip bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-white shadow-[0_4px_0_#b45309,0_6px_12px_rgba(245,158,11,0.35)] ${sizeClasses}`}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div className="absolute top-1 inset-x-2 h-2 rounded-t-xl bg-white/50 pointer-events-none" />
        <span className="z-10 leading-none font-black">{letter}</span>
      </div>
    );
  }

  // 5. NOT IN WORD (GRAY STONE TILE)
  return (
    <div
      id={`tile-gray-${index}-${letter}`}
      className={`relative flex items-center justify-center rounded-2xl font-black uppercase text-slate-500 select-none transition-all duration-300 animate-flip bg-gradient-to-b from-slate-200 to-slate-300 border-2 border-slate-100 shadow-[0_3px_0_#94a3b8] ${sizeClasses}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="z-10 leading-none">{letter}</span>
    </div>
  );
};

export default LetterTile;
