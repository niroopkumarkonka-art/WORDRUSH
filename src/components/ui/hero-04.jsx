import React from "react";
import { CTA } from "./hero-04-utils/cta";
import { ArtCollage } from "./hero-04-utils/art-collage";
import Balancer from "react-wrap-balancer";
import { Sparkles, Users } from "lucide-react";

export const Hero04 = ({
  onEnterArena,
  onOpenUserDashboard,
  onOpenAdminDashboard,
  onlinePlayersCount = 24,
  activeBattlesCount = 8,
}) => {
  return (
    <section className="relative w-full overflow-hidden py-6 md:py-10">
      <div className="container relative mx-auto px-4 text-center">
        {/* Playful Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/90 px-4 py-1.5 text-xs font-bold text-amber-800 shadow-sm mb-5 backdrop-blur-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="tracking-wide">MULTIPLAYER WORD GAME</span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-600 font-semibold">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            {onlinePlayersCount} Players Online
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-800 uppercase">
          <Balancer>
            GUESS WORDS.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500">
              BEAT YOUR FRIENDS!
            </span>
          </Balancer>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          <Balancer>
            Fast-paced 1-on-1 multiplayer word game. One player chooses a secret word, the other races to guess it with helpful clues and live reactions!
          </Balancer>
        </p>

        {/* Call to Actions */}
        <CTA
          onEnterArena={onEnterArena}
          onOpenUserDashboard={onOpenUserDashboard}
          onOpenAdminDashboard={onOpenAdminDashboard}
          onlinePlayersCount={onlinePlayersCount}
          activeBattlesCount={activeBattlesCount}
        />

        {/* Game App Preview Collage */}
        <ArtCollage />
      </div>
    </section>
  );
};

export default Hero04;

