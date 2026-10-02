-- ============================================================================
-- WORDRUSH ARENA - Production Database Seed Data (SQL)
-- Seeds initial system users, AI bots, lexical dictionary, and sample matches
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED SYSTEM USERS & BOTS
-- ----------------------------------------------------------------------------
INSERT INTO users (id, username, email, avatar, role, is_bot, created_at)
VALUES 
    ('usr_admin_001', 'ArenaMaster', 'admin@wordrush.arena', '👑', 'ADMIN', FALSE, NOW() - INTERVAL '30 days'),
    ('usr_bot_cyber', 'CyberBot', 'bot@wordrush.arena', '🤖', 'PLAYER', TRUE, NOW() - INTERVAL '30 days'),
    ('usr_bot_lexi', 'LexiBot', 'lexi@wordrush.arena', '🦊', 'PLAYER', TRUE, NOW() - INTERVAL '25 days'),
    ('usr_pilot_alpha', 'PilotAlpha', 'alpha@wordrush.arena', '⚡', 'PLAYER', FALSE, NOW() - INTERVAL '14 days'),
    ('usr_word_wizard', 'WordWizard', 'wizard@wordrush.arena', '🧙', 'PLAYER', FALSE, NOW() - INTERVAL '10 days'),
    ('usr_challenger_1', 'CipherNinja', 'ninja@wordrush.arena', '🥷', 'PLAYER', FALSE, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. SEED USER PROFILES & RATINGS
-- ----------------------------------------------------------------------------
INSERT INTO user_profiles (
    user_id, elo_rating, peak_elo, total_games, total_wins, total_losses, 
    total_draws, current_streak, best_streak, total_points, words_decrypted,
    exact_anagrams_found, hints_used_count, avg_attempts_per_round, fastest_win_seconds, last_played_at
) VALUES
    ('usr_admin_001', 1850, 1920, 120, 95, 20, 5, 8, 14, 18500, 180, 75, 45, 3.2, 18, NOW()),
    ('usr_bot_cyber', 1500, 1550, 340, 170, 160, 10, 2, 7, 25500, 310, 120, 0, 3.8, 22, NOW()),
    ('usr_bot_lexi', 1350, 1380, 210, 95, 110, 5, 0, 5, 14200, 190, 60, 0, 4.1, 28, NOW()),
    ('usr_pilot_alpha', 1620, 1650, 85, 58, 24, 3, 4, 9, 11900, 120, 48, 18, 3.5, 14, NOW() - INTERVAL '2 hours'),
    ('usr_word_wizard', 1710, 1740, 95, 68, 23, 4, 6, 11, 15400, 145, 65, 12, 3.1, 12, NOW() - INTERVAL '5 hours'),
    ('usr_challenger_1', 1420, 1440, 40, 22, 17, 1, 1, 4, 5200, 50, 18, 15, 4.0, 26, NOW() - INTERVAL '1 day')
ON CONFLICT (user_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. SEED CORE DICTIONARY & ANAGRAM SIGNATURES
-- ----------------------------------------------------------------------------
INSERT INTO dictionary_lexicon (word, length, difficulty, category, definition, lexical_clue, base_points, anagram_signature)
VALUES
    -- 4-Letter Easy Words
    ('ARCH', 4, 'EASY', 'Architecture', 'A curved symmetrical structure spanning an opening.', 'Curved doorway or bridge structure', 120, 'ACHR'),
    ('BARK', 4, 'EASY', 'Nature', 'The outer covering of a tree, or the sharp sound of a dog.', 'Tree exterior or canine vocal sound', 120, 'ABKR'),
    ('BIRD', 4, 'EASY', 'Fauna', 'A warm-blooded feathered vertebrate with wings.', 'Winged feathered creature that flies', 120, 'BDIR'),
    ('BLUE', 4, 'EASY', 'Color', 'The color between green and violet in the spectrum.', 'Color of cloudless midday sky', 120, 'BELU'),
    ('BOAT', 4, 'EASY', 'Transport', 'A vessel for traveling across water propelled by oars or engine.', 'Small marine floating watercraft', 120, 'ABOT'),
    ('BOLD', 4, 'EASY', 'Adjective', 'Showing a fearless readiness to take risks.', 'Courageous or heavily weighted font', 120, 'BDLO'),
    ('BOND', 4, 'EASY', 'Relation', 'A mutual connection, financial agreement, or chemical link.', 'Tight friendship or molecular tie', 120, 'BDNO'),
    ('CAMP', 4, 'EASY', 'Outdoors', 'Temporary outdoor quarters with tents or cabins.', 'Tent lodging with outdoor campfire', 120, 'ACMP'),
    ('CARE', 4, 'EASY', 'Emotion', 'The provision of comfort, support, or affection.', 'Looking after someone with attention', 120, 'ACER'),
    ('CLAY', 4, 'EASY', 'Material', 'Fine-grained earth molded when wet and baked hard.', 'Ceramic mud molded on pottery wheel', 120, 'ACLY'),
    ('COLD', 4, 'EASY', 'Climate', 'Low temperature lacking warmth.', 'Chilly winter air or iced beverage', 120, 'CDLO'),
    ('DARK', 4, 'EASY', 'Lighting', 'With little or no light.', 'Nighttime absence of sunlight', 120, 'ADKR'),
    ('DAWN', 4, 'EASY', 'Time', 'The first appearance of light in the morning sky.', 'Sunrise morning awakening horizon', 120, 'ADNW'),
    ('DIET', 4, 'EASY', 'Health', 'The food and drink regularly consumed by an organism.', 'Daily nutrition meal plan regimen', 120, 'DEIT'),
    ('EDIT', 4, 'EASY', 'Writing', 'Prepare text, audio, or film for publishing by correcting.', 'Revise text, cut footage, or improve', 120, 'DEIT'),
    ('TIDE', 4, 'EASY', 'Nature', 'The alternate rising and falling of the ocean sea level.', 'Ocean current lunar water cycle', 120, 'DEIT'),
    ('TIED', 4, 'EASY', 'Verb', 'Fastened or attached with a string, cord, or knot.', 'Bound securely with knot or rope', 120, 'DEIT'),
    ('DUST', 4, 'EASY', 'Nature', 'Fine dry powder consisting of tiny particles of earth.', 'Tiny powdered particles on furniture', 120, 'DSTU'),
    ('ECHO', 4, 'EASY', 'Sound', 'Repetition of a sound caused by the reflection of sound waves.', 'Bouncing acoustic sound wave replica', 120, 'CEHO'),
    ('FARM', 4, 'EASY', 'Agriculture', 'An area of land devoted primarily to agricultural processes.', 'Agricultural barn with crops and tractors', 120, 'AFMR'),
    ('FAST', 4, 'EASY', 'Speed', 'Moving or capable of moving at high speed.', 'High velocity, rapid, or quick sprint', 120, 'AFST'),
    ('FISH', 4, 'EASY', 'Fauna', 'A limbless cold-blooded vertebrate animal living in water.', 'Aquatic creature with gills and fins', 120, 'FHIS'),
    ('FLAG', 4, 'EASY', 'Symbol', 'A piece of cloth with distinctive design used as a symbol.', 'National banner fluttering in the breeze', 120, 'AFGL'),
    ('FLOW', 4, 'EASY', 'Physics', 'Move along in a steady, continuous stream.', 'Smooth liquid stream progression', 120, 'FLOW'),
    ('FROG', 4, 'EASY', 'Fauna', 'A tailless amphibian with long legs adapted for leaping.', 'Green hopping pond amphibian with croak', 120, 'FGOR'),
    ('GLOW', 4, 'EASY', 'Light', 'Give out steady light without a violent flame.', 'Soft luminous radiance in the dark', 120, 'GLOW'),
    ('GOLD', 4, 'EASY', 'Mineral', 'A precious yellow metallic element valued in jewelry.', 'Shiny yellow precious royal bullion', 120, 'DGLO'),
    ('HAWK', 4, 'EASY', 'Fauna', 'A diurnal bird of prey with broad rounded wings and keen sight.', 'Raptor predator bird with razor talons', 120, 'AHKW'),
    ('HERO', 4, 'EASY', 'Archetype', 'A person admired for courage, achievements, or noble qualities.', 'Brave champion fighting for justice', 120, 'EHOR'),
    ('IRON', 4, 'EASY', 'Metal', 'A strong, hard magnetic silvery-gray metallic element.', 'Heavy magnetic construction metal ore', 120, 'INOR'),
    ('JUMP', 4, 'EASY', 'Action', 'Push oneself off a surface into the air by using muscles.', 'Leap upward from ground with leg spring', 120, 'JMPU'),
    ('KING', 4, 'EASY', 'Royalty', 'The male ruler of an independent state or kingdom.', 'Crown-wearing monarch seated on a throne', 120, 'GIKN'),
    ('LAKE', 4, 'EASY', 'Geography', 'A large body of water surrounded by land.', 'Inland body of clear freshwater', 120, 'AEKL'),
    ('LION', 4, 'EASY', 'Fauna', 'A large carnivorous feline of Africa and NW India.', 'Mighty golden king of the savannah pride', 120, 'ILNO'),
    ('MOON', 4, 'EASY', 'Astronomy', 'The natural satellite of the earth, visible by reflected light.', 'Nighttime celestial lunar satellite orb', 120, 'MNOO'),
    ('NEST', 4, 'EASY', 'Nature', 'A structure built by birds to hold eggs and shelter young.', 'Twig shelter cradle for hatching eggs', 120, 'ENST'),
    ('PARK', 4, 'EASY', 'Outdoors', 'A large public green area in a town used for recreation.', 'Green lawn public playground with trees', 120, 'AKPR'),
    ('RAIN', 4, 'EASY', 'Weather', 'Moisture condensed from the atmosphere that falls in drops.', 'Liquid sky precipitation cloud drops', 120, 'AINR'),
    ('ROCK', 4, 'EASY', 'Geology', 'The solid mineral material forming part of earth surface.', 'Hard boulder stony geological mineral', 120, 'CKOR'),
    ('ROSE', 4, 'EASY', 'Flora', 'A prickly bush or shrub that bears fragrant flowers.', 'Classic fragrant blossom with sharp thorns', 120, 'EORS'),
    ('SAIL', 4, 'EASY', 'Nautical', 'A piece of fabric spread to catch the wind on a vessel.', 'Canvas sheet catching ocean breeze', 120, 'AILS'),
    ('SAND', 4, 'EASY', 'Geology', 'Loose granular substance resulting from erosion of rocks.', 'Golden grains across beachfront dunes', 120, 'ADNS'),
    ('STAR', 4, 'EASY', 'Cosmos', 'A luminous point in the night sky that is a distant celestial body.', 'Twinkling nuclear burning stellar furnace', 120, 'ARST'),
    ('WIND', 4, 'EASY', 'Atmosphere', 'The perceptible natural movement of the air blowing.', 'Blowing atmospheric aerial draft force', 120, 'DINW'),
    ('WOLF', 4, 'EASY', 'Fauna', 'A wild carnivorous mammal of the dog family living in packs.', 'Pack hunter canine that howls at moonlight', 120, 'FLOW'),
    ('YARD', 4, 'EASY', 'Property', 'A piece of ground adjoining a building, often grass-covered.', 'Fenced suburban lawn or garden area', 120, 'ADRY'),
    ('ZEAL', 4, 'EASY', 'Emotion', 'Great energy or enthusiasm in pursuit of a cause or objective.', 'Fiery passion, dedication, and vigor', 120, 'AELZ'),

    -- 5-Letter Medium Words
    ('ARENA', 5, 'MEDIUM', 'Architecture', 'A level area surrounded by seats for sports and entertainment.', 'Battle stadium colosseum for gladiators', 150, 'AAENR'),
    ('BLAZE', 5, 'MEDIUM', 'Fire', 'A very large or fiercely burning fire.', 'Raging fierce radiant bonfire flame', 150, 'ABELZ'),
    ('CANDY', 5, 'MEDIUM', 'Food', 'A sweet confection made with sugar or syrup flavored with fruit.', 'Sugary confectionery treat sweet bar', 150, 'ACDNY'),
    ('CRANE', 5, 'MEDIUM', 'Machinery', 'A tall machine used for moving heavy objects, or tall bird.', 'Tall lifting hoist or long-legged bird', 150, 'ACENR'),
    ('CYBER', 5, 'MEDIUM', 'Technology', 'Relating to electronic communication networks and computers.', 'Digital electronic web matrix domain', 150, 'BCERY'),
    ('DELTA', 5, 'MEDIUM', 'Geography', 'A triangular tract of sediment deposited at the mouth of a river.', 'Triangular river estuary mouth silt', 150, 'ADELT'),
    ('EAGLE', 5, 'MEDIUM', 'Fauna', 'A large bird of prey with massive hooked bill and long wings.', 'Soaring raptor bird with majestic crest', 150, 'AEEGL'),
    ('FLAME', 5, 'MEDIUM', 'Fire', 'A hot glowing body of ignited gas produced by combustion.', 'Burning orange flicker on a lit torch', 150, 'AEFLM'),
    ('FROST', 5, 'MEDIUM', 'Weather', 'A deposit of small white ice crystals formed on the ground.', 'Crystalline frozen morning icy glaze', 150, 'FORST'),
    ('GHOST', 5, 'MEDIUM', 'Paranormal', 'An apparition of a dead person which is believed to appear.', 'Spooky ethereal translucent spirit apparition', 150, 'GHOST'),
    ('LUNAR', 5, 'MEDIUM', 'Astronomy', 'Resembling or relating to the moon.', 'Pertaining to moon phases and tides', 150, 'ALNRU'),
    ('MAGIC', 5, 'MEDIUM', 'Fantasy', 'The power of influencing events by using mysterious forces.', 'Enchanted wizard spellcasting illusion', 150, 'ACGIM'),
    ('NINJA', 5, 'MEDIUM', 'Combat', 'A person skilled in traditional Japanese covert stealth martial arts.', 'Stealthy masked shinobi martial artist', 150, 'AIJNN'),
    ('ORBIT', 5, 'MEDIUM', 'Astronomy', 'The gravitationally curved trajectory of an object around a star.', 'Curved planetary trajectory around sun', 150, 'BIORT'),
    ('PIXEL', 5, 'MEDIUM', 'Display', 'A minute area of illumination on a display screen.', 'Smallest illuminated square digital dot', 150, 'EILPX'),
    ('PRISM', 5, 'MEDIUM', 'Optics', 'A solid geometric shape whose two ends are similar polygons.', 'Glass refractive crystal splitting light', 150, 'IMPRS'),
    ('PULSE', 5, 'MEDIUM', 'Biology', 'The rhythmic throbbing of arteries as blood is propelled.', 'Rhythmic heart arterial beat frequency', 150, 'ELPSU'),
    ('RAVEN', 5, 'MEDIUM', 'Fauna', 'A large heavily built crow with predominantly black plumage.', 'Intelligent obsidian bird of mystery lore', 150, 'AENRV'),
    ('RIDER', 5, 'MEDIUM', 'Person', 'A person who rides a horse, bicycle, or motorcycle.', 'Pilot mounted on horse or motorbike', 150, 'DEIRR'),
    ('SHIELD', 6, 'HARD', 'Armor', 'A broad piece of armor carried on the arm for defense.', 'Knight barrier plate deflecting sword strikes', 180, 'DEHILS'),
    ('SOLAR', 5, 'MEDIUM', 'Astronomy', 'Relating to or determined by the sun.', 'Powered by golden radiant sunshine rays', 150, 'ALORS'),
    ('SPARK', 5, 'MEDIUM', 'Energy', 'A small fiery particle thrown off from a fire or electrical arc.', 'Tiny crackling energetic fire ember', 150, 'AKPRS'),
    ('STORM', 5, 'MEDIUM', 'Weather', 'A violent disturbance of the atmosphere with strong winds.', 'Tempest hurricane with thunder claps', 150, 'MORST'),
    ('SWORD', 5, 'MEDIUM', 'Weapon', 'A weapon with a long metal blade and hilt with hand guard.', 'Bladed forged steel weapon of duelists', 150, 'DORSW'),
    ('TIGER', 5, 'MEDIUM', 'Fauna', 'A very large solitary cat with a yellow-brown coat striped with black.', 'Majestic striped apex jungle feline predator', 150, 'EGIRT'),
    ('TITAN', 5, 'MEDIUM', 'Mythology', 'A person or thing of very great strength, intellect, or importance.', 'Gigantic primeval deity of immense power', 150, 'AINTT'),
    ('VIPER', 5, 'MEDIUM', 'Fauna', 'A venomous snake that has large hinged fangs.', 'Venomous coiled serpentine reptile with fangs', 150, 'EIPRV'),

    -- 6-Letter Hard Words
    ('BATTLE', 6, 'HARD', 'Conflict', 'A sustained fight between large organized armed forces.', 'Clash of opposing regiments on battlefield', 180, 'ABELTT'),
    ('CASTLE', 6, 'HARD', 'Architecture', 'A large fortified building or group of buildings.', 'Stone medieval fortress with moat and keep', 180, 'ACELST'),
    ('CIPHER', 6, 'HARD', 'Cryptography', 'A secret or disguised way of writing; a code.', 'Encrypted algorithmic cryptographic puzzle', 180, 'CEHIPR'),
    ('DANGER', 6, 'HARD', 'Safety', 'The possibility of suffering harm or injury.', 'Hazardous perilous risk of harm', 180, 'ADEGNR'),
    ('DRAGON', 6, 'HARD', 'Mythology', 'A mythical monster like a giant reptile breathing fire.', 'Scaly winged fire-breathing mythical beast', 180, 'ADGNOR'),
    ('ENERGY', 6, 'HARD', 'Physics', 'The strength and vitality required for sustained activity.', 'Physical force, electrical potential, or vigor', 180, 'EEGNRR'),
    ('ENGINE', 6, 'HARD', 'Mechanical', 'A machine with moving parts that converts power into motion.', 'Motor mechanical generator driving machines', 180, 'EEGINN'),
    ('FOREST', 6, 'HARD', 'Biome', 'A large area covered chiefly with trees and undergrowth.', 'Vast dense woodland canopy with wild fauna', 180, 'EFORST'),
    ('GALAXY', 6, 'HARD', 'Cosmos', 'A system of millions or billions of stars, together with gas and dust.', 'Vast swirling spiral cosmic stellar cluster', 180, 'AAGLXY'),
    ('HARBOR', 6, 'HARD', 'Maritime', 'A place on the coast where vessels may find shelter.', 'Sheltered deep water haven for docking ships', 180, 'ABHORR'),
    ('ISLAND', 6, 'HARD', 'Geography', 'A piece of land surrounded by water.', 'Isolated landmass encircled by deep sea', 180, 'ADILNS'),
    ('JUNGLE', 6, 'HARD', 'Biome', 'An area of land overgrown with dense forest and tangled vegetation.', 'Tropical rainforest tangle rich in wildlife', 180, 'EGJLNU'),
    ('KNIGHT', 6, 'HARD', 'History', 'A man awarded a nonhereditary title by a monarch.', 'Armored chivalric warrior sworn to noble oath', 180, 'GHIKNT'),
    ('LEGEND', 6, 'HARD', 'Storytelling', 'A traditional story sometimes popularly regarded as historical.', 'Mythic heroic fable passed across eras', 180, 'DEEGLN'),
    ('MAGNET', 6, 'HARD', 'Physics', 'A piece of iron or other material that produces a magnetic field.', 'Polarized metal attracting ferromagnetic ore', 180, 'AEGMNT'),
    ('MIRROR', 6, 'HARD', 'Optics', 'A reflective surface, usually of glass with a silvery metallic coating.', 'Silvered reflective glass showing true likeness', 180, 'IMORRR'),
    ('PLANET', 6, 'HARD', 'Astronomy', 'A celestial body moving in an elliptical orbit around a star.', 'Large spherical world orbiting our sun', 180, 'AELNPT'),
    ('PUZZLE', 6, 'HARD', 'Gaming', 'A game, problem, or toy that tests a person ingenuity.', 'Challenging mental riddle or enigma', 180, 'ELPUZZ'),
    ('ROCKET', 6, 'HARD', 'Aerospace', 'A cylindrical projectile that can be propelled to a great height.', 'Propelled orbital booster blasting to space', 180, 'CEKORT'),
    ('SECRET', 6, 'HARD', 'Information', 'Not known or seen or not meant to be known or seen by others.', 'Hidden classified riddle kept confidential', 180, 'CEERST'),
    ('SILVER', 6, 'HARD', 'Mineral', 'A precious shiny grayish-white metallic element.', 'Shimmering metallic currency element', 180, 'EILRSV'),
    ('SUMMER', 6, 'HARD', 'Season', 'The warmest season of the year, in the northern hemisphere from June to August.', 'Warm sunny beach vacation solstice season', 180, 'EMMRSU'),
    ('TARGET', 6, 'HARD', 'Precision', 'A person, object, or place selected as the aim of attack.', 'Bullseye circular focal point of archers', 180, 'AEGRTT'),
    ('WIZARD', 6, 'HARD', 'Fantasy', 'A man who has magical powers, especially in legends and fairy tales.', 'Staff-bearing spellcaster robes of arcane power', 180, 'ADIRWZ')
ON CONFLICT (word) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. SEED SAMPLE MATCH HISTORIES
-- ----------------------------------------------------------------------------
INSERT INTO game_rooms (id, room_code, host_player_id, guest_player_id, status, word_length, total_rounds, winner_player_id, is_bot_match, finished_at)
VALUES
    ('room_seed_101', 'EAGLE', 'usr_pilot_alpha', 'usr_bot_cyber', 'FINISHED', 5, 3, 'usr_pilot_alpha', TRUE, NOW() - INTERVAL '2 hours'),
    ('room_seed_102', 'STORM', 'usr_word_wizard', 'usr_challenger_1', 'FINISHED', 5, 3, 'usr_word_wizard', FALSE, NOW() - INTERVAL '5 hours'),
    ('room_seed_103', 'FROST', 'usr_admin_001', 'usr_pilot_alpha', 'FINISHED', 6, 3, 'usr_admin_001', FALSE, NOW() - INTERVAL '1 day');

INSERT INTO match_history (id, room_id, player1_id, player2_id, winner_id, p1_score, p2_score, p1_rounds_won, p2_rounds_won, p1_elo_delta, p2_elo_delta, total_rounds_played, match_duration_seconds, match_type, finished_at)
VALUES
    ('match_seed_201', 'room_seed_101', 'usr_pilot_alpha', 'usr_bot_cyber', 'usr_pilot_alpha', 280, 160, 2, 1, 15, -15, 3, 145, 'BOT_DUEL', NOW() - INTERVAL '2 hours'),
    ('match_seed_202', 'room_seed_102', 'usr_word_wizard', 'usr_challenger_1', 'usr_word_wizard', 320, 110, 3, 0, 18, -18, 3, 162, 'MULTIPLAYER', NOW() - INTERVAL '5 hours'),
    ('match_seed_203', 'room_seed_103', 'usr_admin_001', 'usr_pilot_alpha', 'usr_admin_001', 310, 240, 2, 1, 12, -12, 3, 210, 'MULTIPLAYER', NOW() - INTERVAL '1 day');
