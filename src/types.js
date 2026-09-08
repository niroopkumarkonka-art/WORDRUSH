// ============================================================================
// WORDRUSH ARENA - Game Constants & Helpers (JavaScript)
// ============================================================================

export const GAME_PHASES = {
  LOBBY: "LOBBY",
  READY_CHECK: "READY_CHECK",
  WORD_SELECTION: "WORD_SELECTION",
  GUESSING: "GUESSING",
  ROUND_RESULT: "ROUND_RESULT",
  GAME_OVER: "GAME_OVER",
};

export const LETTER_STATES = {
  EMPTY: "EMPTY",
  TENTATIVE: "TENTATIVE",
  GRAY: "GRAY",
  YELLOW: "YELLOW",
  GREEN: "GREEN",
};

export const MAX_ATTEMPTS = 6;
export const FREE_HINTS = 3;
