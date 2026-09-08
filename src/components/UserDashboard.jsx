import React, { useState, useEffect } from "react";
import { User, Trophy, Award, Zap, Sparkles, X, CheckCircle2, TrendingUp, History, Star } from "lucide-react";

export const UserDashboard = ({
  isOpen = false,
  onClose,
  username = "Player",
  playerId = "",
  avatar = "🦊",
  onUpdateProfile,
}) => {
  const [stats, setStats] = useState({
    matchesPlayed: 12,
    matchesWon: 8,
    matchesLost: 3,
    matchesDrawn: 1,
    winRate: 67,
    totalScore: 485,
    highestScore: 82,
    wordsGuessed: 24,
    currentStreak: 4,
    guessDistribution: [1, 3, 5, 2, 1, 0],
    recentMatches: [
      { id: "m1", opponent: "CyberBot 🤖", word: "CHAIR", result: "WIN", score: "+36", date: "Today" },
      { id: "m2", opponent: "Player_842", word: "PLANT", result: "WIN", score: "+42", date: "Yesterday" },
      { id: "m3", opponent: "LexiQueen", word: "STORM", result: "LOSS", score: "+18", date: "2 days ago" },
      { id: "m4", opponent: "AlphaWord", word: "CRANE", result: "WIN", score: "+40", date: "3 days ago" },
    ],
  });

  const [selectedAvatar, setSelectedAvatar] = useState(avatar);
  const [activeTab, setActiveTab] = useState("overview"); // overview, distribution, history

  const avatarChoices = ["🦊", "🦉", "🐻", "🦁", "🐰", "🐼", "🤖", "⭐", "⚡", "💎"];

  useEffect(() => {
    setSelectedAvatar(avatar);
  }, [avatar]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`wordrush_user_stats_${playerId}`);
      if (saved) {
        setStats((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.warn("Could not load stats", e);
    }
  }, [playerId]);

  if (!isOpen) return null;

  const handleAvatarPick = (av) => {
    setSelectedAvatar(av);
    if (onUpdateProfile) {
      onUpdateProfile({ avatar: av, username });
    }
  };

  const winPercentage = Math.round((stats.matchesWon / Math.max(stats.matchesPlayed, 1)) * 100);

  return (
    <div
      id="user-dashboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-white to-amber-50/40 border-4 border-amber-300 p-5 sm:p-7 shadow-2xl text-slate-700 flex flex-col gap-5 animate-pop">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 shadow-sm">
              <User className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
                  PLAYER CAREER & STATS
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RANK: TIER IV
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Personal duel history, trophies, and avatar customization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Profile Identity Badge */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-3xl shadow-md transform hover:rotate-3 transition-transform">
              {selectedAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-800">{username}</h3>
                <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                  <span>Grandmaster Duelist</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold mt-1">
                <span>Streak: <b className="text-amber-600">{stats.currentStreak} 🔥</b></span>
                <span>•</span>
                <span>Best Match: <b className="text-emerald-700">{stats.highestScore} pts</b></span>
              </div>
            </div>
          </div>

          {/* Quick Avatar Row */}
          <div className="flex flex-col items-center sm:items-end gap-1">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Change Avatar:
            </span>
            <div className="flex flex-wrap gap-1">
              {avatarChoices.slice(0, 7).map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => handleAvatarPick(av)}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-transform cursor-pointer ${
                    selectedAvatar === av
                      ? "bg-amber-300 border-2 border-amber-500 scale-110 shadow-sm"
                      : "bg-white border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-amber-400 text-amber-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab("distribution")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "distribution"
                ? "bg-amber-400 text-amber-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Guess Distribution
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-amber-400 text-amber-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Match History
          </button>
        </div>

        {/* Tab 1: Overview & Metrics */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Primary Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Matches Played</span>
                <span className="text-2xl font-black text-slate-800 mt-1">{stats.matchesPlayed}</span>
                <span className="text-[10px] font-semibold text-emerald-600">100% 1v1 PvP</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Win Rate</span>
                <span className="text-2xl font-black text-emerald-600 mt-1">{winPercentage}%</span>
                <span className="text-[10px] font-semibold text-slate-400">{stats.matchesWon}W - {stats.matchesLost}L</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Career Pts</span>
                <span className="text-2xl font-black text-amber-600 mt-1">{stats.totalScore}</span>
                <span className="text-[10px] font-semibold text-amber-700">Arena Rating: 1420</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Words Decoded</span>
                <span className="text-2xl font-black text-sky-600 mt-1">{stats.wordsGuessed}</span>
                <span className="text-[10px] font-semibold text-sky-700">Avg 3.2 attempts</span>
              </div>
            </div>

            {/* Syllabus Mastery Badges */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col gap-3">
              <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Academic Data Structure Achievements</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm font-black shrink-0">
                    LIFO
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-900 block">Stack Clue Master</span>
                    <span className="text-[11px] text-emerald-700 leading-tight block">
                      Efficiently consumed reverse-order hints from LIFO hint stack.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center text-sm font-black shrink-0">
                    SET
                  </div>
                  <div>
                    <span className="text-xs font-black text-sky-900 block">Zero Duplicate Penalty</span>
                    <span className="text-[11px] text-sky-700 leading-tight block">
                      Passed std::set duplicate letter analysis on all guesses.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center text-sm font-black shrink-0">
                    2D
                  </div>
                  <div>
                    <span className="text-xs font-black text-purple-900 block">Matrix Commander</span>
                    <span className="text-[11px] text-purple-700 leading-tight block">
                      Successfully traversed the 6x5 state matrix grid without overflow.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Guess Distribution */}
        {activeTab === "distribution" && (
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col gap-3 animate-fadeIn">
            <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Guess Attempts Distribution</span>
            </h4>
            <div className="flex flex-col gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6].map((attempt, idx) => {
                const count = stats.guessDistribution[idx] || 0;
                const maxCount = Math.max(...stats.guessDistribution, 1);
                const percent = Math.round((count / maxCount) * 100);

                return (
                  <div key={attempt} className="flex items-center gap-3 text-xs font-bold">
                    <span className="w-4 text-slate-600">{attempt}</span>
                    <div className="flex-1 h-6 rounded-lg bg-slate-100 overflow-hidden relative flex items-center">
                      <div
                        className={`h-full rounded-lg transition-all duration-500 ${
                          idx === 0
                            ? "bg-emerald-500"
                            : idx === 1
                            ? "bg-emerald-400"
                            : idx === 2
                            ? "bg-amber-400"
                            : "bg-slate-400"
                        }`}
                        style={{ width: `${Math.max(percent, 8)}%` }}
                      />
                      <span className="absolute right-3 text-xs font-black text-slate-700">
                        {count} {count === 1 ? "win" : "wins"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Match History */}
        {activeTab === "history" && (
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col gap-3 animate-fadeIn">
            <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-600" />
              <span>Recent 1v1 Arena Matches</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-black text-[10px]">
                    <th className="py-2">Opponent</th>
                    <th className="py-2">Word</th>
                    <th className="py-2">Result</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {stats.recentMatches.map((m) => (
                    <tr key={m.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-2.5 font-bold flex items-center gap-1.5">
                        <span>{m.opponent}</span>
                      </td>
                      <td className="py-2.5 font-mono font-black text-amber-800">{m.word}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            m.result === "WIN"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {m.result}
                        </span>
                      </td>
                      <td className="py-2.5 font-black text-emerald-700">{m.score}</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{m.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-amber-100 text-xs text-slate-400">
          <span>Player ID: <code className="font-mono text-slate-600">{playerId || "guest"}</code></span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs uppercase shadow-sm cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
