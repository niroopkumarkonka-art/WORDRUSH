import React, { useEffect } from "react";
import Lenis from "lenis";
import Hero from "./landing/Hero";
import Marquee from "./landing/Marquee";
import Chapters from "./landing/Chapters";
import LexicalShowcase from "./landing/LexicalShowcase";
import FinalCta from "./landing/FinalCta";

export const LandingPage = ({
  username = "Player",
  avatar = "🦊",
  onUpdateProfile,
  onOpenArena,
  onCreateRoom,
  onJoinRoom,
  onPlayBot,
  onOpenPuzzles,
  onOpenAnagrams,
  onOpenRules,
  onOpenUserStats,
  onOpenAdmin,
  onlineCount = 28,
  serverStatus = "Online",
}) => {
  useEffect(() => {
    let lenis;
    let raf = 0;
    try {
      lenis = new Lenis({ lerp: 0.09 });
      const loop = (time) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } catch (err) {
      console.warn("Lenis init skipped", err);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <div
      data-testid="landing-page"
      className="w-full bg-[#0e7c74] font-heading antialiased selection:bg-[var(--wr-yellow)] selection:text-[var(--wr-ink)]"
    >
      {/* 1. HERO SECTION WITH 3D TILES & EXTRUDED LOGO */}
      <Hero
        username={username}
        avatar={avatar}
        onOpenArena={onOpenArena}
        onCreateRoom={onCreateRoom}
        onJoinRoom={onJoinRoom}
        onPlayBot={onPlayBot}
        onOpenPuzzles={onOpenPuzzles}
        onOpenAnagrams={onOpenAnagrams}
        onOpenRules={onOpenRules}
        onOpenUserStats={onOpenUserStats}
        onlineCount={onlineCount}
        serverStatus={serverStatus}
      />

      {/* 2. INFINITE SCROLLING ANGLED MARQUEE BANNER */}
      <Marquee />

      {/* 3. HOW THE ARENA WORKS (CHAPTERS 01, 02, 03) */}
      <Chapters />

      {/* 4. TACTICAL LEXICAL ENGINE & FIRST-CHAR COLOR DEMO */}
      <LexicalShowcase />

      {/* 5. FINAL CALL TO ACTION & EXPLICIT ATTRIBUTION MENTION */}
      <FinalCta
        onOpenArena={onOpenArena}
        onPlayBot={onPlayBot}
        onOpenPuzzles={onOpenPuzzles}
        onOpenAnagrams={onOpenAnagrams}
        onOpenRules={onOpenRules}
      />
    </div>
  );
};

export default LandingPage;
