import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, CheckCircle2, Bookmark, Layers } from "lucide-react";
import { classifyWord, isFirstCharMatch } from "../../utils/wordClassifier";
import { LetterTile } from "../LetterTile";

export default function LexicalShowcase() {
  const [demoInput, setDemoInput] = useState("SARAH");
  const [demoCompareWord, setDemoCompareWord] = useState("SPARK");

  const classification = classifyWord(demoInput);
  const firstCharsMatch = isFirstCharMatch(demoInput, demoCompareWord);

  const sampleWords = [
    { word: "SARAH", target: "SPARK", label: "Name: SARAH (Match 'S')" },
    { word: "DAVID", target: "DANCE", label: "Name: DAVID (Match 'D')" },
    { word: "BRAVE", target: "BLAZE", label: "Adjective (Match 'B')" },
    { word: "CHASE", target: "CRANE", label: "Verb (Match 'C')" },
    { word: "OCEAN", target: "ORBIT", label: "Noun (Match 'O')" },
  ];

  return (
    <section className="relative bg-[var(--wr-cream)] px-6 py-16 sm:px-10 border-t-2 border-[var(--wr-ink)]/10">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black tracking-[0.35em] text-[var(--wr-teal)] uppercase">
              Tactical Feature
            </span>
            <h3 className="mt-1 font-heading text-2xl sm:text-3xl font-black text-[var(--wr-ink)] uppercase">
              Smart Lexical & First-Letter Match Engine
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--wr-ink)]/70">
              Interactive testbed: see how WordRush renders words, colors the first matching letter Cyan, and detects names.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {sampleWords.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDemoInput(item.word);
                  setDemoCompareWord(item.target);
                }}
                className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  demoInput === item.word
                    ? "bg-[var(--wr-yellow)] text-[var(--wr-ink)] shadow-xs font-black border border-[var(--wr-yellow-deep)]"
                    : "bg-white/80 hover:bg-white text-[var(--wr-ink)] border border-[var(--wr-ink)]/15"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Interactive Input Box */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-[var(--wr-ink)]/15">
          <span className="text-xs font-black text-[var(--wr-ink)] uppercase tracking-wider whitespace-nowrap">
            Try Any Word / Name:
          </span>
          <input
            type="text"
            maxLength={6}
            value={demoInput}
            onChange={(e) => setDemoInput(e.target.value.toUpperCase())}
            placeholder="TYPE WORD OR NAME..."
            className="flex-1 px-3.5 py-1.5 rounded-xl bg-white border-2 border-amber-300 text-slate-800 font-black text-sm uppercase tracking-widest focus:outline-none focus:border-teal-500 shadow-inner"
          />
          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
            Target: <strong className="text-slate-900">{demoCompareWord}</strong>
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border-2 border-[var(--wr-ink)]/15 shadow-[0_8px_24px_rgba(10,95,88,0.08)] flex flex-col md:flex-row items-center gap-6 justify-between">
          {/* Tile Preview */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <span className="text-[11px] font-black uppercase text-[var(--wr-ink)]/60 tracking-wider">
              Secret Target: <strong className="text-[var(--wr-ink)]">{demoCompareWord}</strong> | Tested Word: <strong className="text-[var(--wr-ink)]">{demoInput || "-"}</strong>
            </span>
            <div className="flex items-center gap-2">
              {demoInput.split("").map((letter, idx) => {
                const isFirst = idx === 0;
                let state = "GRAY";
                let isFirstMatch = false;

                if (demoCompareWord[idx] === letter) {
                  if (isFirst) {
                    state = "FIRST_MATCH";
                    isFirstMatch = true;
                  } else {
                    state = "GREEN";
                  }
                } else if (demoCompareWord.includes(letter)) {
                  state = "YELLOW";
                } else {
                  state = "GRAY";
                }

                return (
                  <LetterTile
                    key={idx}
                    letter={letter}
                    state={state}
                    index={idx}
                    isFirstCharMatch={isFirstMatch}
                    size="md"
                  />
                );
              })}
              {demoInput.length === 0 && (
                <span className="text-xs italic text-slate-400">Type a word above to test preview</span>
              )}
            </div>
          </div>

          {/* Lexical Badge & Detection Notes */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                <Bookmark className="w-4 h-4 text-amber-700" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 block leading-tight">
                    Part of Speech
                  </span>
                  <span className="text-xs font-black text-amber-950 uppercase">
                    {classification.category}
                  </span>
                </div>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${
                firstCharsMatch
                  ? "bg-cyan-50 border-cyan-300 text-cyan-950"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}>
                <CheckCircle2 className={`w-4 h-4 ${firstCharsMatch ? "text-cyan-600" : "text-slate-400"}`} />
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-75 block leading-tight">
                    First Char Match
                  </span>
                  <span className="text-xs font-black uppercase">
                    {firstCharsMatch ? `Cyan Match ('${demoInput[0]}')` : "No First Match"}
                  </span>
                </div>
              </div>
            </div>

            {/* If WordClassifier detected a specific note (e.g. Person Name) */}
            {classification.note && (
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-semibold">{classification.note}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
