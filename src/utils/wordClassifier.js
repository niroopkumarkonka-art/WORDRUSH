// ============================================================================
// WordRush Lexical & Linguistic Classifier
// Categorizes words into Names, Verbs, Common Nouns, Adjectives, or General Words
// ============================================================================

const COMMON_NAMES = new Set([
  "AARON", "ADAM", "ALAN", "ALEX", "ALICE", "AMBER", "ANNA", "ARTHUR", "BELLA",
  "BEN", "BLAKE", "BOB", "BRIAN", "BRUCE", "CARL", "CHLOE", "CHRIS", "CLARA", "CLARK",
  "COLE", "DANIEL", "DAVID", "DIANA", "ELENA", "ELIZA", "ELLA", "EMILY", "EMMA",
  "ETHAN", "FELIX", "FIONA", "FRANK", "GEORGE", "GRACE", "HARRY", "HENRY", "IAN",
  "ISAAC", "JACK", "JADE", "JAMES", "JANE", "JASON", "JOHN", "JONAH", "JOSH",
  "JULIA", "KATE", "KEVIN", "LAURA", "LEO", "LEVI", "LIAM", "LILY", "LOGAN",
  "LUCAS", "LUCY", "LUKE", "MARIA", "MARIE", "MARK", "MARY", "MAX", "MAYA",
  "MILES", "NOAH", "NORA", "OLIVIA", "OLIVER", "OSCAR", "OWEN", "PAUL", "PETER",
  "PHILIP", "ROBIN", "RON", "ROSE", "RUBY", "RYAN", "SAM", "SAMMY", "SARAH",
  "SEAN", "SIMON", "STEVE", "TIM", "TOM", "TYLER", "VICTOR", "WYATT", "ZOE", "ZOEY",
  "CYBER", "ECHO", "NOVA", "ORION", "TITAN", "ZEUS", "ARES", "ATHENA", "LUNA"
]);

const ACTION_VERBS = new Set([
  "BEAT", "BLOW", "BURN", "CALL", "CAST", "CLAP", "COOK", "DRAW", "DROP", "FIND",
  "FLOW", "FLY", "GIVE", "GROW", "HEAR", "HIDE", "HOLD", "HURT", "KEEP", "KICK",
  "KNOW", "LEAD", "LEAP", "LOOK", "LOSE", "MAKE", "MEET", "MOVE", "PASS", "PLAY",
  "PULL", "PUSH", "RACE", "READ", "RIDE", "RING", "RISE", "ROLL", "RUN", "SAIL",
  "SAVE", "SEEK", "SELL", "SEND", "SHOW", "SING", "SINK", "SLIP", "SPIN", "STAY",
  "STOP", "SWIM", "TAKE", "TALK", "TELL", "TURN", "WAKE", "WALK", "WASH", "WEAR",
  "WEEP", "WINS", "WORK", "BREAK", "BUILD", "CATCH", "CHASE", "CLIMB", "CRASH",
  "DANCE", "DREAM", "DRIVE", "FIGHT", "FLASH", "FOCUS", "FORGE", "GLIDE", "GUESS",
  "JUMP", "LAUGH", "LIGHT", "MATCH", "PLANT", "REACH", "RUSH", "SHAKE", "SHARE",
  "SHIFT", "SHINE", "SHOCK", "SHOOT", "SMILE", "SMOKE", "SOLVE", "SOUND", "SPARK",
  "SPEAK", "SPELL", "SPLIT", "STAND", "START", "SWEEP", "SWING", "TASTE", "THINK",
  "TOUCH", "TRACK", "TRAIN", "TWIST", "WATCH", "WRITE"
]);

const ADJECTIVES = new Set([
  "ACUTE", "ALIVE", "BASIC", "BLACK", "BLIND", "BLUNT", "BRAVE", "BRIEF", "BRIGHT",
  "BROAD", "BROWN", "CALM", "CHIEF", "CLEAN", "CLEAR", "CLOSE", "COLD", "COOL",
  "CRISP", "DARK", "DEEP", "EARLY", "EMPTY", "EXACT", "FAINT", "FAIR", "FAST",
  "FATAL", "FIERCE", "FINE", "FIRST", "FLAT", "FRESH", "FRONT", "FULL", "GIANT",
  "GLAD", "GOLD", "GRAND", "GREAT", "GREEN", "GROSS", "HAPPY", "HARSH", "HEAVY",
  "HUMAN", "INNER", "JOINT", "KEEN", "LARGE", "LATE", "LEAN", "LEGAL", "LIGHT",
  "LOCAL", "LOOSE", "LOUD", "LUCKY", "MAGIC", "MAJOR", "MINOR", "MORAL", "NAKED",
  "NASTY", "NAVAL", "NEAT", "NICE", "NOBLE", "NOVEL", "OUTER", "PLAIN", "PROUD",
  "PURE", "QUICK", "QUIET", "RAPID", "READY", "RIGHT", "ROUGH", "ROUND", "ROYAL",
  "RUDE", "RURAL", "SHARP", "SHEER", "SHORT", "SILLY", "SLIGHT", "SLIM", "SMART",
  "SMOOTH", "SOLID", "STEEP", "STILL", "STOUT", "SWEET", "SWIFT", "TALL", "THICK",
  "TIGHT", "TOUGH", "TRUE", "UPPER", "URBAN", "UTTER", "VAGUE", "VALID", "VITAL",
  "VIVID", "WARM", "WHITE", "WHOLE", "WIDE", "WILD", "WISE", "YOUNG"
]);

const COMMON_NOUNS = new Set([
  "APPLE", "BEACH", "BLADE", "BLOCK", "BOARD", "BRAIN", "BRICK", "CHAIN", "CHAIR",
  "CHEST", "CLOCK", "CLOUD", "CROWN", "DRUM", "EARTH", "FIELD", "FLAME", "FLOOR",
  "FORCE", "FRUIT", "GLASS", "GRAIN", "GRASS", "HEART", "HORSE", "HOUSE", "ISLAND",
  "KNIFE", "LEMON", "LIGHT", "LUNCH", "METAL", "MONEY", "MONTH", "MOON", "MOUNT",
  "MUSIC", "NIGHT", "NOISE", "OCEAN", "ORDER", "PAINT", "PAPER", "PARTY", "PEACE",
  "PHONE", "PIECE", "PILOT", "PIZZA", "PLANE", "PLANET", "PLANT", "PLATE", "POINT",
  "POWER", "PRICE", "PRIDE", "QUEEN", "RADIO", "RIVER", "ROBOT", "SCALE", "SCENE",
  "SHARK", "SHEET", "SHELL", "SHIELD", "SHIRT", "SIGHT", "SKILL", "SNAKE", "SPACE",
  "SPOON", "STAGE", "STAR", "STEAM", "STEEL", "STONE", "STORM", "SUGAR", "SWORD",
  "TABLE", "TEETH", "TIGER", "TITLE", "TOWER", "TRACK", "TRAIN", "TRUCK", "TRUTH",
  "UNCLE", "VOICE", "WATER", "WHEEL", "WIND", "WORLD", "YOUTH"
]);

/**
 * Classifies a given word into a user-friendly lexical category.
 * @param {string} word - The word to classify.
 * @returns {object} Classification details.
 */
export function classifyWord(word) {
  if (!word || typeof word !== "string") {
    return {
      type: "EMPTY",
      label: "Waiting for word...",
      category: "None",
      badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
      description: "Type letters to inspect word type.",
      icon: "⌨️",
    };
  }

  const clean = word.trim().toUpperCase();
  if (clean.length === 0) {
    return {
      type: "EMPTY",
      label: "Waiting for word...",
      category: "None",
      badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
      description: "Type letters to inspect word type.",
      icon: "⌨️",
    };
  }

  // 1. Check if it's a known Person/Character Name
  if (COMMON_NAMES.has(clean)) {
    return {
      type: "NAME",
      label: "Person / Character Name",
      category: "Proper Name",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-300 shadow-sm",
      description: `"${clean}" is a recognized name or proper noun.`,
      note: `Notice: You entered a proper name ("${clean}"). In standard dictionary rules, proper names may not be allowed in official Scrabble lists, but WordRush's Lexical Engine recognizes and tags them!`,
      icon: "👤",
      isName: true,
      isWord: true,
    };
  }

  // 2. Check if it's an Action Verb
  if (ACTION_VERBS.has(clean)) {
    return {
      type: "VERB",
      label: "Action / Dynamic Verb",
      category: "Verb",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300 shadow-sm",
      description: `"${clean}" represents an action, movement, or state.`,
      note: `Action Verb: "${clean}" is an active verb describing an action or occurrence.`,
      icon: "⚡",
      isName: false,
      isWord: true,
    };
  }

  // 3. Check if it's an Adjective
  if (ADJECTIVES.has(clean)) {
    return {
      type: "ADJECTIVE",
      label: "Descriptive / Adjective",
      category: "Adjective",
      badgeColor: "bg-sky-100 text-sky-900 border-sky-300 shadow-sm",
      description: `"${clean}" describes or qualifies a person, place, or thing.`,
      note: `Adjective: "${clean}" describes properties or characteristics.`,
      icon: "✨",
      isName: false,
      isWord: true,
    };
  }

  // 4. Check if it's a Common Object / Noun
  if (COMMON_NOUNS.has(clean)) {
    return {
      type: "NOUN",
      label: "Object / Common Noun",
      category: "Noun",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm",
      description: `"${clean}" refers to a person, place, object, or concept.`,
      note: `Common Noun: "${clean}" identifies a concrete object or concept.`,
      icon: "📦",
      isName: false,
      isWord: true,
    };
  }

  // 5. Default fallback to Standard English Word
  return {
    type: "WORD",
    label: "English Dictionary Word",
    category: "Standard Word",
    badgeColor: "bg-teal-100 text-teal-900 border-teal-300 shadow-sm",
    description: `"${clean}" is a recognized vocabulary word.`,
    note: `Standard Word: "${clean}" is recognized in the English dictionary.`,
    icon: "📖",
    isName: false,
    isWord: true,
  };
}

/**
 * Checks if two words have a first-character match.
 * @param {string} wordA - First word.
 * @param {string} wordB - Second word.
 * @returns {boolean} True if first characters match.
 */
export function isFirstCharMatch(wordA, wordB) {
  if (!wordA || !wordB) return false;
  return wordA.trim()[0]?.toUpperCase() === wordB.trim()[0]?.toUpperCase();
}
