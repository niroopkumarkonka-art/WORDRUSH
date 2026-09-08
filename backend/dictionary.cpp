// ============================================================================
// WordRush Arena - Backend: Lexical Dictionary & Word Classifier (C++)
// Simple, clean vocabulary repository for Easy (4L), Medium (5L), and Hard (6L)
// Includes linguistic classification (Proper Name, Noun, Verb, Adjective)
// ============================================================================

#include <string>
#include <vector>
#include <set>
#include <random>

#ifdef STANDALONE_DICTIONARY
#include <iostream>
#endif

namespace WordRush {

enum WordCategory {
    CAT_COMMON_NOUN,
    CAT_PROPER_NAME,
    CAT_VERB,
    CAT_ADJECTIVE,
    CAT_GENERAL
};

struct WordEntry {
    std::string word;
    int length;
    WordCategory category;
    std::string definition;
};

class WordDictionary {
private:
    std::set<std::string> validWords;
    std::vector<WordEntry> easyList;   // 4-letter words
    std::vector<WordEntry> mediumList; // 5-letter words
    std::vector<WordEntry> hardList;   // 6-letter words
    std::set<std::string> properNames;
    std::mt19937 rng;

public:
    WordDictionary() {
        rng.seed(1337);
        loadDefaultWords();
    }

    void loadDefaultWords() {
        // Sample of Proper Names for linguistic detection
        std::vector<std::string> names = {
            "SARAH", "DAVID", "JAMES", "EMILY", "PETER", "GRACE", "ALICE", "CHLOE", "HENRY", "FELIX"
        };
        for (const auto& n : names) properNames.insert(n);

        // Curated Easy (4 Letters)
        std::vector<WordEntry> easyWords = {
            {"BIRD", 4, CAT_COMMON_NOUN, "A warm-blooded egg-laying feathered vertebrate"},
            {"BLUE", 4, CAT_ADJECTIVE, "Color of the clear sky and the deep sea"},
            {"BOAT", 4, CAT_COMMON_NOUN, "A vessel used for traveling across water"},
            {"CAMP", 4, CAT_COMMON_NOUN, "An outdoor site for lodging or recreational stays"},
            {"DARK", 4, CAT_ADJECTIVE, "Lacking light or illumination"},
            {"FISH", 4, CAT_COMMON_NOUN, "A limbless cold-blooded aquatic animal"},
            {"GAME", 4, CAT_COMMON_NOUN, "An activity or sport played according to rules"},
            {"GOLD", 4, CAT_COMMON_NOUN, "A precious yellow metallic chemical element"},
            {"HERO", 4, CAT_COMMON_NOUN, "A person admired for courage and noble deeds"},
            {"LION", 4, CAT_COMMON_NOUN, "A large majestic carnivore of the cat family"},
            {"MOON", 4, CAT_COMMON_NOUN, "The natural satellite orbiting the Earth"},
            {"PARK", 4, CAT_COMMON_NOUN, "A public area of kept land with recreation"},
            {"RAIN", 4, CAT_COMMON_NOUN, "Moisture condensed from atmospheric vapor"},
            {"ROSE", 4, CAT_COMMON_NOUN, "A prickly flowering shrub known for its sweet scent"},
            {"STAR", 4, CAT_COMMON_NOUN, "A luminous point in the night sky"},
            {"WOLF", 4, CAT_COMMON_NOUN, "A wild carnivorous mammal of the dog family"}
        };

        // Curated Medium (5 Letters)
        std::vector<WordEntry> mediumWords = {
            {"ARENA", 5, CAT_COMMON_NOUN, "A place for contests, games, and dynamic duels"},
            {"BRAVE", 5, CAT_ADJECTIVE, "Ready to face danger or pain with courage"},
            {"CANDY", 5, CAT_COMMON_NOUN, "A sweet food confection made with sugar"},
            {"CHAIR", 5, CAT_COMMON_NOUN, "A separate seat for one person with a back"},
            {"CLEAN", 5, CAT_ADJECTIVE, "Free from dirt, marks, or unwanted clutter"},
            {"CROWN", 5, CAT_COMMON_NOUN, "A circular ornamental headpiece worn by monarchs"},
            {"DREAM", 5, CAT_COMMON_NOUN, "A series of thoughts and visions during sleep"},
            {"EAGLE", 5, CAT_COMMON_NOUN, "A large bird of prey with keen vision"},
            {"FLAME", 5, CAT_COMMON_NOUN, "A hot glowing body of ignited gas in fire"},
            {"GLOVE", 5, CAT_COMMON_NOUN, "A protective covering worn over the hand"},
            {"HEART", 5, CAT_COMMON_NOUN, "The hollow muscular organ that pumps blood"},
            {"LIGHT", 5, CAT_COMMON_NOUN, "Electromagnetic radiation perceptible to human eyes"},
            {"MUSIC", 5, CAT_COMMON_NOUN, "Vocal or instrumental sounds with harmony and rhythm"},
            {"OCEAN", 5, CAT_COMMON_NOUN, "A vast continuous expanse of open sea"},
            {"PLANT", 5, CAT_COMMON_NOUN, "A living organism absorbing water and photosynthesis"},
            {"RIVER", 5, CAT_COMMON_NOUN, "A large natural stream of water flowing to sea"},
            {"SARAH", 5, CAT_PROPER_NAME, "A proper given name of Hebrew origin meaning noblewoman"},
            {"DAVID", 5, CAT_PROPER_NAME, "A proper given name meaning beloved person"},
            {"JAMES", 5, CAT_PROPER_NAME, "A classic given name derived from Jacob"}
        };

        // Curated Hard (6 Letters)
        std::vector<WordEntry> hardWords = {
            {"ACTION", 6, CAT_COMMON_NOUN, "The fact or process of doing something"},
            {"BEAUTY", 6, CAT_COMMON_NOUN, "A combination of qualities that pleases the senses"},
            {"CASTLE", 6, CAT_COMMON_NOUN, "A large fortified building or royal residence"},
            {"DRAGON", 6, CAT_COMMON_NOUN, "A legendary mythical reptile of folklore"},
            {"ENERGY", 6, CAT_COMMON_NOUN, "The capacity or strength to perform active work"},
            {"FOREST", 6, CAT_COMMON_NOUN, "A large area covered primarily with trees"},
            {"GALAXY", 6, CAT_COMMON_NOUN, "A vast system of millions or billions of stars"},
            {"ISLAND", 6, CAT_COMMON_NOUN, "A piece of land entirely surrounded by water"},
            {"JUNGLE", 6, CAT_COMMON_NOUN, "An area of land overgrown with dense vegetation"},
            {"KNIGHT", 6, CAT_COMMON_NOUN, "A warrior in armor awarded chivalric rank"},
            {"PLANET", 6, CAT_COMMON_NOUN, "A celestial body moving in elliptical orbit"},
            {"SHIELD", 6, CAT_COMMON_NOUN, "A broad protective plate used to parry blows"}
        };

        for (const auto& w : easyWords) {
            easyList.push_back(w);
            validWords.insert(w.word);
        }
        for (const auto& w : mediumWords) {
            mediumList.push_back(w);
            validWords.insert(w.word);
        }
        for (const auto& w : hardWords) {
            hardList.push_back(w);
            validWords.insert(w.word);
        }
    }

    bool isValidWord(const std::string& word) const {
        return validWords.count(word) > 0;
    }

    bool isProperName(const std::string& word) const {
        return properNames.count(word) > 0;
    }

    std::string getRandomWord(int wordLength) {
        if (wordLength == 4 && !easyList.empty()) {
            std::uniform_int_distribution<size_t> dist(0, easyList.size() - 1);
            return easyList[dist(rng)].word;
        } else if (wordLength == 6 && !hardList.empty()) {
            std::uniform_int_distribution<size_t> dist(0, hardList.size() - 1);
            return hardList[dist(rng)].word;
        } else if (!mediumList.empty()) {
            std::uniform_int_distribution<size_t> dist(0, mediumList.size() - 1);
            return mediumList[dist(rng)].word;
        }
        return "ARENA";
    }
};

} // namespace WordRush

#ifdef STANDALONE_DICTIONARY
int main() {
    std::cout << "--- WordRush C++ Dictionary & Classification Test ---" << std::endl;
    WordRush::WordDictionary dict;

    std::cout << "Word 'ARENA' valid: " << (dict.isValidWord("ARENA") ? "YES" : "NO") << std::endl;
    std::cout << "Word 'SARAH' is proper name: " << (dict.isProperName("SARAH") ? "YES" : "NO") << std::endl;
    std::cout << "Random 4L Word: " << dict.getRandomWord(4) << std::endl;
    std::cout << "Random 5L Word: " << dict.getRandomWord(5) << std::endl;
    std::cout << "Random 6L Word: " << dict.getRandomWord(6) << std::endl;
    return 0;
}
#endif
