// ============================================================================
// WORDRUSH ARENA - High-Performance Lexical Trie & Anagram Permutation Implementation
// ============================================================================

#include "trie_engine.hpp"
#include <cctype>

namespace WordRush {

TrieEngine::TrieEngine() : root(std::make_unique<TrieNode>()), totalWords(0) {}

std::string TrieEngine::makeSignature(const std::string& input) {
    std::string clean = "";
    for (char c : input) {
        if (std::isalpha(static_cast<unsigned char>(c))) {
            clean += static_cast<char>(std::toupper(c));
        }
    }
    std::sort(clean.begin(), clean.end());
    return clean;
}

void TrieEngine::insert(const std::string& rawWord, const std::string& definition, const std::string& category) {
    if (rawWord.empty()) return;

    std::string cleanWord = "";
    for (char c : rawWord) {
        if (std::isalpha(static_cast<unsigned char>(c))) {
            cleanWord += static_cast<char>(std::toupper(c));
        }
    }
    if (cleanWord.empty()) return;

    TrieNode* current = root.get();
    for (char c : cleanWord) {
        int index = c - 'A';
        if (index < 0 || index >= ALPHABET_SIZE) return;
        if (!current->children[index]) {
            current->children[index] = std::make_unique<TrieNode>();
        }
        current = current->children[index].get();
    }

    if (!current->isEndOfWord) {
        current->isEndOfWord = true;
        current->word = cleanWord;
        current->definition = definition;
        current->category = category;
        totalWords++;

        std::string sig = makeSignature(cleanWord);
        anagramBuckets[sig].push_back(cleanWord);
    }
}

bool TrieEngine::contains(const std::string& rawWord) const {
    if (rawWord.empty()) return false;
    const TrieNode* current = root.get();
    for (char c : rawWord) {
        if (!std::isalpha(static_cast<unsigned char>(c))) return false;
        int index = std::toupper(c) - 'A';
        if (index < 0 || index >= ALPHABET_SIZE || !current->children[index]) {
            return false;
        }
        current = current->children[index].get();
    }
    return current && current->isEndOfWord;
}

bool TrieEngine::startsWith(const std::string& prefix) const {
    if (prefix.empty()) return true;
    const TrieNode* current = root.get();
    for (char c : prefix) {
        if (!std::isalpha(static_cast<unsigned char>(c))) return false;
        int index = std::toupper(c) - 'A';
        if (index < 0 || index >= ALPHABET_SIZE || !current->children[index]) {
            return false;
        }
        current = current->children[index].get();
    }
    return current != nullptr;
}

std::vector<std::string> TrieEngine::getExactAnagrams(const std::string& letters) const {
    std::string sig = makeSignature(letters);
    auto it = anagramBuckets.find(sig);
    if (it != anagramBuckets.end()) {
        return it->second;
    }
    return {};
}

void TrieEngine::searchAnagramsRecursive(
    TrieNode* current,
    std::array<int, 26>& availableLetters,
    std::vector<AnagramMatch>& results,
    size_t originalLength
) const {
    if (!current) return;

    if (current->isEndOfWord && current->word.length() >= 3) {
        bool isExact = (current->word.length() == originalLength);
        int points = calculateWordPoints(current->word, isExact);
        results.push_back({
            current->word,
            static_cast<int>(current->word.length()),
            isExact,
            points,
            current->definition,
            current->category
        });
    }

    for (int i = 0; i < ALPHABET_SIZE; ++i) {
        if (availableLetters[i] > 0 && current->children[i]) {
            availableLetters[i]--;
            searchAnagramsRecursive(
                current->children[i].get(),
                availableLetters,
                results,
                originalLength
            );
            availableLetters[i]++;
        }
    }
}

std::vector<AnagramMatch> TrieEngine::solveAnagrams(
    const std::string& letters,
    size_t minLength,
    size_t maxLength
) const {
    std::array<int, 26> freq{};
    size_t cleanLength = 0;
    for (char c : letters) {
        if (std::isalpha(static_cast<unsigned char>(c))) {
            freq[std::toupper(c) - 'A']++;
            cleanLength++;
        }
    }

    std::vector<AnagramMatch> matches;
    searchAnagramsRecursive(root.get(), freq, matches, cleanLength);

    // Filter by length bounds
    std::vector<AnagramMatch> filtered;
    filtered.reserve(matches.size());
    for (const auto& m : matches) {
        if (m.length >= static_cast<int>(minLength) && m.length <= static_cast<int>(maxLength)) {
            filtered.push_back(m);
        }
    }

    // Sort: Exact anagrams first, then by points/length descending, then alphabetical
    std::sort(filtered.begin(), filtered.end(), [](const AnagramMatch& a, const AnagramMatch& b) {
        if (a.isExact != b.isExact) return a.isExact > b.isExact;
        if (a.length != b.length) return a.length > b.length;
        if (a.points != b.points) return a.points > b.points;
        return a.word < b.word;
    });

    return filtered;
}

int TrieEngine::calculateWordPoints(const std::string& word, bool isExactAnagram) {
    int baseScore = 0;
    for (char c : word) {
        if (std::isalpha(static_cast<unsigned char>(c))) {
            baseScore += LETTER_VALUES[std::toupper(c) - 'A'];
        }
    }
    int multiplier = isExactAnagram ? 30 : 15;
    return baseScore * 5 + static_cast<int>(word.length()) * multiplier;
}

void TrieEngine::clear() {
    root = std::make_unique<TrieNode>();
    anagramBuckets.clear();
    totalWords = 0;
}

} // namespace WordRush
