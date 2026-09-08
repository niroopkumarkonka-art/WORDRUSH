// ============================================================================
// WordRush Comprehensive Dictionary & Definitions Engine
// Provides words, definitions, lexical clues, and difficulty levels (Easy, Medium, Hard)
// ============================================================================

export const DIFFICULTY_LEVELS = {
  EASY: {
    id: "EASY",
    name: "Easy",
    wordLength: 4,
    maxAttempts: 6,
    hintCount: 3,
    color: "from-emerald-400 to-teal-500",
    border: "border-emerald-300",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "4-Letter Words • Friendly everyday vocabulary • 3 Free Hints",
    subtext: "Perfect for beginners & quick fun",
  },
  MEDIUM: {
    id: "MEDIUM",
    name: "Medium",
    wordLength: 5,
    maxAttempts: 6,
    hintCount: 2,
    color: "from-amber-400 to-orange-500",
    border: "border-amber-300",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    description: "5-Letter Words • Classic Wordle cipher duel • 2 Free Hints",
    subtext: "Balanced challenge for word lovers",
  },
  HARD: {
    id: "HARD",
    name: "Hard",
    wordLength: 6,
    maxAttempts: 6,
    hintCount: 1,
    color: "from-rose-500 to-purple-600",
    border: "border-rose-300",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    description: "6-Letter Words • Mastermind vocabulary • 1 Free Hint",
    subtext: "Strict duel for tactical masters",
  },
};

// Rich dictionary with definitions, categories, and clues
export const DICTIONARY_ENTRIES = {
  // --------------------------------------------------------------------------
  // EASY LEVEL (4-LETTER WORDS)
  // --------------------------------------------------------------------------
  ARCH: { word: "ARCH", definition: "A curved symmetrical structure spanning an opening.", category: "Noun", clue: "Curved doorway or bridge structure", difficulty: "EASY" },
  BARK: { word: "BARK", definition: "The sound made by a dog, or outer tree covering.", category: "Noun / Verb", clue: "Sound of a puppy or tree skin", difficulty: "EASY" },
  BIRD: { word: "BIRD", definition: "A warm-blooded feathered creature with wings.", category: "Noun", clue: "Feathered animal that flies in the sky", difficulty: "EASY" },
  BLUE: { word: "BLUE", definition: "The color of the clear sky and deep ocean.", category: "Adjective", clue: "Color of the clear sky", difficulty: "EASY" },
  BOAT: { word: "BOAT", definition: "A small watercraft propelled by oars, sails, or engine.", category: "Noun", clue: "Floats on water to transport passengers", difficulty: "EASY" },
  BOLD: { word: "BOLD", definition: "Showing a willingness to take risks; confident and courageous.", category: "Adjective", clue: "Brave, fearless, or striking font", difficulty: "EASY" },
  BOND: { word: "BOND", definition: "A strong connection or legal mutual agreement.", category: "Noun", clue: "A tight friendship or chemical connection", difficulty: "EASY" },
  CAMP: { word: "CAMP", definition: "A place with temporary accommodations of huts or tents.", category: "Noun / Verb", clue: "Sleeping outdoors in tents with a campfire", difficulty: "EASY" },
  CARE: { word: "CARE", definition: "The provision of what is necessary for health and welfare.", category: "Noun / Verb", clue: "Giving warmth, attention, or looking after someone", difficulty: "EASY" },
  CAST: { word: "CAST", definition: "To throw something forcefully, or actors in a play.", category: "Verb / Noun", clue: "Throw a fishing line or actors in a movie", difficulty: "EASY" },
  CLAY: { word: "CLAY", definition: "A stiff, sticky fine-grained earth used in pottery.", category: "Noun", clue: "Molded by sculptors on a pottery wheel", difficulty: "EASY" },
  COLD: { word: "COLD", definition: "Of or at a low or relatively low temperature.", category: "Adjective", clue: "Chilly winter air or iced lemonade", difficulty: "EASY" },
  DARK: { word: "DARK", definition: "With little or no light; nighttime condition.", category: "Adjective", clue: "Absence of light after sunset", difficulty: "EASY" },
  DAWN: { word: "DAWN", definition: "The first appearance of light in the sky before sunrise.", category: "Noun", clue: "The early morning sunrise horizon", difficulty: "EASY" },
  DESK: { word: "DESK", definition: "A piece of furniture with a flat surface for study or work.", category: "Noun", clue: "Workstation where books or laptops sit", difficulty: "EASY" },
  DUST: { word: "DUST", definition: "Fine, dry powder consisting of tiny particles of earth.", category: "Noun", clue: "Tiny particles that settle on old shelves", difficulty: "EASY" },
  ECHO: { word: "ECHO", definition: "A sound or series of sounds caused by the reflection of sound waves.", category: "Noun / Verb", clue: "Your voice bouncing back from canyon walls", difficulty: "EASY" },
  FACE: { word: "FACE", definition: "The front part of a person's head from forehead to chin.", category: "Noun", clue: "Contains eyes, nose, and an inviting smile", difficulty: "EASY" },
  FARM: { word: "FARM", definition: "An area of land devoted primarily to agricultural processes.", category: "Noun", clue: "Rural land where crops grow and animals graze", difficulty: "EASY" },
  FAST: { word: "FAST", definition: "Moving or capable of moving at high speed.", category: "Adjective", clue: "Rapid speed or sprinting quickly", difficulty: "EASY" },
  FISH: { word: "FISH", definition: "A limbless cold-blooded vertebrate animal with gills and fins.", category: "Noun", clue: "Aquatic creature with scales swimming in rivers", difficulty: "EASY" },
  FLAG: { word: "FLAG", definition: "A piece of cloth bearing the design of a country or group.", category: "Noun", clue: "Colorful banner fluttering in the wind on a pole", difficulty: "EASY" },
  FLOW: { word: "FLOW", definition: "To move along in a steady, continuous stream.", category: "Verb", clue: "Smooth motion of a river or electric current", difficulty: "EASY" },
  FROG: { word: "FROG", definition: "A tailless amphibian with long legs adapted for leaping.", category: "Noun", clue: "Green amphibian that croaks and leaps on lily pads", difficulty: "EASY" },
  GAME: { word: "GAME", definition: "A form of play or sport, especially a competitive one.", category: "Noun", clue: "Fun challenge played for entertainment or victory", difficulty: "EASY" },
  GLOW: { word: "GLOW", definition: "To give out steady light without a visible flame.", category: "Verb / Noun", clue: "Soft radiant luminescence like fireflies at night", difficulty: "EASY" },
  GOLD: { word: "GOLD", definition: "A precious yellow metallic element of high value.", category: "Noun / Adjective", clue: "Shiny yellow precious metal used in Olympic medals", difficulty: "EASY" },
  GRID: { word: "GRID", definition: "A framework of spaced parallel and crisscrossing bars.", category: "Noun", clue: "Matrix of rows and columns", difficulty: "EASY" },
  HAWK: { word: "HAWK", definition: "A bird of prey with broad rounded wings and keen vision.", category: "Noun", clue: "Sharp-eyed hunting bird soaring overhead", difficulty: "EASY" },
  HERO: { word: "HERO", definition: "A person admired for courage, outstanding achievements, or noble qualities.", category: "Noun", clue: "Protector with legendary bravery and courage", difficulty: "EASY" },
  HOPE: { word: "HOPE", definition: "A feeling of expectation and desire for a certain thing to happen.", category: "Noun / Verb", clue: "Optimistic wish for a bright future", difficulty: "EASY" },
  IRON: { word: "IRON", definition: "A strong, magnetic silver-gray metallic chemical element.", category: "Noun", clue: "Heavy metal used to forge tools or press clothes", difficulty: "EASY" },
  JUMP: { word: "JUMP", definition: "To push oneself off a surface into the air using legs.", category: "Verb", clue: "Leap off the ground with springy energy", difficulty: "EASY" },
  KING: { word: "KING", definition: "The male ruler of an independent state, especially by hereditary right.", category: "Noun", clue: "Royal monarch wearing a golden crown", difficulty: "EASY" },
  LAKE: { word: "LAKE", definition: "A large body of water surrounded by land.", category: "Noun", clue: "Serene inland body of freshwater", difficulty: "EASY" },
  LION: { word: "LION", definition: "A large tawny-colored cat of the African savannah.", category: "Noun", clue: "King of the jungle with a grand mane", difficulty: "EASY" },
  MOON: { word: "MOON", definition: "The natural satellite of the Earth, visible by reflected light.", category: "Noun", clue: "Orb illuminating the midnight sky with phases", difficulty: "EASY" },
  NEST: { word: "NEST", definition: "A structure built by birds to hold eggs and young.", category: "Noun", clue: "Twigs in a tree branch keeping fledglings cozy", difficulty: "EASY" },
  PARK: { word: "PARK", definition: "A large public green area used for recreation.", category: "Noun", clue: "Green grassy grounds with swings and benches", difficulty: "EASY" },
  RAIN: { word: "RAIN", definition: "Moisture condensed from the atmosphere that falls in drops.", category: "Noun", clue: "Water droplets falling from stormy clouds", difficulty: "EASY" },
  ROCK: { word: "ROCK", definition: "The solid mineral material forming part of the earth's surface.", category: "Noun", clue: "Solid stone found on mountains and riverbanks", difficulty: "EASY" },
  ROSE: { word: "ROSE", definition: "A fragrant prickly bush or flower, typically red or pink.", category: "Noun", clue: "Sweet-scented flower with protective thorns", difficulty: "EASY" },
  SAIL: { word: "SAIL", definition: "A piece of fabric spread to catch the wind and propel a vessel.", category: "Noun / Verb", clue: "White canvas catching the breeze on a yacht", difficulty: "EASY" },
  SAND: { word: "SAND", definition: "Loose granular substance resulting from erosion of rocks.", category: "Noun", clue: "Golden particles on warm summer beaches", difficulty: "EASY" },
  STAR: { word: "STAR", definition: "A luminous celestial point in the night sky.", category: "Noun", clue: "Twinkling cosmic beacon in outer space", difficulty: "EASY" },
  TIDE: { word: "TIDE", definition: "The alternate rising and falling of the sea.", category: "Noun", clue: "Ocean waters pulled by lunar gravitational force", difficulty: "EASY" },
  WIND: { word: "WIND", definition: "The perceptible natural movement of the air.", category: "Noun", clue: "Gust of air rustling through tree canopies", difficulty: "EASY" },
  WOLF: { word: "WOLF", definition: "A wild carnivorous mammal of the dog family living in packs.", category: "Noun", clue: "Forest canine that howls at the full moon", difficulty: "EASY" },

  // --------------------------------------------------------------------------
  // MEDIUM LEVEL (5-LETTER WORDS)
  // --------------------------------------------------------------------------
  ALBUM: { word: "ALBUM", definition: "A collection of audio recordings or photo keepsakes.", category: "Noun", clue: "A musical track collection or photo scrapbook", difficulty: "MEDIUM" },
  ALERT: { word: "ALERT", definition: "Quick to notice any unusual and potentially dangerous circumstances.", category: "Adjective", clue: "Wide awake, watchful, or an urgent alarm", difficulty: "MEDIUM" },
  AMBER: { word: "AMBER", definition: "Hard translucent fossilized resin, or warm golden-orange color.", category: "Noun / Adjective", clue: "Golden fossilized gemstone from ancient trees", difficulty: "MEDIUM" },
  ARENA: { word: "ARENA", definition: "A level area surrounded by seating for sports, events, or duels.", category: "Noun", clue: "Grand stadium where gladiators and rivals duel", difficulty: "MEDIUM" },
  BEACH: { word: "BEACH", definition: "A sandy or pebbly shore, especially by the ocean.", category: "Noun", clue: "Sandy coastal strip where ocean waves break", difficulty: "MEDIUM" },
  BLAZE: { word: "BLAZE", definition: "A very large or fiercely burning fire.", category: "Noun / Verb", clue: "Fierce crackling flames or trail-marking spark", difficulty: "MEDIUM" },
  BRAVE: { word: "BRAVE", definition: "Ready to face and endure danger or pain; showing courage.", category: "Adjective", clue: "Fearless hero facing perilous odds with valor", difficulty: "MEDIUM" },
  BREAD: { word: "BREAD", definition: "Food made of flour, water, and yeast, baked in an oven.", category: "Noun", clue: "Baked bakery staple sliced for sandwiches", difficulty: "MEDIUM" },
  BRICK: { word: "BRICK", definition: "A small rectangular block of fired clay used in building.", category: "Noun", clue: "Red building block used to erect sturdy walls", difficulty: "MEDIUM" },
  CABIN: { word: "CABIN", definition: "A small wooden shelter or house in a wild or remote area.", category: "Noun", clue: "Cozy timber lodge tucked away in the forest", difficulty: "MEDIUM" },
  CANDY: { word: "CANDY", definition: "A sweet food made with sugar or syrup combined with fruit or chocolate.", category: "Noun", clue: "Sugary treat enjoyed during celebrations", difficulty: "MEDIUM" },
  CHAMP: { word: "CHAMP", definition: "Short for champion; a winner of a contest or tournament.", category: "Noun", clue: "Trophy-holding victor in a tournament", difficulty: "MEDIUM" },
  CHEST: { word: "CHEST", definition: "A large sturdy box with a lid, or the front surface of human torso.", category: "Noun", clue: "Wooden treasure box filled with pirate gold", difficulty: "MEDIUM" },
  CLOCK: { word: "CLOCK", definition: "A mechanical or electrical device for measuring time.", category: "Noun", clue: "Ticking timepiece on the wall counting hours", difficulty: "MEDIUM" },
  CLOUD: { word: "CLOUD", definition: "A visible mass of condensed water vapor floating in the atmosphere.", category: "Noun", clue: "Fluffy white vapor formation in the blue sky", difficulty: "MEDIUM" },
  CRANE: { word: "CRANE", definition: "A tall long-legged bird, or large mechanical lifting hoist.", category: "Noun", clue: "Tall bird or construction machine lifting beams", difficulty: "MEDIUM" },
  CROWN: { word: "CROWN", definition: "An ornamental circular headdress worn by a monarch.", category: "Noun", clue: "Jeweled golden coronet atop royal heads", difficulty: "MEDIUM" },
  DANCE: { word: "DANCE", definition: "To move rhythmically to music, typically following steps.", category: "Verb / Noun", clue: "Moving body gracefully to musical beats", difficulty: "MEDIUM" },
  DREAM: { word: "DREAM", definition: "A series of thoughts and sensations occurring during sleep.", category: "Noun / Verb", clue: "Imaginative nocturnal vision while asleep", difficulty: "MEDIUM" },
  EAGLE: { word: "EAGLE", definition: "A large bird of prey with a massive hooked bill and long wings.", category: "Noun", clue: "Majestic apex raptor with acute vision", difficulty: "MEDIUM" },
  EARTH: { word: "EARTH", definition: "The planet on which we live; the world or soil.", category: "Noun", clue: "Our home planet in the solar system", difficulty: "MEDIUM" },
  FLAME: { word: "FLAME", definition: "A hot glowing body of ignited gas produced by fire.", category: "Noun", clue: "Licking tongues of fire producing heat and light", difficulty: "MEDIUM" },
  FLASH: { word: "FLASH", definition: "A sudden brief burst of bright light or rapid speed.", category: "Noun / Verb", clue: "Instant burst of lightning or camera flare", difficulty: "MEDIUM" },
  FROST: { word: "FROST", definition: "A deposit of small white ice crystals formed on the ground.", category: "Noun", clue: "Delicate ice patterns on winter windowpanes", difficulty: "MEDIUM" },
  GHOST: { word: "GHOST", definition: "An apparition of a dead person which is believed to appear.", category: "Noun", clue: "Spectral phantom passing through old castle walls", difficulty: "MEDIUM" },
  GIANT: { word: "GIANT", definition: "An imaginary or mythical being of superhuman size.", category: "Noun / Adjective", clue: "Colossal creature towering over villages", difficulty: "MEDIUM" },
  GRACE: { word: "GRACE", definition: "Simple elegance or refinement of movement.", category: "Noun", clue: "Elegance, charm, or kindness in poise", difficulty: "MEDIUM" },
  HEART: { word: "HEART", definition: "The muscular organ that pumps blood through the circulatory system.", category: "Noun", clue: "Pumping organ representing affection and love", difficulty: "MEDIUM" },
  HONEY: { word: "HONEY", definition: "A sweet, sticky yellowish-brown fluid made by bees.", category: "Noun", clue: "Sweet golden nectar produced inside beehives", difficulty: "MEDIUM" },
  HORSE: { word: "HORSE", definition: "A solid-hoofed plant-eating domesticated mammal with a flowing mane.", category: "Noun", clue: "Noble galloping steed ridden with saddle and reins", difficulty: "MEDIUM" },
  KNIFE: { word: "KNIFE", definition: "An instrument with a cutting blade and a handle.", category: "Noun", clue: "Sharp kitchen blade used to dice vegetables", difficulty: "MEDIUM" },
  LEMON: { word: "LEMON", definition: "A yellow oval citrus fruit with acidic juice.", category: "Noun", clue: "Sour yellow citrus squeezed into refreshing tea", difficulty: "MEDIUM" },
  LIGHT: { word: "LIGHT", definition: "The natural agent that stimulates sight and makes things visible.", category: "Noun / Adjective", clue: "Illumination dispelling darkness from a lamp", difficulty: "MEDIUM" },
  MAGIC: { word: "MAGIC", definition: "The power of influencing the course of events by using mysterious forces.", category: "Noun", clue: "Mystical incantations and wizardry charms", difficulty: "MEDIUM" },
  MUSIC: { word: "MUSIC", definition: "Vocal or instrumental sounds combined to produce harmony and expression.", category: "Noun", clue: "Melodies, rhythms, and chords played on instruments", difficulty: "MEDIUM" },
  NIGHT: { word: "NIGHT", definition: "The period of darkness in each twenty-four hours.", category: "Noun", clue: "Time between dusk and dawn when stars shine", difficulty: "MEDIUM" },
  OCEAN: { word: "OCEAN", definition: "A very large expanse of sea, in particular Atlantic or Pacific.", category: "Noun", clue: "Vast salty expanse covering most of planet Earth", difficulty: "MEDIUM" },
  PEARL: { word: "PEARL", definition: "A hard, glistening object produced within the soft tissue of an oyster.", category: "Noun", clue: "Precious iridescent gem discovered inside oysters", difficulty: "MEDIUM" },
  PILOT: { word: "PILOT", definition: "A person who operates the flying controls of an aircraft.", category: "Noun", clue: "Aviator steering an airliner in the cockpit", difficulty: "MEDIUM" },
  PIZZA: { word: "PIZZA", definition: "A dish made of flattened dough topped with sauce and cheese.", category: "Noun", clue: "Cheesy Italian oven-baked pie cut into slices", difficulty: "MEDIUM" },
  PLANT: { word: "PLANT", definition: "A living organism that absorbs water and synthesizes nutrients by photosynthesis.", category: "Noun / Verb", clue: "Green botanical growth rooted in soil", difficulty: "MEDIUM" },
  QUEEN: { word: "QUEEN", definition: "The female ruler of an independent state, especially a monarch.", category: "Noun", clue: "Female sovereign reigning on a royal throne", difficulty: "MEDIUM" },
  RIVER: { word: "RIVER", definition: "A large natural stream of water flowing in a channel to the sea.", category: "Noun", clue: "Winding waterway carving canyons toward the ocean", difficulty: "MEDIUM" },
  ROBOT: { word: "ROBOT", definition: "A machine capable of carrying out a complex series of actions automatically.", category: "Noun", clue: "Automated mechanical android with microchips", difficulty: "MEDIUM" },
  SHARK: { word: "SHARK", definition: "A large predatory marine fish with a cartilaginous skeleton.", category: "Noun", clue: "Ocean predator with a dorsal fin and sharp teeth", difficulty: "MEDIUM" },
  SHIELD: { word: "SHIELD", definition: "A broad piece of armor held for defense against blows.", category: "Noun / Verb", clue: "Protective heraldic plate guarding against arrows", difficulty: "MEDIUM" },
  SPACE: { word: "SPACE", definition: "The physical universe beyond the earth's atmosphere.", category: "Noun", clue: "The boundless cosmic void dotted with galaxies", difficulty: "MEDIUM" },
  SPARK: { word: "SPARK", definition: "A small fiery particle thrown off from a fire or electrical discharge.", category: "Noun / Verb", clue: "Tiny ember that ignites a roaring campfire", difficulty: "MEDIUM" },
  STORM: { word: "STORM", definition: "A violent disturbance of the atmosphere with strong winds and rain.", category: "Noun", clue: "Thunderous tempest accompanied by flash lightning", difficulty: "MEDIUM" },
  SWORD: { word: "SWORD", definition: "A weapon with a long metal blade and a hilt with a hand guard.", category: "Noun", clue: "Steel bladed weapon wielded by ancient knights", difficulty: "MEDIUM" },
  TIGER: { word: "TIGER", definition: "A very large solitary cat with a yellow-brown coat striped with black.", category: "Noun", clue: "Striped jungle feline known for immense power", difficulty: "MEDIUM" },
  TOWER: { word: "TOWER", definition: "A tall, narrow building, either free-standing or part of a castle.", category: "Noun", clue: "High vantage bastion overlooking castle ramparts", difficulty: "MEDIUM" },
  TRAIN: { word: "TRAIN", definition: "A series of connected railway carriages or wagons moved by a locomotive.", category: "Noun / Verb", clue: "Locomotive moving along railway tracks", difficulty: "MEDIUM" },
  WATER: { word: "WATER", definition: "A colorless, transparent liquid that forms the seas, lakes, and rain.", category: "Noun", clue: "Essential clear liquid compound of hydrogen and oxygen", difficulty: "MEDIUM" },

  // --------------------------------------------------------------------------
  // HARD LEVEL (6-LETTER WORDS)
  // --------------------------------------------------------------------------
  BRIDGE: { word: "BRIDGE", definition: "A structure carrying a road, path, or railroad across an obstacle.", category: "Noun", clue: "Spans across wide rivers or chasms", difficulty: "HARD" },
  CASTLE: { word: "CASTLE", definition: "A large fortified building or set of buildings from the medieval period.", category: "Noun", clue: "Medieval stone stronghold with battlements and moat", difficulty: "HARD" },
  CIPHER: { word: "CIPHER", definition: "A secret or disguised way of writing; a code.", category: "Noun", clue: "Secret encrypted algorithm or coded message", difficulty: "HARD" },
  DRAGON: { word: "DRAGON", definition: "A mythical monster like a giant reptile, typically breathing fire.", category: "Noun", clue: "Mythological winged reptile guarding hoard of gold", difficulty: "HARD" },
  FOREST: { word: "FOREST", definition: "A large area covered chiefly with trees and undergrowth.", category: "Noun", clue: "Vast woodland populated by ancient oak and pine", difficulty: "HARD" },
  GALAXY: { word: "GALAXY", definition: "A system of millions or billions of stars, gas, and dust.", category: "Noun", clue: "Spiral cosmic cluster of billions of solar systems", difficulty: "HARD" },
  ISLAND: { word: "ISLAND", definition: "A piece of land surrounded entirely by water.", category: "Noun", clue: "Tropical landmass enveloped by azure sea", difficulty: "HARD" },
  JUNGLE: { word: "JUNGLE", definition: "An area of land overgrown with dense tropical forest and tangled vegetation.", category: "Noun", clue: "Dense rainforest alive with parrots and vines", difficulty: "HARD" },
  KNIGHT: { word: "KNIGHT", definition: "A man awarded a non-hereditary title of knighthood; armored warrior.", category: "Noun", clue: "Chivalric warrior in polished metal armor", difficulty: "HARD" },
  METEOR: { word: "METEOR", definition: "A small body of matter from outer space that enters the earth's atmosphere.", category: "Noun", clue: "Shooting celestial rock burning upon atmospheric entry", difficulty: "HARD" },
  NATURE: { word: "NATURE", definition: "The phenomena of the physical world collectively, including plants and animals.", category: "Noun", clue: "Flora, fauna, and wilderness untouched by mankind", difficulty: "HARD" },
  ORBITA: { word: "ORBITS", definition: "Curved paths of a celestial object or spacecraft around a star or planet.", category: "Noun", clue: "Gravitational paths around the sun or earth", difficulty: "HARD" },
  PLANET: { word: "PLANET", definition: "A celestial body moving in an elliptical orbit around a star.", category: "Noun", clue: "Spherical world like Mars or Jupiter circling the sun", difficulty: "HARD" },
  PIRATE: { word: "PIRATE", definition: "A person who attacks and robs ships at sea.", category: "Noun", clue: "Sea-roving buccaneer searching for treasure maps", difficulty: "HARD" },
  PORTAL: { word: "PORTAL", definition: "A grand or imposing doorway or magical gateway.", category: "Noun", clue: "Interdimensional vortex or grand gateway", difficulty: "HARD" },
  PRINCE: { word: "PRINCE", definition: "The son of a monarch or close male relative of royalty.", category: "Noun", clue: "Noble royal heir destined to inherit the throne", difficulty: "HARD" },
  PUZZLE: { word: "PUZZLE", definition: "A game, toy, or problem designed to test ingenuity or knowledge.", category: "Noun", clue: "Brain-teaser challenge requiring deduction", difficulty: "HARD" },
  SHADOW: { word: "SHADOW", definition: "A dark area or shape produced by a body coming between rays of light.", category: "Noun", clue: "Dark silhouette following you under bright sunlight", difficulty: "HARD" },
  SILVER: { word: "SILVER", definition: "A precious shiny grayish-white metallic element.", category: "Noun / Adjective", clue: "Precious reflective metal second only to gold", difficulty: "HARD" },
  SPRING: { word: "SPRING", definition: "The season after winter and before summer, when plants blossom.", category: "Noun", clue: "Season when flowers bloom and snow melts", difficulty: "HARD" },
  TARGET: { word: "TARGET", definition: "A person, object, or place selected as the aim of attack or goal.", category: "Noun", clue: "Bullseye destination of an archer's arrow", difficulty: "HARD" },
  TEMPLE: { word: "TEMPLE", definition: "A building devoted to the worship of a god or gods.", category: "Noun", clue: "Sacred stone shrine erected on a mountain summit", difficulty: "HARD" },
  VICTOR: { word: "VICTOR", definition: "A person who defeats an enemy or opponent in a battle or competition.", category: "Noun", clue: "Triumphant winner who conquers the challenge", difficulty: "HARD" },
  VOYAGE: { word: "VOYAGE", definition: "A long journey involving travel by sea or in space.", category: "Noun", clue: "Epic seafaring exploration across uncharted waters", difficulty: "HARD" },
  WIZARD: { word: "WIZARD", definition: "A man who has magical powers, especially in legends and fairy tales.", category: "Noun", clue: "Sorcerer who casts spells with an ancient wand", difficulty: "HARD" },
};

/**
 * Get curated puzzle list for a given difficulty
 */
export function getPuzzlesByDifficulty(difficulty = "MEDIUM") {
  const diffKey = difficulty.toUpperCase();
  const entries = Object.values(DICTIONARY_ENTRIES).filter(
    (e) => e.difficulty === diffKey
  );
  return entries.length > 0 ? entries : Object.values(DICTIONARY_ENTRIES);
}

/**
 * Get dictionary entry details for a word
 */
export function lookupWord(word) {
  if (!word) return null;
  const clean = word.trim().toUpperCase();
  return DICTIONARY_ENTRIES[clean] || null;
}

/**
 * Get random word from dictionary by length
 */
export function getRandomDictionaryWord(length = 5) {
  const matches = Object.values(DICTIONARY_ENTRIES).filter(
    (e) => e.word.length === length
  );
  if (matches.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * matches.length);
  return matches[randomIndex];
}
