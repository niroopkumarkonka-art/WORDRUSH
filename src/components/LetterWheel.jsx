import React, { useState, useRef, useEffect, useCallback } from "react";
import { Shuffle, Delete, Check, Keyboard as KeyboardIcon } from "lucide-react";

export const LetterWheel = ({
  letters: initialLetters,
  currentInput = "",
  onLetterAdd,
  onWordSubmit,
  onClear,
  onDeleteChar,
  onToggleKeyboard,
  disabled = false,
}) => {
  const [wheelLetters, setWheelLetters] = useState([]);
  const [connectedIndices, setConnectedIndices] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (initialLetters && initialLetters.length > 0) {
      setWheelLetters([...initialLetters]);
    } else {
      setWheelLetters(["S", "A", "U", "C", "E", "T", "F"]);
    }
    setConnectedIndices([]);
  }, [initialLetters]);

  const size = 300;
  const center = size / 2;
  const radius = 102;
  const nodeHitRadius = 28;

  const getNodePosition = useCallback(
    (index, total) => {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    },
    [center, radius]
  );

  const findNodeAtPosition = useCallback(
    (x, y) => {
      const total = wheelLetters.length;
      for (let i = 0; i < total; i++) {
        const node = getNodePosition(i, total);
        const dist = Math.hypot(x - node.x, y - node.y);
        if (dist <= nodeHitRadius) {
          return i;
        }
      }
      return null;
    },
    [wheelLetters.length, getNodePosition]
  );

  const getRelativeCoords = (e) => {
    if (!wheelRef.current) return null;
    const rect = wheelRef.current.getBoundingClientRect();
    const scale = size / rect.width;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    const coords = getRelativeCoords(e);
    if (!coords) return;

    const hitIndex = findNodeAtPosition(coords.x, coords.y);
    if (hitIndex !== null) {
      setIsDragging(true);
      setConnectedIndices([hitIndex]);
      setPointerPos(coords);
      onLetterAdd(wheelLetters[hitIndex]);
      e.target.setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || disabled) return;
    const coords = getRelativeCoords(e);
    if (!coords) return;
    setPointerPos(coords);

    const hitIndex = findNodeAtPosition(coords.x, coords.y);
    if (hitIndex !== null) {
      if (
        connectedIndices.length >= 2 &&
        hitIndex === connectedIndices[connectedIndices.length - 2]
      ) {
        setConnectedIndices((prev) => prev.slice(0, -1));
        onDeleteChar();
        return;
      }

      if (!connectedIndices.includes(hitIndex)) {
        setConnectedIndices((prev) => [...prev, hitIndex]);
        onLetterAdd(wheelLetters[hitIndex]);
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setPointerPos(null);

    if (connectedIndices.length >= 3) {
      const formedWord = connectedIndices.map((i) => wheelLetters[i]).join("");
      onWordSubmit(formedWord);
    }

    setTimeout(() => {
      setConnectedIndices([]);
    }, 150);
  };

  const handleShuffle = () => {
    setWheelLetters((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    setConnectedIndices([]);
  };

  const handleNodeClick = (index) => {
    if (isDragging || disabled) return;
    onLetterAdd(wheelLetters[index]);
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div
        ref={wheelRef}
        id="letter-wheel-container"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] touch-none rounded-full flex items-center justify-center cursor-pointer transition-transform bg-gradient-to-b from-[#ffffff] via-[#fffdf0] to-[#fef9c3] border-4 border-[#facc15] shadow-[0_14px_30px_rgba(2,132,199,0.25)] backdrop-blur-md"
      >
        {/* Soft decorative inner rings */}
        <div className="absolute inset-4 rounded-full border-2 border-amber-200/80 pointer-events-none" />
        <div className="absolute inset-12 rounded-full border border-dashed border-amber-300 pointer-events-none" />

        {/* SVG Connecting Trail (Red Candy Line as in image.png) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox={`0 0 ${size} ${size}`}
        >
          {connectedIndices.map((nodeIdx, i) => {
            if (i === connectedIndices.length - 1) return null;
            const p1 = getNodePosition(nodeIdx, wheelLetters.length);
            const p2 = getNodePosition(connectedIndices[i + 1], wheelLetters.length);
            return (
              <line
                key={`line-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#ef4444"
                strokeWidth={12}
                strokeLinecap="round"
              />
            );
          })}

          {isDragging && pointerPos && connectedIndices.length > 0 && (
            <line
              x1={getNodePosition(connectedIndices[connectedIndices.length - 1], wheelLetters.length).x}
              y1={getNodePosition(connectedIndices[connectedIndices.length - 1], wheelLetters.length).y}
              x2={pointerPos.x}
              y2={pointerPos.y}
              stroke="#f87171"
              strokeWidth={10}
              strokeLinecap="round"
              opacity={0.9}
            />
          )}
        </svg>

        {/* Center Action Button: Shuffle */}
        <button
          id="wheel-shuffle-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleShuffle();
          }}
          disabled={disabled}
          title="Shuffle Letters"
          className="relative z-20 w-13 h-13 rounded-full bg-white/90 hover:bg-white active:scale-90 border-2 border-emerald-300 text-emerald-800 shadow-md flex items-center justify-center transition-all cursor-pointer"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Letter Nodes */}
        {wheelLetters.map((char, index) => {
          const isSelected = connectedIndices.includes(index);
          const total = wheelLetters.length;
          const pos = getNodePosition(index, total);

          const leftPercent = (pos.x / size) * 100;
          const topPercent = (pos.y / size) * 100;

          return (
            <div
              key={`wheel-node-${index}-${char}`}
              id={`wheel-node-${char}-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(index);
              }}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: `translate(-50%, -50%) ${isSelected ? "scale(1.2)" : "scale(1)"}`,
                transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }}
              className={`absolute z-20 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full font-black text-2xl select-none cursor-pointer ${
                isSelected
                  ? "text-white font-black"
                  : "text-slate-800 hover:text-red-600"
              }`}
            >
              {isSelected ? (
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-700 border-2 border-white shadow-[0_4px_0_#991b1b,0_6px_12px_rgba(239,68,68,0.4)] animate-pop" />
              ) : (
                <div className="absolute inset-0 rounded-full border-2 border-white bg-gradient-to-b from-white to-[#f8f6f0] shadow-[0_4px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.1)] hover:brightness-105" />
              )}
              <span className="relative z-10 leading-none drop-shadow-sm">{char}</span>
            </div>
          );
        })}
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-3 mt-4">
        <button
          id="wheel-clear-btn"
          type="button"
          onClick={onDeleteChar}
          disabled={disabled || !currentInput}
          title="Backspace"
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 active:scale-95 disabled:opacity-40 text-slate-600 shadow-sm transition-all cursor-pointer"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          id="wheel-submit-btn"
          type="button"
          onClick={() => onWordSubmit()}
          disabled={disabled || !currentInput}
          className="flex items-center gap-1.5 px-7 py-3 rounded-2xl btn-candy-green text-white font-black text-sm uppercase tracking-wider transition-all disabled:opacity-40 active:scale-95 cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>SUBMIT WORD</span>
        </button>

        {onToggleKeyboard && (
          <button
            id="wheel-toggle-keyboard-btn"
            type="button"
            onClick={onToggleKeyboard}
            title="Toggle Keyboard Mode"
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 active:scale-95 text-slate-600 shadow-sm transition-all cursor-pointer"
          >
            <KeyboardIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LetterWheel;

