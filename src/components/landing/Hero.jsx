import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  Settings,
  Play,
  Swords,
  Bot,
  DoorOpen,
  User,
  BookOpen,
  Puzzle,
  Sparkles,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const TILES = [
  ["W", 4],
  ["O", 1],
  ["R", 1],
  ["D", 2],
  ["R", 1],
  ["U", 1],
  ["S", 1],
  ["H", 4],
];

function MaskedLine({ children, delay }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero({
  username,
  avatar,
  onOpenArena,
  onCreateRoom,
  onJoinRoom,
  onPlayBot,
  onOpenPuzzles,
  onOpenRules,
  onOpenUserStats,
  onlineCount = 28,
  serverStatus = "Online",
}) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 60,
    damping: 16,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), {
    stiffness: 60,
    damping: 16,
  });

  const handleMouseMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      data-testid="hero-section"
      className="wr-hero-bg relative flex min-h-[92vh] flex-col overflow-hidden text-white"
    >
      {/* Background Dots & Grain Overlay from reference */}
      <div className="wr-dots absolute inset-0 pointer-events-none" />
      <div className="wr-grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />

      {/* Floating 3D shapes from reference */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="wr-shape h-28 w-28"
          style={{ top: "14%", left: "8%", animationDuration: "14s" }}
        />
        <div
          className="wr-shape wr-shape-cream h-40 w-40"
          style={{
            bottom: "12%",
            right: "6%",
            animationDuration: "19s",
            animationDirection: "reverse",
          }}
        />
        <div
          className="wr-shape h-20 w-20"
          style={{ top: "28%", right: "20%", animationDuration: "9s" }}
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* NAVIGATION BAR (WordRush Brand + Live Status + Attribution + Controls) */}
      {/* -------------------------------------------------------------------- */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-5">
        {/* Left: Brand & Pill */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--wr-yellow)] shadow-[0_4px_0_#c98f0a]">
            <Settings className="h-5 w-5 text-[var(--wr-ink)]" />
          </div>
          <span className="font-heading text-xl font-black tracking-wide text-[var(--wr-cream)]">
            WORDRUSH
          </span>
          <span className="rounded-full bg-[var(--wr-green)] px-2.5 py-1 text-[10px] font-black tracking-widest text-white shadow-xs">
            ARENA
          </span>
        </div>

        {/* Right: Live Pill, Rules, Profile */}
        <div className="flex items-center gap-2.5">
          <div
            data-testid="arena-live-pill"
            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-[var(--wr-cream)] backdrop-blur-md sm:flex"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--wr-green)]" />
            <span>Arena Live ({onlineCount})</span>
          </div>

          <button
            type="button"
            onClick={onOpenRules}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-[var(--wr-cream)] transition-all cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            type="button"
            onClick={onOpenUserStats}
            className="flex items-center gap-2 rounded-full bg-white/95 hover:bg-white px-3.5 py-1.5 text-xs font-extrabold text-[var(--wr-ink)] shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-sm leading-none">{avatar}</span>
            <span className="max-w-[85px] truncate">{username}</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* 3D STAGE (Letter Tiles + Extruded 3D WordRush Title) */}
      {/* -------------------------------------------------------------------- */}
      <div
        className="relative z-10 flex flex-1 items-center justify-center py-8 sm:py-12"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="flex animate-[wr-float_6s_ease-in-out_infinite] flex-col items-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Scrabble Tiles: W O R D R U S H */}
            <div
              className="mb-6 sm:mb-8 flex gap-2 sm:gap-3"
              style={{ transform: "translateZ(40px)" }}
            >
              {TILES.map(([ch, pts], i) => (
                <motion.div
                  key={ch + i}
                  data-testid={`letter-tile-${i}`}
                  className="wr-tile relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl font-heading text-xl sm:text-2xl font-black"
                  initial={{ y: 90, opacity: 0, rotateX: -80 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 18,
                    delay: 0.15 + i * 0.07,
                  }}
                >
                  {ch}
                  <span className="absolute right-1 bottom-0.5 text-[9px] sm:text-[10px] font-bold opacity-70 font-mono">
                    {pts}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Giant Extruded 3D WordRush Header */}
            <motion.div
              initial={{ opacity: 0, y: 70 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.75, ease: EASE }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <h1
                data-testid="wordrush-logo"
                className="wr-extrude font-heading text-[clamp(3.6rem,13vw,10.5rem)] leading-none font-black tracking-[0.08em] uppercase select-none"
              >
                WordRush
              </h1>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TAGLINE + DIFFICULTY LEVELS + CTA SECTION */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative z-20 flex flex-col gap-6 px-6 pb-12 sm:px-10">
        {/* Difficulty Levels Mention Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/25 border border-white/15 backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-black tracking-wider uppercase text-amber-300 text-[11px]">
              Game Levels:
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-bold text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Easy (4 Letters • 3 Hints)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Medium (5 Letters • 2 Hints)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40 font-bold text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Hard (6 Letters • 1 Hint)</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-200 font-semibold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>First matching letter glows Cyan!</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          {/* Masked Lines Tagline */}
          <p
            data-testid="hero-tagline"
            className="font-heading text-base sm:text-lg font-bold tracking-[0.25em] text-[var(--wr-cream)]/90 uppercase"
          >
            <MaskedLine delay={1.05}>Think fast.</MaskedLine>
            <MaskedLine delay={1.2}>Choose smart.</MaskedLine>
            <MaskedLine delay={1.35}>Beat your opponent.</MaskedLine>
          </p>

          {/* Buttons: Word Puzzles + AI Practice + Primary "Enter the Arena" */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.7, ease: EASE }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            {/* Solo Word Puzzles Mode */}
            <button
              type="button"
              onClick={onOpenPuzzles}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-300/60 bg-amber-400/20 hover:bg-amber-400/30 px-5 py-4 font-heading text-sm font-black text-amber-200 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            >
              <Puzzle className="h-4 w-4 text-amber-300" />
              <span>WORD PUZZLES</span>
            </button>

            {/* Solo AI Practice */}
            <button
              type="button"
              onClick={onPlayBot}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/15 hover:bg-white/25 px-5 py-4 font-heading text-sm font-black text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            >
              <Bot className="h-4 w-4 text-purple-300" />
              <span>AI DUEL</span>
            </button>

            {/* Primary Action Button (Enter Arena) */}
            <button
              type="button"
              data-testid="start-game-btn"
              onClick={onOpenArena}
              className="group relative flex items-center justify-center gap-3 rounded-2xl bg-[var(--wr-yellow)] px-8 py-4 font-heading text-lg font-black tracking-wider text-[var(--wr-ink)] uppercase shadow-[0_6px_0_#c98f0a,0_16px_28px_rgba(6,50,46,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_9px_0_#c98f0a,0_22px_36px_rgba(6,50,46,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#c98f0a] cursor-pointer"
            >
              <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
              <span>ENTER THE ARENA</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
