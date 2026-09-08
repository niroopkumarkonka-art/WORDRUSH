import React, { useEffect } from "react";
import { Delete, CornerDownLeft } from "lucide-react";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE"],
];

export const Keyboard = ({
  onChar,
  onEnter,
  onDelete,
  onKeyPress,
  letterStates = {},
  keyStates = {},
  disabled = false,
}) => {
  const handleChar = (char) => {
    if (typeof onChar === "function") onChar(char);
    else if (typeof onKeyPress === "function") onKeyPress(char);
  };

  const handleEnter = () => {
    if (typeof onEnter === "function") onEnter();
    else if (typeof onKeyPress === "function") onKeyPress("ENTER");
  };

  const handleDelete = () => {
    if (typeof onDelete === "function") onDelete();
    else if (typeof onKeyPress === "function") onKeyPress("BACKSPACE");
  };

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleEnter();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleChar(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onChar, onEnter, onDelete, onKeyPress, disabled]);

  const getKeyStyle = (key) => {
    if (key === "ENTER") {
      return "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.4)] border border-cyan-300";
    }
    if (key === "DELETE") {
      return "bg-rose-500 hover:bg-rose-400 text-white font-black shadow-[0_0_15px_rgba(244,63,94,0.3)] border border-rose-400";
    }

    const state = letterStates[key] ?? keyStates[key];
    const isGreen = state === 2 || state === "GREEN" || state === "green";
    const isYellow = state === 1 || state === "YELLOW" || state === "yellow";
    const isGray = state === 0 || state === "GRAY" || state === "gray";

    if (isGreen) {
      // Green
      return "bg-emerald-600 text-white border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
    }
    if (isYellow) {
      // Yellow
      return "bg-amber-400 text-slate-950 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
    }
    if (isGray) {
      // Gray (Not in word)
      return "bg-slate-900/90 text-slate-500 border border-slate-800 opacity-60";
    }
    // Default cyber key
    return "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-cyan-500/20 hover:border-cyan-400/50 shadow-sm";
  };

  return (
    <div
      id="wordrush-keyboard"
      className="w-full max-w-xl mx-auto flex flex-col gap-1.5 p-2 sm:p-3 rounded-2xl backdrop-blur-xl bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] select-none"
    >
      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div key={`kb-row-${rIdx}`} className="flex items-center justify-center gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isSpecial = key === "ENTER" || key === "DELETE";

            return (
              <button
                key={key}
                id={`key-${key}`}
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (disabled) return;
                  if (key === "ENTER") handleEnter();
                  else if (key === "DELETE") handleDelete();
                  else handleChar(key);
                }}
                className={`flex items-center justify-center h-10 sm:h-12 rounded-xl text-sm sm:text-base font-mono font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  isSpecial ? "flex-[1.4]" : "flex-1"
                } ${getKeyStyle(key)}`}
              >
                {key === "ENTER" ? (
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs">ENTER</span>
                  </span>
                ) : key === "DELETE" ? (
                  <Delete className="w-4 h-4" />
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
