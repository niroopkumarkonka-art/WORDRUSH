import React from "react";
import { motion } from "motion/react";
import { Play, Swords, Shield, Heart, Puzzle } from "lucide-react";

export default function FinalCta({ onOpenArena, onPlayBot, onOpenPuzzles, onOpenRules }) {
  return (
    <section
      data-testid="final-cta-section"
      className="wr-hero-bg relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center sm:px-10 md:py-32"
    >
      {/* Background Dots & Grain */}
      <div className="wr-dots absolute inset-0 pointer-events-none" />
      <div className="wr-grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />

      {/* Floating 3D Shapes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="wr-shape h-32 w-32"
          style={{ top: "10%", right: "12%", animationDuration: "16s" }}
        />
        <div
          className="wr-shape wr-shape-cream h-24 w-24"
          style={{ bottom: "14%", left: "10%", animationDuration: "11s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <h2
            data-testid="final-cta-heading"
            className="wr-extrude font-heading text-[clamp(2.8rem,9vw,6.5rem)] font-black tracking-wide uppercase select-none leading-none"
          >
            READY TO RUSH?
          </h2>
        </motion.div>

        <p className="mt-6 max-w-md font-heading text-base sm:text-xl font-bold text-[var(--wr-cream)]/85 uppercase tracking-wider">
          Grab a friend. Pick a word. Settle it.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center">
          <button
            type="button"
            data-testid="final-cta-btn"
            onClick={onOpenArena}
            className="group relative flex items-center justify-center gap-3 rounded-2xl bg-[var(--wr-yellow)] px-8 py-4 sm:px-9 sm:py-4 font-heading text-lg sm:text-xl font-black tracking-wider text-[var(--wr-ink)] uppercase shadow-[0_6px_0_#c98f0a,0_20px_32px_rgba(6,50,46,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_9px_0_#c98f0a,0_26px_40px_rgba(6,50,46,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#c98f0a] cursor-pointer"
          >
            <span>ENTER THE ARENA</span>
            <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
          </button>

          <button
            type="button"
            onClick={onOpenPuzzles}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-300/60 bg-amber-400/20 hover:bg-amber-400/30 px-6 py-4 font-heading text-base font-black text-amber-200 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            <Puzzle className="h-5 w-5 text-amber-300" />
            <span>WORD PUZZLES</span>
          </button>

          <button
            type="button"
            onClick={onPlayBot}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 hover:bg-white/20 px-6 py-4 font-heading text-base font-black text-[var(--wr-cream)] backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            <Swords className="h-5 w-5 text-amber-300" />
            <span>SOLO AI DUEL</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* FOOTER BAR */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-16 pt-8 border-t border-white/15 w-full flex flex-col items-center gap-2 text-xs text-[var(--wr-cream)]/75">
          <p className="text-[12px] text-[var(--wr-cream)]/80 font-bold tracking-wide">
            WordRush Arena • 1v1 Turn-Based Cipher Duel • Wordle-Style Deduction with Tactical Hints
          </p>
        </div>
      </div>
    </section>
  );
}
