import React from "react";
import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function MiniTile({ ch, variant = "" }) {
  return (
    <div
      className={`wr-tile ${variant} flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-xl font-heading text-lg sm:text-xl font-black transition-transform select-none`}
    >
      {ch}
    </div>
  );
}

function Chapter({ num, title, body, visual, flip, testId }) {
  return (
    <div
      data-testid={testId}
      className={`flex flex-col items-center gap-8 md:flex-row md:gap-16 ${
        flip ? "md:flex-row-reverse" : ""
      }`}
    >
      <Reveal className="flex-1">
        <span className="font-heading text-7xl font-black text-transparent sm:text-8xl [-webkit-text-stroke:2.5px_var(--wr-yellow-deep)] select-none">
          {num}
        </span>
        <h3 className="mt-3 font-heading text-2xl font-black tracking-wide text-[var(--wr-ink)] uppercase md:text-3xl">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm sm:text-base leading-relaxed text-[var(--wr-ink)]/75">
          {body}
        </p>
      </Reveal>

      <Reveal delay={0.15} className="flex flex-1 justify-center">
        {visual}
      </Reveal>
    </div>
  );
}

export default function Chapters() {
  return (
    <section
      data-testid="chapters-section"
      className="relative bg-[var(--wr-cream)] px-6 py-20 sm:px-10 md:py-32"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-20 md:gap-28">
        <Reveal>
          <p className="text-xs font-black tracking-[0.35em] text-[var(--wr-teal)] uppercase">
            How the arena works
          </p>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-black text-[var(--wr-ink)] uppercase">
            Three moves between you and glory.
          </h2>
        </Reveal>

        {/* Chapter 01: Set the trap */}
        <Chapter
          num="01"
          testId="chapter-1"
          title="Set the trap"
          body="One player locks in a secret word — no repeated letters allowed. Make it cruel. Make it clever. Your rival never sees it."
          visual={
            <div className="flex gap-2 sm:gap-3" style={{ perspective: "600px" }}>
              {["?", "?", "?", "?", "?"].map((c, i) => (
                <motion.div
                  key={i}
                  animate={{ rotateY: [0, 180, 360] }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: "easeInOut",
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <MiniTile ch={c} />
                </motion.div>
              ))}
            </div>
          }
        />

        {/* Chapter 02: Read the board */}
        <Chapter
          num="02"
          testId="chapter-2"
          title="Read the board & First-Letter Match"
          flip
          body="Cyan glows when the first letter matches! Green means position is spot on. Yellow means in the word, wrong spot. Gray means let it go. Six attempts to crack the code."
          visual={
            <div className="flex gap-2 sm:gap-3">
              <div className="wr-tile flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-xl font-heading text-lg sm:text-xl font-black bg-gradient-to-b from-cyan-400 to-blue-600 text-white shadow-[0_4px_0_#0284c7] relative">
                C
                <span className="absolute -top-1.5 -right-1 text-[8px] font-bold px-1 rounded-full bg-cyan-200 text-cyan-950">1st</span>
              </div>
              <MiniTile ch="R" variant="wr-tile-green" />
              <MiniTile ch="A" variant="wr-tile-yellow" />
              <MiniTile ch="N" variant="wr-tile-gray" />
              <MiniTile ch="E" variant="wr-tile-yellow" />
            </div>
          }
        />

        {/* Chapter 03: Spend your stars */}
        <Chapter
          num="03"
          testId="chapter-3"
          title="Spend your stars"
          body="Free hints every round based on difficulty. Every extra hint costs a point. Guess fast, score high — the arena crowns no cowards."
          visual={
            <div className="flex items-center gap-3">
              {["★", "★", "★"].map((s, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[var(--wr-yellow)] font-heading text-2xl font-black text-[var(--wr-ink)] shadow-[0_5px_0_#c98f0a]"
                >
                  {s}
                </motion.div>
              ))}
              <span className="rounded-full bg-[var(--wr-ink)] px-3.5 py-2 text-xs font-black tracking-wider text-[var(--wr-cream)] shadow-md">
                HINT SYSTEM
              </span>
            </div>
          }
        />

        {/* Chapter 04: Easy, Medium, and Hard Levels */}
        <Chapter
          num="04"
          testId="chapter-4"
          title="Easy, Medium, or Hard Levels"
          flip
          body="Pick your challenge: Easy (4 letters • 3 hints), Medium (5 letters • 2 hints), or Hard (6 letters • 1 hint). Play 1v1 live duels, solo AI practice, or curated Word Puzzles!"
          visual={
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-between text-emerald-950 font-bold text-xs">
                <span>EASY LEVEL</span>
                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px]">4 Letters • 3 Hints</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-between text-amber-950 font-bold text-xs">
                <span>MEDIUM LEVEL</span>
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px]">5 Letters • 2 Hints</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-between text-rose-950 font-bold text-xs">
                <span>HARD LEVEL</span>
                <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px]">6 Letters • 1 Hint</span>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}
