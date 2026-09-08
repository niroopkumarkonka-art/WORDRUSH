// ============================================================================
// Sound Manager - Completely Removed / Silenced per user request
// No sound effects, no Web Audio synthesis, no audio playback
// ============================================================================

class NullSoundManager {
  constructor() {
    this.muted = true;
    this.ctx = null;
  }
  init() {}
  toggleMute() { return true; }
  isMuted() { return true; }
  play() {}
  playPop() {}
  playKeyClick() {}
  playTileFlip() {}
  playSuccess() {}
  playError() {}
  playHint() {}
  playShuffle() {}
  playCountdown() {}
  playRoundWon() {}
  playRoundLost() {}
  playGameOver() {}
}

// Universal no-op proxy ensuring any sound effect invocation is completely silent
export const soundManager = new Proxy(new NullSoundManager(), {
  get(target, prop) {
    if (prop in target) return target[prop];
    return () => {};
  },
});

export default soundManager;
