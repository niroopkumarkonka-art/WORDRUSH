import React from "react";
import { motion } from "motion/react";
import { Play, Shield, User, Sparkles } from "lucide-react";

export const CTA = ({
  onEnterArena,
  onOpenUserDashboard,
  onOpenAdminDashboard,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-7 w-full max-w-2xl mx-auto">
      <motion.button
        id="hero-play-arena-btn"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={onEnterArena}
        className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-candy-green text-white font-black tracking-wide text-base flex items-center justify-center gap-3 cursor-pointer select-none"
      >
        <Play className="w-5 h-5 fill-white stroke-none" />
        <span>PLAY WITH FRIENDS</span>
        <Sparkles className="w-4 h-4 text-yellow-200" />
      </motion.button>

      <motion.button
        id="hero-user-dashboard-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpenUserDashboard}
        className="w-full sm:w-auto px-6 py-4 rounded-2xl btn-candy-blue text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer select-none"
      >
        <User className="w-4 h-4" />
        <span>MY STATS</span>
      </motion.button>

      <motion.button
        id="hero-admin-telemetry-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpenAdminDashboard}
        className="w-full sm:w-auto px-5 py-4 rounded-2xl btn-candy-white text-slate-700 font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 cursor-pointer select-none"
      >
        <Shield className="w-4 h-4 text-amber-500" />
        <span>ROOM MONITOR</span>
      </motion.button>
    </div>
  );
};

