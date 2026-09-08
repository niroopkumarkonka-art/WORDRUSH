// ============================================================================
// WordRush Arena - Native C++ Logic Backend Engine
// High-Performance Native Logic Driver for Validation, Deduction, Hints & AI
// ============================================================================

#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <map>
#include <stack>
#include <algorithm>
#include <cctype>
#include <random>
#include <sstream>

namespace WordRush {

// Tile states
enum TileState {
    STATE_GRAY = 0,    // Absent
    STATE_YELLOW = 1,  // Present
    STATE_GREEN = 2,   // Correct position
    STATE_CYAN = 3     // 1st letter match highlight
};

// Tactical Hint structure with 1.5s pop-up duration
struct Hint {
    int level;
    std::string title;
    std::string clueText;
    int durationMs;
};

// Word Dictionary
class Dictionary {
private:
    std::set<std::string> words;
    std::vector<std::string> words4;
    std::vector<std::string> words5;
    std::vector<std::string> words6;
    std::mt19937 rng;

public:
    Dictionary() {
        rng.seed(std::random_device{}());
        loadWords();
    }

    void loadWords() {
        // Curated Easy (4 Letters)
        std::vector<std::string> list4 = {
            "ARCH", "BARK", "BIRD", "BLUE", "BOAT", "BOLD", "BOND", "CAMP", "CARE", "CAST",
            "CLAY", "COLD", "DARK", "DAWN", "DESK", "DUST", "ECHO", "FACE", "FARM", "FAST",
            "FISH", "FLAG", "FLOW", "FROG", "GAME", "GLOW", "GOLD", "GRID", "HAWK", "HERO",
            "HOPE", "IRON", "JUMP", "KING", "LAKE", "LION", "MOON", "NEST", "PARK", "RAIN",
            "ROCK", "ROSE", "SAIL", "SAND", "STAR", "TIDE", "WIND", "WOLF", "YARD", "ZEAL"
        };

        // Curated Medium (5 Letters)
        std::vector<std::string> list5 = {
            "ABOUT", "ABOVE", "ACUTE", "ADAPT", "AFTER", "AGILE", "ALBUM", "ALERT", "ALIGN", "ALONE",
            "ALTER", "AMBER", "ANGEL", "ANGER", "ANGLE", "ANVIL", "APART", "ARENA", "ARMOR", "ARROW",
            "ASCOT", "ASIDE", "ATLAS", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "BADGE", "BAKER",
            "BASIC", "BASIN", "BATCH", "BEACH", "BEAST", "BEGIN", "BEING", "BLACK", "BLADE", "BLAME",
            "BLANK", "BLAST", "BLAZE", "BLEND", "BLINK", "BLOCK", "BLOOM", "BOARD", "BOAST", "BONUS",
            "BOOST", "BOUND", "BRAIN", "BRAKE", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BRICK",
            "BRIDE", "BRIEF", "BRING", "BRISK", "BROAD", "BROWN", "BRUSH", "BUILD", "BUNCH", "BURST",
            "CABIN", "CABLE", "CAMEL", "CANDY", "CANOE", "CARGO", "CAUSE", "CHAIN", "CHAIR", "CHALK",
            "CHAMP", "CHARM", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD", "CHIME",
            "CHOIR", "CHUNK", "CIVIL", "CLAIM", "CLANG", "CLASH", "CLEAN", "CLEAR", "CLERK", "CLICK",
            "CLIFF", "CLIMB", "CLOAK", "CLOCK", "CLOSE", "CLOTH", "CLOUD", "CLOVE", "COACH", "COAST",
            "CORAL", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRANE", "CRANK", "CRASH", "CRATE",
            "CRAWL", "CRAZY", "CREAM", "CREST", "CRISP", "CROSS", "CROWD", "CROWN", "CRUSH", "CRUST",
            "DANCE", "DELTA", "DENSE", "DEPOT", "DEPTH", "DIARY", "DIGIT", "DINER", "DISCO", "DITCH",
            "DIVER", "DRAFT", "DRAIN", "DRAKE", "DRAMA", "DRANK", "DREAM", "DRIFT", "DRILL", "DRINK",
            "DRIVE", "DRONE", "DROWN", "DRUID", "DRUMS", "DUCHY", "DUMMY", "DUNES", "EAGER", "EAGLE",
            "EARLY", "EARTH", "EMBER", "EMPTY", "ENTRY", "EQUAL", "EQUIP", "ETHIC", "EVOKE", "EXACT",
            "EXCEL", "EXERT", "EXTRA", "FABLE", "FACET", "FAINT", "FAITH", "FALSE", "FANCY", "FATAL",
            "FAULT", "FEAST", "FIBER", "FIELD", "FIERY", "FIFTH", "FINAL", "FINCH", "FLAIR", "FLAME",
            "FLANK", "FLARE", "FLASH", "FLASK", "FLEET", "FLESH", "FLINT", "FLOAT", "FLOCK", "FLOOR",
            "FLORA", "FLOUR", "FLUID", "FLUTE", "FOCAL", "FOCUS", "FORGE", "FORTH", "FOSSIL", "FOUND",
            "FRAME", "FRANK", "FRESH", "FROST", "FROWN", "FRUIT", "FUDGE", "GIANT", "GLADE", "GLAND",
            "GLARE", "GLASS", "GLEAM", "GLIDE", "GLINT", "GLOBE", "GLOOM", "GLORY", "GLOVE", "GRACE",
            "GRADE", "GRAIN", "GRAND", "GRANT", "GRAPE", "GRAPH", "GRASP", "GRASS", "GRAVE", "GRAVY",
            "GREAT", "GRIEF", "GRILL", "GRIND", "GROVE", "GUARD", "GUEST", "GUIDE", "GUILD", "HABIT",
            "HARSH", "HAVEN", "HAZEL", "HEART", "HEAVY", "HEDGE", "HONEY", "HONOR", "HORSE", "HOTEL",
            "HOUND", "HOUSE", "HUMAN", "IMAGE", "INDEX", "INLET", "IVORY", "JEWEL", "JUICE", "KNIFE",
            "KNIGHT", "LEMON", "LIGHT", "LODGE", "LUNCH", "MAGIC", "MANOR", "MAPLE", "MARCH", "MEDAL",
            "MELON", "METAL", "MODEL", "MONEY", "MOTIF", "MOUNT", "MUSIC", "NIGHT", "NOBLE", "NORTH",
            "NOVEL", "NURSE", "OCEAN", "OLIVE", "ONION", "ORBIT", "ORGAN", "PANEL", "PANIC", "PAPER",
            "PATCH", "PEACH", "PEARL", "PETAL", "PHASE", "PIANO", "PILOT", "PIXEL", "PIZZA", "PLACE",
            "PLAIN", "PLANE", "PLANT", "PLATE", "PLAZA", "PLUMB", "PLUSH", "POINT", "POLAR", "POUND",
            "POWER", "PRICE", "PRIDE", "PRIME", "PRIZE", "PULSE", "PUPIL", "QUEEN", "QUEST", "QUICK",
            "QUIET", "QUOTA", "RADAR", "RADIO", "RANCH", "RANGE", "RAPID", "RATIO", "REACH", "REACT",
            "REALM", "REBEL", "REIGN", "RELAY", "RESET", "RIDGE", "RIVER", "ROBOT", "ROCKY", "ROUND",
            "ROYAL", "RULER", "RUMOR", "RURAL", "SALAD", "SAUCE", "SCALE", "SCENE", "SCENT", "SCOPE",
            "SCOUT", "SEDAN", "SHADE", "SHAKE", "SHARD", "SHARE", "SHARK", "SHARP", "SHEEP", "SHEET",
            "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHORE", "SHORT", "SHOUT", "SIGHT",
            "SIGMA", "SILVER", "SIREN", "SKILL", "SKULL", "SLATE", "SLEEP", "SLIDE", "SMART", "SMILE",
            "SMOKE", "SOLAR", "SONAR", "SOUND", "SOUTH", "SPACE", "SPARK", "SPAWN", "SPEAR", "SPEED",
            "SPELL", "SPICE", "SPIKE", "SPINE", "SPOKE", "SPOON", "SPORT", "SPRAY", "SPRING", "SQUAD",
            "STAGE", "STAIR", "STAKE", "STAND", "START", "STEAM", "STEEL", "STEEP", "STERN", "STICK",
            "STILL", "STOCK", "STONE", "STORM", "STORY", "STRAW", "STUDY", "STYLE", "SUGAR", "SUITE",
            "SUNNY", "SUPER", "SURGE", "SWIFT", "SWORD", "TABLE", "TASTE", "TEACH", "TEMPO", "TIGER",
            "TIMBER", "TITAN", "TITLE", "TOAST", "TOKEN", "TOPIC", "TORCH", "TOTAL", "TOWER", "TRACK",
            "TRAIL", "TRAIN", "TRAIT", "TREND", "TRIAL", "TRIBE", "TRICK", "TROOP", "TRUCK", "TRULY",
            "TRUMP", "TRUNK", "TRUST", "TRUTH", "TULIP", "TUNER", "ULTRA", "UNCLE", "UNION", "UNITY",
            "URBAN", "USAGE", "VALOR", "VALUE", "VALVE", "VAPOR", "VAULT", "VENUE", "VIGOR", "VINYL",
            "VIPER", "VIRAL", "VIRUS", "VISIT", "VISOR", "VISTA", "VITAL", "VIVID", "VOCAL", "VOICE",
            "VORTEX", "WAGON", "WATER", "WHALE", "WHEAT", "WHEEL", "WHERE", "WHITE", "WHOLE", "WIDOW",
            "WIDTH", "WINDY", "WITCH", "WORLD", "WORTH", "WOUND", "WRIST", "YACHT", "YIELD", "YOUTH",
            "ZEBRA", "ZENITH"
        };

        // Curated Hard (6 Letters)
        std::vector<std::string> list6 = {
            "ACTION", "BEACON", "BEAUTY", "BRIDGE", "CASTLE", "CHANCE", "CIPHER", "CRADLE",
            "DANGER", "DRAGON", "EMPIRE", "FALCON", "FLIGHT", "FOREST", "FROZEN", "GALAXY",
            "GARDEN", "HEROIC", "ISLAND", "JUNGLE", "KNIGHT", "LEGEND", "METEOR", "MIRROR",
            "NATURE", "ORANGE", "PALACE", "PIRATE", "PLANET", "PORTAL", "PRINCE", "PUZZLE",
            "QUARTZ", "ROCKET", "SECRET", "SHADOW", "SHIELD", "SILVER", "SPRING", "SUNSET",
            "TARGET", "TEMPLE", "THRONE", "TRAVEL", "VECTOR", "VICTOR", "VOYAGE", "WIZARD",
            "WONDER"
        };

        for (const auto& w : list4) { words.insert(w); words4.push_back(w); }
        for (const auto& w : list5) { words.insert(w); words5.push_back(w); }
        for (const auto& w : list6) { words.insert(w); words6.push_back(w); }
    }

    bool contains(const std::string& word) const {
        return words.count(word) > 0;
    }

    void addWord(const std::string& word) {
        if (words.count(word) > 0) return;
        words.insert(word);
        if (word.length() == 4) words4.push_back(word);
        else if (word.length() == 5) words5.push_back(word);
        else if (word.length() == 6) words6.push_back(word);
    }

    std::string getRandomWord(int len) {
        if (len == 4 && !words4.empty()) {
            std::uniform_int_distribution<size_t> dist(0, words4.size() - 1);
            return words4[dist(rng)];
        }
        if (len == 6 && !words6.empty()) {
            std::uniform_int_distribution<size_t> dist(0, words6.size() - 1);
            return words6[dist(rng)];
        }
        if (!words5.empty()) {
            std::uniform_int_distribution<size_t> dist(0, words5.size() - 1);
            return words5[dist(rng)];
        }
        return "ARENA";
    }

    const std::vector<std::string>& getList(int len) const {
        if (len == 4) return words4;
        if (len == 6) return words6;
        return words5;
    }
};

static Dictionary globalDict;

// String helper
std::string toUpper(const std::string& s) {
    std::string res = s;
    std::transform(res.begin(), res.end(), res.begin(), [](unsigned char c) {
        return std::toupper(c);
    });
    return res;
}

bool hasDuplicateLetters(const std::string& word) {
    std::set<char> seen;
    for (char c : word) {
        char u = std::toupper(static_cast<unsigned char>(c));
        if (seen.count(u) > 0) return true;
        seen.insert(u);
    }
    return false;
}

// JSON Escaper
std::string escapeJson(const std::string& s) {
    std::ostringstream o;
    for (char c : s) {
        if (c == '"') o << "\\\"";
        else if (c == '\\') o << "\\\\";
        else if (c == '\b') o << "\\b";
        else if (c == '\f') o << "\\f";
        else if (c == '\n') o << "\\n";
        else if (c == '\r') o << "\\r";
        else if (c == '\t') o << "\\t";
        else o << c;
    }
    return o.str();
}

// Word Evaluation logic (Wordle Two-Pass + Cyan 1st letter match)
struct EvalResult {
    bool isCorrect;
    bool firstCharMatch;
    std::vector<int> states; // 0=GRAY, 1=YELLOW, 2=GREEN
};

EvalResult evaluate(const std::string& rawGuess, const std::string& rawSecret) {
    std::string guess = toUpper(rawGuess);
    std::string secret = toUpper(rawSecret);
    int len = static_cast<int>(guess.length());

    EvalResult res;
    res.isCorrect = (guess == secret);
    res.firstCharMatch = (!guess.empty() && !secret.empty() && guess[0] == secret[0]);
    res.states.assign(len, STATE_GRAY);

    std::map<char, int> freq;
    for (char c : secret) freq[c]++;

    // Pass 1: Green matches
    for (int i = 0; i < len; ++i) {
        if (i < static_cast<int>(secret.length()) && guess[i] == secret[i]) {
            res.states[i] = STATE_GREEN;
            freq[guess[i]]--;
        }
    }

    // Pass 2: Yellow matches
    for (int i = 0; i < len; ++i) {
        if (res.states[i] == STATE_GREEN) continue;
        char c = guess[i];
        if (freq[c] > 0) {
            res.states[i] = STATE_YELLOW;
            freq[c]--;
        } else {
            res.states[i] = STATE_GRAY;
        }
    }

    return res;
}

// Hint Generator using Stack ADT (LIFO)
std::vector<Hint> generateHints(const std::string& rawSecret, int diffLevel) {
    std::string secret = toUpper(rawSecret);
    int maxHints = 2;
    if (diffLevel == 1) maxHints = 3;      // Easy: 3 hints
    else if (diffLevel == 3) maxHints = 1; // Hard: 1 hint

    std::stack<Hint> stack;
    int len = static_cast<int>(secret.length());
    char firstChar = secret.empty() ? 'A' : secret[0];
    char lastChar = secret.empty() ? 'Z' : secret[len - 1];

    // Find vowels
    std::string vowels = "";
    for (char c : secret) {
        if (c == 'A' || c == 'E' || c == 'I' || c == 'O' || c == 'U') {
            if (vowels.find(c) == std::string::npos) {
                if (!vowels.empty()) vowels += ", ";
                vowels += c;
            }
        }
    }
    if (vowels.empty()) vowels = "None";

    // Hint 3: Vowels (pushed first, popped last in LIFO)
    if (maxHints >= 3) {
        Hint h;
        h.level = 3;
        h.title = "Tactical Clue: Vowels";
        h.clueText = "Contains vowels: " + vowels;
        h.durationMs = 1500;
        stack.push(h);
    }

    // Hint 2: Pattern (ends with lastChar)
    if (maxHints >= 2) {
        Hint h;
        h.level = 2;
        h.title = "Tactical Clue: Pattern";
        std::string pat = "";
        pat += firstChar;
        for (int i = 1; i < len - 1; ++i) pat += " _";
        pat += " ";
        pat += lastChar;
        h.clueText = "Ends with '" + std::string(1, lastChar) + "' (Pattern: " + pat + ")";
        h.durationMs = 1500;
        stack.push(h);
    }

    // Hint 1: First letter (pushed last, popped FIRST in LIFO)
    if (maxHints >= 1) {
        Hint h;
        h.level = 1;
        h.title = "Tactical Clue: First Letter";
        h.clueText = "Starts with '" + std::string(1, firstChar) + "' and has " + std::to_string(len) + " letters.";
        h.durationMs = 1500;
        stack.push(h);
    }

    std::vector<Hint> result;
    while (!stack.empty()) {
        result.push_back(stack.top());
        stack.pop();
    }
    return result;
}

// AI Decision Engine with progressive tactical deduction & candidate pruning
std::string makeAiDecision(int wordLength, const std::string& rawSecretWord, int attemptsUsed, const std::string& pastGuessesStr) {
    std::string secretWord = toUpper(rawSecretWord);
    std::vector<std::string> pastGuesses;
    std::stringstream ss(pastGuessesStr);
    std::string item;
    while (std::getline(ss, item, ',')) {
        if (!item.empty()) pastGuesses.push_back(toUpper(item));
    }

    // Should AI request hint?
    // Tactical rule: If attempts >= 2 and < 5, recommend requesting a hint automatically
    bool shouldRequestHint = (attemptsUsed >= 2 && attemptsUsed < 5);

    const auto& allCandidates = globalDict.getList(wordLength);
    std::vector<std::string> validCandidates;

    // Perform progressive candidate elimination using feedback from past guesses
    for (const auto& cand : allCandidates) {
        if (std::find(pastGuesses.begin(), pastGuesses.end(), cand) != pastGuesses.end()) {
            continue; // Already guessed
        }
        if (hasDuplicateLetters(cand)) {
            continue; // Secret ciphers must have unique letters
        }

        // If secret is known (CyberBot refereeing), verify consistency with all previous evaluations
        bool consistent = true;
        if (!secretWord.empty()) {
            for (const auto& pastGuess : pastGuesses) {
                EvalResult pastEval = evaluate(pastGuess, secretWord);
                EvalResult candEval = evaluate(pastGuess, cand);
                if (pastEval.states != candEval.states) {
                    consistent = false;
                    break;
                }
            }
        }
        if (consistent) {
            validCandidates.push_back(cand);
        }
    }

    // Fallback if candidate list is empty
    if (validCandidates.empty()) {
        for (const auto& cand : allCandidates) {
            if (std::find(pastGuesses.begin(), pastGuesses.end(), cand) == pastGuesses.end()) {
                validCandidates.push_back(cand);
            }
        }
    }

    std::string chosenGuess = "";
    std::string reason = "";

    // Automated deduction: If attempts >= 3 or candidates narrowed to <= 2, solve the word!
    if ((attemptsUsed >= 3 || validCandidates.size() <= 2) && !secretWord.empty()) {
        chosenGuess = secretWord;
        reason = "Tactical deduction achieved target cipher (Candidate pool pruned to " +
                 std::to_string(std::max<size_t>(1, validCandidates.size())) + ")";
    } else if (!validCandidates.empty()) {
        chosenGuess = validCandidates[0];
        reason = "Optimal candidate chosen from " + std::to_string(validCandidates.size()) +
                 " consistent candidates";
    } else {
        chosenGuess = !secretWord.empty() ? secretWord : "ARENA";
        reason = "Frequency-based fallback";
    }

    std::ostringstream json;
    json << "{"
         << "\"action\":\"GUESS\","
         << "\"guess\":\"" << escapeJson(chosenGuess) << "\","
         << "\"shouldRequestHint\":" << (shouldRequestHint ? "true" : "false") << ","
         << "\"candidatesRemaining\":" << validCandidates.size() << ","
         << "\"attemptsUsed\":" << attemptsUsed << ","
         << "\"reason\":\"" << escapeJson(reason) << "\""
         << "}";
    return json.str();
}

} // namespace WordRush

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cout << "{\"error\":\"Usage: engine <command> [args...]\"}\n";
        return 1;
    }

    std::string cmd = argv[1];

    if (cmd == "validate") {
        std::string word = argc > 2 ? WordRush::toUpper(argv[2]) : "";
        int expectedLen = argc > 3 ? std::stoi(argv[3]) : static_cast<int>(word.length());

        bool isAlpha = true;
        for (char c : word) {
            if (!std::isalpha(static_cast<unsigned char>(c))) {
                isAlpha = false;
                break;
            }
        }

        bool lenMatch = (static_cast<int>(word.length()) == expectedLen);
        bool hasDupes = WordRush::hasDuplicateLetters(word);
        bool inDict = WordRush::globalDict.contains(word);
        bool valid = isAlpha && lenMatch && !hasDupes;

        std::cout << "{"
                  << "\"success\":true,"
                  << "\"valid\":" << (valid ? "true" : "false") << ","
                  << "\"word\":\"" << WordRush::escapeJson(word) << "\","
                  << "\"length\":" << word.length() << ","
                  << "\"expectedLength\":" << expectedLen << ","
                  << "\"isAlpha\":" << (isAlpha ? "true" : "false") << ","
                  << "\"hasDuplicates\":" << (hasDupes ? "true" : "false") << ","
                  << "\"inDictionary\":" << (inDict ? "true" : "false")
                  << "}\n";
        return 0;
    }

    if (cmd == "evaluate") {
        std::string guess = argc > 2 ? argv[2] : "";
        std::string secret = argc > 3 ? argv[3] : "";
        WordRush::EvalResult ev = WordRush::evaluate(guess, secret);

        std::cout << "{"
                  << "\"success\":true,"
                  << "\"guess\":\"" << WordRush::escapeJson(WordRush::toUpper(guess)) << "\","
                  << "\"secret\":\"" << WordRush::escapeJson(WordRush::toUpper(secret)) << "\","
                  << "\"isCorrect\":" << (ev.isCorrect ? "true" : "false") << ","
                  << "\"firstCharMatch\":" << (ev.firstCharMatch ? "true" : "false") << ","
                  << "\"states\":[";
        for (size_t i = 0; i < ev.states.size(); ++i) {
            std::cout << ev.states[i] << (i + 1 < ev.states.size() ? "," : "");
        }
        std::cout << "]}\n";
        return 0;
    }

    if (cmd == "hints") {
        std::string secret = argc > 2 ? argv[2] : "";
        int diff = argc > 3 ? std::stoi(argv[3]) : 2;
        std::vector<WordRush::Hint> hints = WordRush::generateHints(secret, diff);

        std::cout << "{\"success\":true,\"hints\":[";
        for (size_t i = 0; i < hints.size(); ++i) {
            std::cout << "{"
                      << "\"level\":" << hints[i].level << ","
                      << "\"title\":\"" << WordRush::escapeJson(hints[i].title) << "\","
                      << "\"text\":\"" << WordRush::escapeJson(hints[i].clueText) << "\","
                      << "\"durationMs\":" << hints[i].durationMs
                      << "}" << (i + 1 < hints.size() ? "," : "");
        }
        std::cout << "]}\n";
        return 0;
    }

    if (cmd == "random") {
        int len = argc > 2 ? std::stoi(argv[2]) : 5;
        std::string word = WordRush::globalDict.getRandomWord(len);
        std::cout << "{\"success\":true,\"word\":\"" << word << "\",\"length\":" << len << "}\n";
        return 0;
    }

    if (cmd == "ai_decision") {
        int len = argc > 2 ? std::stoi(argv[2]) : 5;
        std::string secret = argc > 3 ? argv[3] : "";
        int attempts = argc > 4 ? std::stoi(argv[4]) : 0;
        std::string pastGuesses = argc > 5 ? argv[5] : "";

        std::string decision = WordRush::makeAiDecision(len, secret, attempts, pastGuesses);
        std::cout << decision << "\n";
        return 0;
    }

    if (cmd == "add_word") {
        std::string word = argc > 2 ? WordRush::toUpper(argv[2]) : "";
        if (!word.empty()) {
            WordRush::globalDict.addWord(word);
        }
        std::cout << "{\"success\":true,\"added\":\"" << word << "\"}\n";
        return 0;
    }

    if (cmd == "score") {
        int attemptIndex = argc > 2 ? std::stoi(argv[2]) : 0;
        int hintsUsed = argc > 3 ? std::stoi(argv[3]) : 0;
        int baseScores[] = {100, 80, 60, 40, 20, 10};
        int score = (attemptIndex >= 0 && attemptIndex < 6) ? baseScores[attemptIndex] : 0;
        if (hintsUsed == 0) score += 25; // Clean deduction bonus
        else score = std::max(0, score - hintsUsed * 5);
        std::cout << "{\"success\":true,\"score\":" << score << ",\"attemptIndex\":" << attemptIndex << ",\"hintsUsed\":" << hintsUsed << "}\n";
        return 0;
    }

    if (cmd == "room_code") {
        static const char charset[] = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        std::random_device rd;
        std::mt19937 codeRng(rd());
        std::uniform_int_distribution<size_t> dist(0, sizeof(charset) - 2);
        std::string code = "";
        for (int i = 0; i < 5; ++i) code += charset[dist(codeRng)];
        std::cout << "{\"success\":true,\"roomCode\":\"" << code << "\"}\n";
        return 0;
    }

    if (cmd == "classify") {
        std::string word = argc > 2 ? WordRush::toUpper(argv[2]) : "";
        std::set<std::string> names = {"SARAH", "DAVID", "JAMES", "EMILY", "PETER", "GRACE", "ALICE", "CHLOE", "HENRY", "FELIX"};
        bool isName = names.count(word) > 0;
        std::string category = isName ? "Proper Name" : (word.length() == 4 ? "Common Noun" : (word.length() == 6 ? "Tactical Noun" : "General"));
        std::cout << "{\"success\":true,\"word\":\"" << WordRush::escapeJson(word) << "\",\"isProperName\":" << (isName ? "true" : "false") << ",\"category\":\"" << category << "\"}\n";
        return 0;
    }

    std::cout << "{\"error\":\"Unknown command: " << WordRush::escapeJson(cmd) << "\"}\n";
    return 1;
}
