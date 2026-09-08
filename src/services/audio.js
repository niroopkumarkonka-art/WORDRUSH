// Audio effects disabled per user request
class SoundManager {
  constructor() {
    this.muted = true;
    this.ctx = null;
  }

  init() {}
  toggleMute() {
    return true;
  }
  isMuted() {
    return true;
  }
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

export const soundManager = new SoundManager();

