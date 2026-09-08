import React, { useState, useEffect, useCallback } from "react";
import { Shield, Server, Users, RefreshCw, X, Radio, Trash2, Cpu, Send, CheckCircle2, AlertTriangle, Database } from "lucide-react";

export const AdminDashboard = ({ isOpen = false, onClose }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [terminating, setTerminating] = useState("");
  const [error, setError] = useState(null);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) throw new Error("Failed to load server stats");
      const data = await res.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load server stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchMetrics]);

  const handleTerminateRoom = async (code) => {
    if (!window.confirm(`Are you sure you want to close game room ${code}?`)) return;
    try {
      setTerminating(code);
      const res = await fetch(`/api/admin/rooms/${code}/terminate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to close room");
      fetchMetrics();
    } catch (err) {
      alert(err.message);
    } finally {
      setTerminating("");
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: broadcastMsg.trim() }),
      });
      if (res.ok) {
        setBroadcastSuccess(true);
        setBroadcastMsg("");
        setTimeout(() => setBroadcastSuccess(false), 1500); // 1.5 sec only
      }
    } catch (err) {
      alert("Broadcast failed: " + err.message);
    }
  };

  if (!isOpen) return null;

  const formatUptime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      id="admin-dashboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border-4 border-amber-400 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-slate-100 flex flex-col gap-5 animate-pop">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/20 border border-amber-400 text-amber-400 shadow-sm">
              <Shield className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span>ADMIN TELEMETRY & CONTROL</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40">
                    SUPERADMIN
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Real-time WebSocket monitoring, active room termination, and global broadcasts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              title="Refresh telemetry"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Real-time Server Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>Server Uptime</span>
            </span>
            <span className="text-xl font-black text-white mt-1">
              {metrics ? formatUptime(metrics.uptime) : "..."}
            </span>
            <span className="text-[10px] text-emerald-400 mt-0.5">● Node.js Active</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>Active Sockets</span>
            </span>
            <span className="text-xl font-black text-sky-400 mt-1">
              {metrics ? metrics.activeConnections : "..."}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Live WebSocket feeds</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Registered Users</span>
            </span>
            <span className="text-xl font-black text-emerald-400 mt-1">
              {metrics ? metrics.registeredUsersCount : "..."}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">In-memory Map</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Gemini AI Engine</span>
            </span>
            <span className="text-xl font-black text-purple-300 mt-1">
              {metrics?.aiConfigured ? "Ready" : "Fallback"}
            </span>
            <span className="text-[10px] text-purple-400 mt-0.5">
              {metrics?.aiConfigured ? "gemini-3.8-flash" : "Local Clues"}
            </span>
          </div>
        </div>

        {/* Global Broadcast Form */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>System-Wide Live Broadcast</span>
            </h4>
            {broadcastSuccess && (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Message dispatched to all players!</span>
              </span>
            )}
          </div>
          <form onSubmit={handleSendBroadcast} className="flex gap-2">
            <input
              type="text"
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="e.g. Tournament starting in 5 minutes! Maintenance scheduled..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!broadcastMsg.trim()}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase cursor-pointer"
            >
              Broadcast
            </button>
          </form>
        </div>

        {/* Live Active Game Rooms Table */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Game Rooms ({metrics?.rooms?.length || 0})</span>
            </h4>
            <span className="text-[11px] text-slate-400">Strictly 1v1 Multiplayer Arenas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase font-black text-[10px]">
                  <th className="py-2">Room Code</th>
                  <th className="py-2">Players</th>
                  <th className="py-2">Phase</th>
                  <th className="py-2">Round</th>
                  <th className="py-2">Word Len</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {metrics?.rooms && metrics.rooms.length > 0 ? (
                  metrics.rooms.map((r) => (
                    <tr key={r.roomCode} className="hover:bg-slate-800/50">
                      <td className="py-2.5 font-mono font-black text-amber-400">{r.roomCode}</td>
                      <td className="py-2.5">{r.players.join(" vs ") || "Waiting for player..."}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                          {r.phase}
                        </span>
                      </td>
                      <td className="py-2.5">{r.currentRound} / {r.totalRounds}</td>
                      <td className="py-2.5">{r.wordLength} Letters</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleTerminateRoom(r.roomCode)}
                          disabled={terminating === r.roomCode}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{terminating === r.roomCode ? "Closing..." : "Terminate"}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No active multiplayer game rooms at this moment. Create one on the landing page!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Syllabus Telemetry */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span>B.Tech Data Structures C++ Architecture In-Memory Telemetry</span>
            <span className="text-emerald-400 font-mono">ArenaEngine: 0 errors</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-amber-400 block font-bold">1D Array</span>
              <span>Key states O(1)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-sky-400 block font-bold">2D Matrix</span>
              <span>6x5 grid O(r×c)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-purple-400 block font-bold">Stack ADT</span>
              <span>LIFO Hints (Top)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 block font-bold">std::set</span>
              <span>Duplicate check O(log n)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-500">
          <span>Administrator Mode Active • Session Encrypted</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase cursor-pointer"
          >
            Close Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
