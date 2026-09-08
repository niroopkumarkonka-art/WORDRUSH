import React, { useState } from "react";
import { Copy, Check, Link as LinkIcon, Share2 } from "lucide-react";

export const RoomCode = ({ roomCode = "" }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyTextSafely = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(el);
      return successful;
    } catch {
      return false;
    }
  };

  const handleCopyCode = async () => {
    const ok = await copyTextSafely(roomCode);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    }
  };

  const handleCopyLink = async () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const inviteUrl = `${origin}${pathname}?room=${roomCode}`;
    const ok = await copyTextSafely(inviteUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    }
  };

  const letters = (roomCode || "").split("");

  return (
    <div
      id="room-code-panel"
      className="w-full max-w-md mx-auto p-5 sm:p-6 rounded-3xl bg-white/95 border-2 border-amber-300 flex flex-col items-center gap-3.5 text-center shadow-lg animate-fadeIn select-none"
    >
      {/* Title & Badge */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-black uppercase tracking-wider text-amber-800">
          YOUR GAME ROOM CODE
        </span>
      </div>

      {/* Playful Chunky 3D Letter Tiles for Room Code */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-1">
        {letters.map((char, idx) => (
          <div
            key={`${char}-${idx}`}
            className="w-11 h-13 sm:w-13 sm:h-15 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl uppercase transition-transform hover:scale-105 bg-amber-400 text-amber-950 border-b-4 border-amber-600 shadow-md animate-pop"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {char}
          </div>
        ))}
      </div>

      {/* Action Buttons: Copy Code & Copy Invite Link */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 w-full mt-1">
        <button
          id="copy-room-code-btn"
          onClick={handleCopyCode}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-candy-green text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>COPY CODE ({roomCode})</span>
            </>
          )}
        </button>

        <button
          id="copy-invite-link-btn"
          onClick={handleCopyLink}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-candy-blue text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>LINK COPIED!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              <span>COPY INVITE LINK</span>
            </>
          )}
        </button>
      </div>

      {/* Waiting Status Footer */}
      <div className="flex items-center gap-2 text-xs text-slate-600 bg-amber-50/70 px-4 py-2 rounded-xl border border-amber-200">
        <Share2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Send this code or link to your friend to join the game!</span>
      </div>
    </div>
  );
};

export default RoomCode;

