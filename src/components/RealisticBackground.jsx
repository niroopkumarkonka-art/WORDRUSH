import React, { useState, useEffect } from "react";

export const RealisticBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Parallax offsets
  const offsetX1 = mousePos.x * 12;
  const offsetY1 = mousePos.y * 12;
  const offsetX2 = mousePos.x * 22;
  const offsetY2 = mousePos.y * 22;
  const offsetX3 = mousePos.x * -16;
  const offsetY3 = mousePos.y * -16;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* -------------------------------------------------------------------- */}
      {/* 1. VIBRANT TROPICAL CHROMA GRADIENT BASE */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0284c7]" />

      {/* -------------------------------------------------------------------- */}
      {/* 2. CREATIVE TACTILE RETRO DOT & ISOMETRIC MATRIX */}
      {/* -------------------------------------------------------------------- */}
      {/* Polka-Dot Canvas Matrix */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)",
          backgroundSize: "32px 32px",
          transform: `translate3d(${offsetX1 * 0.3}px, ${offsetY1 * 0.3}px, 0)`,
        }}
      />

      {/* Crossword Grid Crosshairs (+) */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          transform: `translate3d(${offsetX1 * 0.5}px, ${offsetY1 * 0.5}px, 0)`,
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* 3. CREATIVE SOLAR CORONA & AMBIENT AURA BLOOMS */}
      {/* -------------------------------------------------------------------- */}
      {/* Warm Golden Zenith Sunburst */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full bg-gradient-to-b from-[#fef08a]/60 via-[#fde047]/25 to-transparent blur-3xl transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(calc(-50% + ${offsetX1 * 0.8}px), ${offsetY1 * 0.8}px, 0)`,
        }}
      />

      {/* Tropical Cyan & Electric Turquoise Flare (Left Wing) */}
      <div
        className="absolute top-20 left-[5%] w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-[#67e8f9]/30 to-[#38bdf8]/10 blur-3xl animate-pulse-aura"
        style={{
          transform: `translate3d(${offsetX2 * 0.6}px, ${offsetY2 * 0.6}px, 0)`,
        }}
      />

      {/* Warm Peach & Honey Golden Flare (Right Wing) */}
      <div
        className="absolute top-10 right-[8%] w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-[#fde047]/30 via-[#fb923c]/15 to-transparent blur-3xl animate-pulse-aura"
        style={{
          animationDelay: "-2.5s",
          transform: `translate3d(${offsetX3 * 0.6}px, ${offsetY3 * 0.6}px, 0)`,
        }}
      />

      {/* Amethyst Violet Rim Bloom (Bottom Wing) */}
      <div
        className="absolute bottom-10 left-1/3 w-[600px] h-[350px] rounded-full bg-gradient-to-t from-[#c084fc]/20 via-[#818cf8]/15 to-transparent blur-3xl"
        style={{
          transform: `translate3d(${offsetX1 * 0.4}px, ${offsetY1 * 0.4}px, 0)`,
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* 4. CREATIVE CONCENTRIC ORBITAL RINGS (Tactile Puzzle Radar) */}
      {/* -------------------------------------------------------------------- */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border-2 border-white/10 border-dashed animate-spin-slow pointer-events-none"
        style={{
          transform: `translate3d(calc(-50% + ${offsetX1 * 0.5}px), calc(-50% + ${offsetY1 * 0.5}px), 0)`,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-white/15 border-dotted animate-spin-slow pointer-events-none"
        style={{
          animationDirection: "reverse",
          animationDuration: "45s",
          transform: `translate3d(calc(-50% + ${offsetX2 * 0.4}px), calc(-50% + ${offsetY2 * 0.4}px), 0)`,
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* 5. DISTANT BLURRED BACKGROUND LETTER RUNES (Depth-of-Field Effect) */}
      {/* -------------------------------------------------------------------- */}
      <div
        className="absolute top-32 left-[18%] hidden xl:flex items-center justify-center w-9 h-9 rounded-xl bg-white/40 border border-white/50 text-amber-900/60 font-black text-sm blur-[1.2px] opacity-40 animate-float-slow-a"
        style={{ transform: `translate3d(${offsetX3}px, ${offsetY3}px, 0)` }}
      >
        A
      </div>
      <div
        className="absolute top-52 right-[22%] hidden xl:flex items-center justify-center w-8 h-8 rounded-xl bg-white/40 border border-white/50 text-sky-900/60 font-black text-sm blur-[1.5px] opacity-35 animate-float-slow-c"
        style={{ transform: `translate3d(${offsetX2 * 0.7}px, ${offsetY2 * 0.7}px, 0)` }}
      >
        Z
      </div>
      <div
        className="absolute bottom-40 left-[24%] hidden xl:flex items-center justify-center w-9 h-9 rounded-xl bg-white/40 border border-white/50 text-purple-900/60 font-black text-sm blur-[1.2px] opacity-40 animate-float-slow-b"
        style={{ transform: `translate3d(${offsetX1 * 0.8}px, ${offsetY1 * 0.8}px, 0)` }}
      >
        Q
      </div>
      <div
        className="absolute bottom-36 right-[26%] hidden xl:flex items-center justify-center w-8 h-8 rounded-xl bg-white/40 border border-white/50 text-emerald-900/60 font-black text-sm blur-[1.5px] opacity-35 animate-float-slow-a"
        style={{ transform: `translate3d(${offsetX3 * 0.8}px, ${offsetY3 * 0.8}px, 0)` }}
      >
        K
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 6. PROMINENT 3D CANDY SCRABBLE LETTER TILES (Crisp Midground Constellation) */}
      {/* -------------------------------------------------------------------- */}
      {/* TILE 1: 'W' (Golden Sun Amber, 4 Pts) - Top Left */}
      <div
        className="absolute top-16 left-8 sm:left-14 hidden lg:flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#fffef0] to-[#fef08a] border-t-2 border-l-2 border-white border-b-4 border-[#ca8a04] shadow-[0_16px_32px_rgba(2,132,199,0.35)] text-amber-950 font-black text-2xl transform -rotate-12 animate-float-slow-a transition-transform"
        style={{ transform: `translate3d(${offsetX2}px, ${offsetY2}px, 0) rotate(-12deg)` }}
      >
        <span>W</span>
        <span className="text-[9px] font-bold text-amber-700 absolute bottom-1 right-1.5 font-mono">4</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-yellow-300 animate-sparkle">✦</span>
      </div>

      {/* TILE 2: 'O' (Blush Coral Pink, 1 Pt) - Mid Left */}
      <div
        className="absolute top-1/2 -translate-y-12 left-6 sm:left-12 hidden lg:flex flex-col items-center justify-center w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-b from-[#fff1f2] to-[#fecdd3] border-t-2 border-l-2 border-white border-b-4 border-[#e11d48] shadow-[0_16px_32px_rgba(2,132,199,0.35)] text-rose-950 font-black text-xl transform rotate-8 animate-float-slow-b transition-transform"
        style={{ transform: `translate3d(${offsetX1}px, ${offsetY1}px, 0) rotate(8deg)` }}
      >
        <span>O</span>
        <span className="text-[8px] font-bold text-rose-700 absolute bottom-1 right-1 font-mono">1</span>
      </div>

      {/* TILE 3: 'R' (Jade Mint Emerald, 1 Pt) - Lower Left */}
      <div
        className="absolute bottom-24 left-10 sm:left-20 hidden lg:flex flex-col items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-b from-[#f0fdf4] to-[#bbf7d0] border-t-2 border-l-2 border-white border-b-4 border-[#16a34a] shadow-[0_16px_32px_rgba(2,132,199,0.35)] text-emerald-950 font-black text-2xl transform -rotate-8 animate-float-slow-c transition-transform"
        style={{ transform: `translate3d(${offsetX3}px, ${offsetY3}px, 0) rotate(-8deg)` }}
      >
        <span>R</span>
        <span className="text-[9px] font-bold text-emerald-700 absolute bottom-1 right-1.5 font-mono">1</span>
        <span className="absolute -top-1.5 -left-1.5 text-xs text-emerald-300 animate-sparkle">★</span>
      </div>

      {/* TILE 4: 'D' (Radiant Sky Azure, 2 Pts) - Top Right */}
      <div
        className="absolute top-20 right-8 sm:right-16 hidden lg:flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#f0f9ff] to-[#bae6fd] border-t-2 border-l-2 border-white border-b-4 border-[#0284c7] shadow-[0_16px_32px_rgba(2,132,199,0.35)] text-sky-950 font-black text-2xl transform rotate-14 animate-float-slow-a transition-transform"
        style={{ transform: `translate3d(${offsetX3}px, ${offsetY3}px, 0) rotate(14deg)` }}
      >
        <span>D</span>
        <span className="text-[9px] font-bold text-sky-700 absolute bottom-1 right-1.5 font-mono">2</span>
        <span className="absolute -top-2 -right-1 text-xs text-sky-200 animate-sparkle">✦</span>
      </div>

      {/* TILE 5: 'U' (Vibrant Tangerine, 1 Pt) - Mid Right */}
      <div
        className="absolute top-1/2 translate-y-6 right-6 sm:right-12 hidden lg:flex flex-col items-center justify-center w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-b from-[#fff7ed] to-[#fed7aa] border-t-2 border-l-2 border-white border-b-4 border-[#ea580c] shadow-[0_16px_32px_rgba(2,132,199,0.35)] text-orange-950 font-black text-xl transform -rotate-10 animate-float-slow-b transition-transform"
        style={{ transform: `translate3d(${offsetX2}px, ${offsetY2}px, 0) rotate(-10deg)` }}
      >
        <span>U</span>
        <span className="text-[8px] font-bold text-orange-700 absolute bottom-1 right-1 font-mono">1</span>
      </div>

      {/* TILE 6: 'S' (Sweet Lavender Purple, 1 Pt) - Bottom Right */}
      <div
        className="absolute bottom-20 right-10 sm:right-20 hidden lg:flex flex-col items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-b from-[#faf5ff] to-[#e9d5ff] border-t-2 border-l-2 border-white border-b-4 border-[#9333ea] shadow-[0_16px_32px_rgba(2,132,199,0.35)] text-purple-950 font-black text-xl transform rotate-6 animate-float-slow-c transition-transform"
        style={{ transform: `translate3d(${offsetX1}px, ${offsetY1}px, 0) rotate(6deg)` }}
      >
        <span>S</span>
        <span className="text-[8px] font-bold text-purple-700 absolute bottom-1 right-1 font-mono">1</span>
        <span className="absolute -bottom-1 -left-1 text-xs text-purple-300 animate-sparkle">◆</span>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 7. FLOATING CREATIVE GEOMETRIC SPARKLES & CONSTELLATIONS */}
      {/* -------------------------------------------------------------------- */}
      <div
        className="absolute top-1/4 left-[30%] text-amber-200/60 text-lg font-serif animate-sparkle"
        style={{ transform: `translate3d(${offsetX1 * 1.2}px, ${offsetY1 * 1.2}px, 0)` }}
      >
        ✦
      </div>
      <div
        className="absolute top-1/3 right-[32%] text-white/50 text-sm font-serif animate-sparkle"
        style={{
          animationDelay: "-1.8s",
          transform: `translate3d(${offsetX2 * 1.1}px, ${offsetY2 * 1.1}px, 0)`,
        }}
      >
        ✦
      </div>
      <div
        className="absolute bottom-1/3 left-[28%] text-cyan-200/50 text-base animate-sparkle"
        style={{
          animationDelay: "-3.2s",
          transform: `translate3d(${offsetX3 * 1.2}px, ${offsetY3 * 1.2}px, 0)`,
        }}
      >
        ◆
      </div>
      <div
        className="absolute bottom-1/4 right-[25%] text-yellow-200/60 text-sm animate-sparkle"
        style={{
          animationDelay: "-0.9s",
          transform: `translate3d(${offsetX1 * 1.1}px, ${offsetY1 * 1.1}px, 0)`,
        }}
      >
        ★
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 8. SOFT BOTTOM AMBIENT HORIZON VIGNETTE */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#0284c7]/50 via-[#0284c7]/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default RealisticBackground;
