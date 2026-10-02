#ifndef WORDRUSH_LEXICON_DATA_HPP
#define WORDRUSH_LEXICON_DATA_HPP

// ============================================================================
// WORDRUSH ARENA - Embedded Native C++ Lexical Word Bank & Anagram Repository
// Provides thousands of validated 3, 4, 5, and 6-letter English vocabulary entries
// with semantic categorization, grammatical classification, and definitions
// ============================================================================

#include <string>
#include <vector>
#include <unordered_map>

namespace WordRush {

struct LexiconEntry {
    const char* word;
    int length;
    const char* difficulty;
    const char* category;
    const char* definition;
    const char* clue;
    int points;
};

class LexiconData {
public:
    static const LexiconEntry CORE_DICTIONARY[];
    static const size_t CORE_DICTIONARY_SIZE;

    static const char* const VOCABULARY_LIST_3[];
    static const size_t VOCABULARY_LIST_3_SIZE;

    static const char* const VOCABULARY_LIST_4[];
    static const size_t VOCABULARY_LIST_4_SIZE;

    static const char* const VOCABULARY_LIST_5[];
    static const size_t VOCABULARY_LIST_5_SIZE;

    static const char* const VOCABULARY_LIST_6[];
    static const size_t VOCABULARY_LIST_6_SIZE;

    // Fast lookup
    static const LexiconEntry* findEntry(const std::string& word);
    static std::vector<std::string> getWordsByLength(int length);
    static std::vector<std::string> getWordsByDifficulty(const std::string& difficulty);
};

} // namespace WordRush

#endif // WORDRUSH_LEXICON_DATA_HPP
