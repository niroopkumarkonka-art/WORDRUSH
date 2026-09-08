import React from "react";
import { Sparkles } from "lucide-react";

const ITEMS = [
  "Think Fast",
  "Choose Smart",
  "Beat Your Opponent",
  "Two Players. One Word.",
  "No Bots. Just Rivals.",
  "Real-Time Cipher Duel",
];

export default function Marquee() {
  return (
    <div
      data-testid="marquee"
      className="relative z-20 -rotate-1 overflow-hidden border-y-4 border-[var(--wr-ink)] bg-[var(--wr-yellow)] py-4 shadow-md select-none"
    >
      <div className="wr-marquee-track flex w-max items-center whitespace-nowrap">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center">
            {ITEMS.map((t, i) => (
              <span
                key={i}
                className="flex items-center gap-6 pr-8 font-heading text-lg sm:text-xl font-black tracking-widest text-[var(--wr-ink)] uppercase"
              >
                <span>{t}</span>
                <Sparkles className="h-4 w-4 fill-current text-[var(--wr-ink)]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
