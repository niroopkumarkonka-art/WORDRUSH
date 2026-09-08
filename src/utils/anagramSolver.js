// ============================================================================
// WordRush Arena - Anagram Solving & Scramble Engine
// Computes all exact and sub-anagrams from any letter set with points & definitions
// ============================================================================

import { DICTIONARY_ENTRIES } from "./dictionary";

// Find all dictionary anagrams and sub-anagrams from given letters
export function solveAnagramLocally(letters) {
  const clean = (letters || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (clean.length < 3) return { letters: clean, anagrams: [], count: 0 };

  const targetFreq = {};
  for (const c of clean) {
    targetFreq[c] = (targetFreq[c] || 0) + 1;
  }

  const results = [];
  const entries = Object.values(DICTIONARY_ENTRIES);

  for (const entry of entries) {
    const word = entry.word;
    if (word.length < 3 || word.length > clean.length) continue;

    const wFreq = {};
    let isPossible = true;
    for (const c of word) {
      wFreq[c] = (wFreq[c] || 0) + 1;
      if (wFreq[c] > (targetFreq[c] || 0)) {
        isPossible = false;
        break;
      }
    }

    if (isPossible) {
      const isExact = word.length === clean.length;
      const points = isExact ? word.length * 30 : word.length * 15;
      results.push({
        word,
        length: word.length,
        isExact,
        points,
        definition: entry.definition || "Verified English Word",
        category: entry.category || "General",
        clue: entry.clue || "",
      });
    }
  }

  // Sort: Exact matches first, then longer words, then alphabetical
  results.sort((a, b) => {
    if (a.isExact !== b.isExact) return a.isExact ? -1 : 1;
    if (b.length !== a.length) return b.length - a.length;
    return a.word.localeCompare(b.word);
  });

  return {
    letters: clean,
    count: results.length,
    anagrams: results,
  };
}

// Scramble any word into randomized anagram tiles
export function scrambleWord(word) {
  const letters = (word || "").toUpperCase().split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // Ensure not identical to original if length > 1
  if (letters.join("") === word.toUpperCase() && letters.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters.join("");
}
