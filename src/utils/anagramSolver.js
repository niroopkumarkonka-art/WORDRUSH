// ============================================================================
// WordRush Arena - Anagram Solving & Scramble Engine
// Computes all exact and sub-anagrams from any letter set with points & definitions
// ============================================================================

import { DICTIONARY_ENTRIES } from "./dictionary";
import { COMMON_VOCABULARY, VOCABULARY_SET, canFormFromLetters } from "./comprehensiveWords";

// Find all dictionary anagrams and sub-anagrams from given letters
export function solveAnagramLocally(letters) {
  const clean = (letters || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (clean.length < 3) return { letters: clean, anagrams: [], count: 0 };

  const targetFreq = {};
  for (const c of clean) {
    targetFreq[c] = (targetFreq[c] || 0) + 1;
  }

  const results = [];
  const seenWords = new Set();

  // 1. Process curated DICTIONARY_ENTRIES
  const entries = Object.values(DICTIONARY_ENTRIES);
  for (const entry of entries) {
    const word = entry.word.toUpperCase();
    if (word.length < 3 || word.length > clean.length || seenWords.has(word)) continue;

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
      seenWords.add(word);
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

  // 2. Process expanded COMMON_VOCABULARY (includes words like TIED, DIET, EDIT, etc.)
  for (const rawWord of COMMON_VOCABULARY) {
    const word = rawWord.toUpperCase();
    if (word.length < 3 || word.length > clean.length || seenWords.has(word)) continue;

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
      seenWords.add(word);
      const isExact = word.length === clean.length;
      const points = isExact ? word.length * 30 : word.length * 15;
      results.push({
        word,
        length: word.length,
        isExact,
        points,
        definition: "Verified Lexical English Word",
        category: "Standard English",
        clue: "",
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

/**
 * Validates if candidate word is a meaningful recognized anagram of given letters
 */
export function isValidAnagram(candidate, sourceLetters) {
  if (!candidate || !sourceLetters) return false;
  const cleanCand = candidate.trim().toUpperCase();
  const cleanSrc = sourceLetters.trim().toUpperCase();
  if (cleanCand.length < 3 || cleanCand.length > cleanSrc.length) return false;

  if (!canFormFromLetters(cleanCand, cleanSrc)) return false;
  return VOCABULARY_SET.has(cleanCand) || Boolean(DICTIONARY_ENTRIES[cleanCand]);
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
