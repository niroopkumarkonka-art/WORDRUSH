import React, { useState } from "react";
import {
  Swords,
  Bot,
  DoorOpen,
  Sparkles,
  Zap,
  BookOpen,
  Puzzle,
  X,
  Play,
  ArrowRight,
  Shield,
  Star,
  CheckCircle2,
} from "lucide-react";
import { DIFFICULTY_LEVELS } from "../utils/dictionary";

export const GameEntranceModal = ({
  isOpen,
  onClose,
  onStartPuzzles,
  onCreateRoom,
  onJoinRoom,
  onPlayBot,
}) => {
  const [selectedTab, setSelectedTab] = useState("puzzles"); // 'puzzles' | 'bot' | 'multiplayer' | 'join'
  const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
  const [totalRounds, setTotalRounds] = useState(3);
  const [joinCodeInput, setJoinCodeInput] = useState("");

  if (!isOpen) return null;

  const currentLevel = DIFFICULTY_LEVELS[selectedDifficulty] || DIFFICULTY_LEVELS.MEDIUM;

  const handleStartPuzzleMode = () => {
    onStartPuzzles(selectedDifficulty);
    onClose();
  };

  const handleStartBotDuel = () => {
    onPlayBot(currentLevel.wordLength, totalRounds);
    onClose();
  };

  const handleCreateHostRoom = () => {
    onCreateRoom(currentLevel.wordLength, totalRounds);
    onClose();
  };

  const handleJoinWithCode = () => {
    if (joinCodeInput.trim().length === 5) {
      onJoinRoom(joinCodeInput.trim().toUpperCase());
      onClose();
    }
  };

  return (
    <div
      id="game-entrance-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-white border-4 border-amber-300 p-5 sm:p-7 shadow-2xl text-slate-800 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md text-slate-900">
              <Play className="w-5 h-5 fill-current stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider">
                Enter WordRush Arena
              </h2>
              <p className="text-xs text-slate-500">
                Choose game mode & difficulty level to start playing
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

        {/* Difficulty Level Picker - Explicitly Mentioning Easy, Medium, and Hard */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Difficulty Level</span>
            </label>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              First letter matches turn Cyan!
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.values(DIFFICULTY_LEVELS).map((lvl) => {
              const isSelected = selectedDifficulty === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(lvl.id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-1 relative ${
                    isSelected
                      ? `bg-gradient-to-b ${lvl.color} text-white shadow-md scale-102 border-white ring-2 ring-amber-400`
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <span className="text-sm font-black uppercase tracking-wider">
                    {lvl.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {lvl.wordLength} Letters
                  </span>
                  <span
                    className={`text-[9px] font-medium mt-0.5 line-clamp-1 ${
                      isSelected ? "text-white/90" : "text-slate-500"
                    }`}
                  >
                    {lvl.hintCount} Free Hints
                  </span>
                </button>
              );
            })}
          </div>

          {/* Level Details Banner */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
            <span className="font-semibold">{currentLevel.description}</span>
            <span className="text-[11px] font-bold text-amber-700">
              {currentLevel.subtext}
            </span>
          </div>
        </div>

        {/* Game Mode Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedTab("puzzles")}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedTab === "puzzles"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Word Puzzles</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("bot")}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedTab === "bot"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Practice</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("multiplayer")}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedTab === "multiplayer"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>1v1 Arena</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("join")}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedTab === "join"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Join Code</span>
          </button>
        </div>

        {/* TAB 1: WORD PUZZLES */}
        {selectedTab === "puzzles" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border-2 border-amber-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
              <Puzzle className="w-4 h-4 text-amber-600" />
              <span>SOLO WORD PUZZLES ADVENTURE</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solve curated word puzzles with lexical hints and context clues! Play through
              difficulty levels: <strong>Easy ({DIFFICULTY_LEVELS.EASY.wordLength} letters)</strong>,{" "}
              <strong>Medium ({DIFFICULTY_LEVELS.MEDIUM.wordLength} letters)</strong>, and{" "}
              <strong>Hard ({DIFFICULTY_LEVELS.HARD.wordLength} letters)</strong>. Earn 3 stars for
              clever deduction!
            </p>
            <button
              onClick={handleStartPuzzleMode}
              className="w-full py-3.5 px-4 rounded-2xl btn-candy-yellow text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START {selectedDifficulty} WORD PUZZLES</span>
            </button>
          </div>
        )}

        {/* TAB 2: SOLO BOT DUEL */}
        {selectedTab === "bot" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/60 border-2 border-purple-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-purple-950 font-black text-sm">
              <Bot className="w-4 h-4 text-purple-600" />
              <span>SOLO AI CIPHER DUEL (ZERO WAIT TIME)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Face our adaptive Lexical CyberBot in a rapid 1v1 battle. CyberBot selects tricky
              words, deciphers your secret cipher, and plays instantly.
            </p>

            <div className="flex items-center justify-between text-xs font-bold text-purple-900 bg-white p-2.5 rounded-xl border border-purple-200">
              <span>Match Length:</span>
              <div className="flex gap-2">
                {[3, 5].map((rounds) => (
                  <button
                    key={rounds}
                    type="button"
                    onClick={() => setTotalRounds(rounds)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                      totalRounds === rounds
                        ? "bg-purple-600 text-white border-purple-700 shadow-xs"
                        : "bg-purple-50 text-purple-900 border-purple-200"
                    }`}
                  >
                    {rounds} Rounds
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartBotDuel}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>START {selectedDifficulty} BOT DUEL</span>
            </button>
          </div>
        )}

        {/* TAB 3: HOST 1V1 MULTIPLAYER ARENA */}
        {selectedTab === "multiplayer" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
              <Swords className="w-4 h-4 text-emerald-600" />
              <span>HOST 1V1 BATTLE ROOM</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Host an arena room and invite a friend using a 5-letter room code. You'll duel
              turn-by-turn guessing each other's secret words.
            </p>

            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 bg-white p-2.5 rounded-xl border border-emerald-200">
              <span>Match Length:</span>
              <div className="flex gap-2">
                {[3, 5].map((rounds) => (
                  <button
                    key={rounds}
                    type="button"
                    onClick={() => setTotalRounds(rounds)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                      totalRounds === rounds
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-emerald-50 text-emerald-900 border-emerald-200"
                    }`}
                  >
                    {rounds} Rounds
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateHostRoom}
              className="w-full py-3.5 px-4 rounded-2xl btn-candy-green text-white font-black text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>CREATE {selectedDifficulty} ARENA ROOM</span>
            </button>
          </div>
        )}

        {/* TAB 4: JOIN WITH 5-LETTER CODE */}
        {selectedTab === "join" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/60 border-2 border-sky-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sky-950 font-black text-sm">
              <DoorOpen className="w-4 h-4 text-sky-600" />
              <span>JOIN FRIEND'S ROOM</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter the 5-letter room code shared by your friend:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={5}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="CODE"
                className="flex-1 px-4 py-3 rounded-2xl bg-white border-2 border-sky-300 text-slate-800 text-center font-black text-xl uppercase tracking-widest focus:outline-none focus:border-sky-500 shadow-inner"
              />
              <button
                onClick={handleJoinWithCode}
                disabled={joinCodeInput.trim().length !== 5}
                className="px-6 py-3 rounded-2xl btn-candy-blue text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102 active:scale-98"
              >
                JOIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameEntranceModal;
