import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  X,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { DICTIONARY_ENTRIES, lookupWord } from "../utils/dictionary";
import { classifyWord } from "../utils/wordClassifier";

export const DictionaryHelperModal = ({
  isOpen = false,
  onClose,
  targetLength = 5,
  onSelectWord,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("ALL");

  const matchingWords = useMemo(() => {
    const list = Object.values(DICTIONARY_ENTRIES).filter(
      (entry) => entry.word.length === targetLength
    );

    return list.filter((item) => {
      const matchSearch =
        !searchTerm ||
        item.word.includes(searchTerm.toUpperCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clue.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDiff =
        filterDifficulty === "ALL" || item.difficulty === filterDifficulty;

      return matchSearch && matchDiff;
    });
  }, [targetLength, searchTerm, filterDifficulty]);

  // Live lookup of typed term
  const liveLookup = useMemo(() => {
    if (!searchTerm) return null;
    const clean = searchTerm.trim().toUpperCase();
    const entry = lookupWord(clean);
    const classification = classifyWord(clean);
    return { entry, classification };
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      id="dictionary-helper-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-white border-4 border-teal-300 p-5 sm:p-6 shadow-2xl text-slate-800 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-teal-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-teal-500 text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                Official Dictionary Helper
              </h3>
              <p className="text-xs text-slate-500">
                Browse verified {targetLength}-letter words with definitions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${targetLength}-letter words or definitions...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-teal-50/60 border-2 border-teal-200 text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Live Lookup Result (if user searched something) */}
        {liveLookup && liveLookup.classification && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Word Analysis:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-black border flex items-center gap-1 ${liveLookup.classification.badgeColor}`}
                >
                  <span>{liveLookup.classification.icon}</span>
                  <span>{liveLookup.classification.label}</span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {searchTerm.length} letters
              </span>
            </div>

            {liveLookup.classification.note && (
              <p className="text-[11px] text-purple-950 font-medium">
                {liveLookup.classification.note}
              </p>
            )}

            {liveLookup.entry && (
              <p className="text-[11px] text-slate-700 italic mt-0.5">
                "{liveLookup.entry.definition}"
              </p>
            )}
          </div>
        )}

        {/* Word Grid Results */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-bold">
            <span>Verified Vocabulary ({matchingWords.length} available)</span>
            <span className="text-[11px] text-teal-700">Click word to use</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {matchingWords.slice(0, 30).map((item) => (
              <div
                key={item.word}
                onClick={() => {
                  if (onSelectWord) {
                    onSelectWord(item.word);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl border border-teal-100 hover:border-teal-400 bg-teal-50/40 hover:bg-teal-100/60 cursor-pointer transition-all flex flex-col gap-0.5 text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900 tracking-wider group-hover:text-teal-900">
                    {item.word}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-teal-200">
                    {item.category}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 line-clamp-1 italic">
                  {item.clue}
                </span>
              </div>
            ))}
          </div>

          {matchingWords.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-1">
              <AlertCircle className="w-5 h-5 text-slate-300" />
              <span>No dictionary words matched "{searchTerm}".</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Official word lists adhere to Scrabble & Wordle cipher rules.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DictionaryHelperModal;
