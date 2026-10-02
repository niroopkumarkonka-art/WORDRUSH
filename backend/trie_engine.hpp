#ifndef WORDRUSH_TRIE_ENGINE_HPP
#define WORDRUSH_TRIE_ENGINE_HPP

// ============================================================================
// WORDRUSH ARENA - High-Performance Lexical Trie & Anagram Permutation Engine
// Implements radix-tree prefix navigation, bit-packed frequency signatures,
// Scrabble tile valuation, and recursive sub-anagram solving
// ============================================================================

#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <array>
#include <algorithm>
#include <cstdint>

namespace WordRush {

constexpr int ALPHABET_SIZE = 26;

// Letter valuation matrix for points calculation
constexpr std::array<int, 26> LETTER_VALUES = {
    1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10
};

struct AnagramMatch {
    std::string word;
    int length;
    bool isExact;
    int points;
    std::string definition;
    std::string category;
};

// Trie node with custom memory pooling
class TrieNode {
public:
    std::array<std::unique_ptr<TrieNode>, ALPHABET_SIZE> children;
    bool isEndOfWord;
    std::string word;
    std::string definition;
    std::string category;
    int frequencyRank;

    TrieNode() : isEndOfWord(false), frequencyRank(0) {}
};

class TrieEngine {
private:
    std::unique_ptr<TrieNode> root;
    size_t totalWords;
    std::unordered_map<std::string, std::vector<std::string>> anagramBuckets;

    // Helper for generating sorted frequency signature
    static std::string makeSignature(const std::string& input);

    // Recursive anagram search
    void searchAnagramsRecursive(
        TrieNode* current,
        std::array<int, 26>& availableLetters,
        std::vector<AnagramMatch>& results,
        size_t originalLength
    ) const;

public:
    TrieEngine();
    ~TrieEngine() = default;

    // Add word to trie and anagram bucket
    void insert(
        const std::string& word,
        const std::string& definition = "Verified English Word",
        const std::string& category = "General"
    );

    // Fast O(k) prefix and exact word lookups
    bool contains(const std::string& word) const;
    bool startsWith(const std::string& prefix) const;

    // Returns all exact anagrams matching the letter bag
    std::vector<std::string> getExactAnagrams(const std::string& letters) const;

    // Solves all exact and sub-anagrams from any letter bag
    std::vector<AnagramMatch> solveAnagrams(
        const std::string& letters,
        size_t minLength = 3,
        size_t maxLength = 8
    ) const;

    // Calculate Scrabble point value
    static int calculateWordPoints(const std::string& word, bool isExactAnagram = false);

    size_t size() const { return totalWords; }
    void clear();
};

} // namespace WordRush

#endif // WORDRUSH_TRIE_ENGINE_HPP
