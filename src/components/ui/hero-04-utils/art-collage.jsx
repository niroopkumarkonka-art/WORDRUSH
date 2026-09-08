import React from "react";
import { motion } from "motion/react";
import { Sparkles, Trophy, Lightbulb, Users } from "lucide-react";

export const ArtCollage = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto my-7 px-4">
      {/* Light Playful Game Showcase Card */}
      <div className="relative rounded-3xl border-2 border-sky-200/80 bg-white/95 p-6 md:p-8 shadow-xl shadow-sky-900/5 overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold tracking-wide text-slate-700 uppercase">Live Game Room</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-semibold">1v1 Real-Time</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200">
              Round 2 of 3
            </span>
          </div>
        </div>

        {/* Central Game Elements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Word Tiles Preview */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl bg-slate-50 border border-slate-200 p-5 overflow-hidden text-left"
          >
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5 text-amber-600">
                <Sparkles className="w-3.5 h-3.5" />
                SECRET WORD
              </span>
              <span className="text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-full">
                5 LETTERS
              </span>
            </div>

            {/* Letter Tiles in classic Word Game colors */}
            <div className="flex items-center justify-center gap-1.5 py-3">
              {[
                { char: "C", state: "green" },
                { char: "R", state: "green" },
                { char: "A", state: "yellow" },
                { char: "N", state: "gray" },
                { char: "E", state: "green" },
              ].map((item, i) => (
                <span
                  key={i}
                  className={`w-9 h-11 sm:w-10 sm:h-12 rounded-xl font-black text-lg sm:text-xl flex items-center justify-center shadow-sm select-none ${
                    item.state === "green"
                      ? "bg-emerald-500 text-white border-b-3 border-emerald-700"
                      : item.state === "yellow"
                      ? "bg-amber-400 text-amber-950 border-b-3 border-amber-600"
                      : "bg-slate-200 text-slate-500 border-b-3 border-slate-300"
                  }`}
                >
                  {item.char}
                </span>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between items-center mt-2">
              <span className="text-emerald-600 font-bold">Green = Correct Spot</span>
              <span className="text-amber-600 font-bold">Yellow = In Word</span>
            </div>
          </motion.div>

          {/* Card 2: Head to Head Score */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-sky-200 p-5 flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md mb-2 border-b-3 border-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Live Battle Scores
            </span>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-700 block">Player 1</span>
                <span className="text-lg font-black text-emerald-600">320 pts</span>
              </div>
              <span className="text-xs font-black text-slate-300">VS</span>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block">Player 2</span>
                <span className="text-lg font-black text-sky-600">280 pts</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Smart AI Hint */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl bg-slate-50 border border-slate-200 p-5 overflow-hidden text-left"
          >
            <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5 text-sky-600">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                AI WORD CLUE
              </span>
              <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                FREE HINT
              </span>
            </div>
            <div className="space-y-2 py-1">
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed font-medium">
                "A large bird known for long legs and an elegant neck, or a machine that lifts heavy loads."
              </div>
              <div className="text-[11px] text-slate-500 px-1 font-medium">
                Ask for a hint anytime during your turn!
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 font-medium">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Play on Phone, Tablet, or PC — No Downloads Required</span>
          </div>
          <div className="text-slate-600 font-bold">
            Create a room & invite a friend with 1 click!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtCollage;

