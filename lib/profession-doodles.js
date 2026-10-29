import { DOODLE_CATEGORIES } from "./doodles.js";
import { CHARACTERS } from "./professions.js";
import { BOARD_DOODLES, getBoardDoodles } from "./board-doodles.js";
import { EXTRA_DOODLES, EXTRA_PROFESSION_LABELS } from "./extra-profession-doodles.js";

// Profession-specific symbols use the same outlined, colorful style as the library.
const icon = (label, body) => ({
  label,
  aspect: 1,
  alpha: true,
  src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="240" height="240" fill="none" stroke="#3a1d18" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  )
});

const symbols = [
  icon("Film slate", '<rect x="14" y="34" width="72" height="52" rx="6" fill="#5aa9f2"/><path d="M14 34 L10 16 L80 6 L84 24 Z" fill="#c9d3dd"/><path d="M24 14 L36 30 M46 11 L58 27 M67 8 L78 24 M26 52 H72 M26 66 H56"/>'),
  icon("Film reel", '<circle cx="50" cy="46" r="35" fill="#c9d3dd"/><circle cx="50" cy="46" r="6" fill="#3a1d18"/><circle cx="50" cy="24" r="9" fill="#fff3d6"/><circle cx="71" cy="45" r="9" fill="#fff3d6"/><circle cx="50" cy="67" r="9" fill="#fff3d6"/><circle cx="29" cy="45" r="9" fill="#fff3d6"/><path d="M72 73 Q98 90 64 91 H40"/>'),
  icon("Stage spotlight", '<path d="M53 34 L20 86 H86 L66 34" fill="#ffd24a" stroke="none"/><path d="M42 12 L74 24 L64 49 L32 37 Z" fill="#4b4f63"/><path d="M34 20 L19 15 M20 15 L14 31 M20 15 V7"/>'),
  icon("Dance shoes", '<path d="M20 12 L39 20 L31 51 Q31 64 17 69 Q5 68 11 53 Z" fill="#ff8fb1"/><path d="M62 28 L81 20 L91 65 Q93 79 78 82 Q66 78 67 64 Z" fill="#a78bfa"/><path d="M24 25 L34 33 M20 37 L31 44 M67 35 L83 43 M69 48 L86 57"/>'),
  icon("Fashion dress", '<path d="M34 10 L45 18 H55 L66 10 L73 29 L62 39 L82 88 H18 L38 39 L27 29 Z" fill="#ff8fb1"/><path d="M38 39 H62 M40 53 L33 78 M60 53 L67 78"/>'),
  icon("Video play", '<rect x="10" y="22" width="80" height="56" rx="15" fill="#e8384f"/><path d="M42 36 L65 50 L42 64 Z" fill="#fff3d6"/>'),
  icon("Trophy", '<path d="M30 12 H70 V38 Q70 62 50 64 Q30 62 30 38 Z" fill="#ffd24a"/><path d="M30 20 H14 V35 Q14 52 33 52 M70 20 H86 V35 Q86 52 67 52 M50 64 V80 M34 88 H66 M40 80 H60"/>'),
  icon("Football", '<circle cx="50" cy="50" r="39" fill="#fff3d6"/><path d="M50 29 L69 43 L62 65 H38 L31 43 Z" fill="#4b4f63"/><path d="M50 29 V11 M69 43 L87 35 M62 65 L74 82 M38 65 L26 82 M31 43 L13 35"/>'),
  icon("Cricket bat", '<g transform="rotate(35 50 50)"><rect x="45" y="5" width="10" height="28" rx="3" fill="#e8384f"/><path d="M38 33 H62 V82 Q50 96 38 82 Z" fill="#e8b36a"/><path d="M50 39 V79"/></g><circle cx="76" cy="76" r="11" fill="#e8384f"/><path d="M70 68 L81 83" stroke="#fff3d6" stroke-width="2"/>'),
  icon("Basketball", '<circle cx="50" cy="50" r="39" fill="#f59e3b"/><path d="M11 50 H89 M50 11 V89 M23 22 Q60 50 23 78 M77 22 Q40 50 77 78"/>'),
  icon("Tennis racket", '<g transform="rotate(35 50 50)"><ellipse cx="50" cy="33" rx="23" ry="28" fill="#5cc98a"/><path d="M38 14 V52 M50 7 V59 M62 14 V52 M29 25 H71 M29 39 H71 M35 51 H65" stroke-width="1.5"/><path d="M50 62 V90" stroke="#4b4f63" stroke-width="10"/></g>'),
  icon("Shuttlecock", '<path d="M15 14 L34 68 H66 L85 14 L65 22 L50 10 L35 22 Z" fill="#fff3d6"/><path d="M35 22 L43 68 M65 22 L57 68 M50 10 V68"/><path d="M34 68 H66 V77 Q50 98 34 77 Z" fill="#e8384f"/>'),
  icon("Swim goggles", '<path d="M11 39 Q27 24 44 39 V59 Q28 76 11 59 Z M56 39 Q73 24 89 39 V59 Q72 76 56 59 Z" fill="#9ad8ff"/><path d="M44 44 Q50 37 56 44 M11 44 L4 36 M89 44 L96 36"/><path d="M18 43 L28 36 M63 43 L73 36" stroke="#fff3d6"/>'),
  icon("Boxing glove", '<path d="M34 71 Q10 52 19 31 Q24 15 39 19 Q47 7 62 15 Q82 10 86 32 V60 L71 78 Z" fill="#e8384f"/><path d="M34 71 L71 78 L65 94 L27 86 Z" fill="#fff3d6"/><path d="M35 54 Q20 38 32 34 Q43 31 48 49"/>'),
  icon("Dumbbell", '<path d="M34 50 H66" stroke="#4b4f63" stroke-width="12"/><rect x="18" y="24" width="16" height="52" rx="4" fill="#5aa9f2"/><rect x="66" y="24" width="16" height="52" rx="4" fill="#5aa9f2"/><path d="M10 38 V62 M90 38 V62" stroke-width="9"/>'),
  icon("Stopwatch", '<circle cx="50" cy="57" r="32" fill="#9ad8ff"/><path d="M50 25 V13 M39 9 H61 M74 29 L82 21 M50 57 V37 M50 57 L64 66"/><circle cx="50" cy="57" r="3" fill="#e8384f"/>'),
  icon("Whistle", '<path d="M15 34 H67 V48 H88 V65 H62 Q52 85 31 74 Q10 65 15 34 Z" fill="#ffd24a"/><circle cx="36" cy="53" r="9" fill="#4b4f63"/><path d="M73 21 L79 12 M85 32 L95 28"/>'),
  icon("Stethoscope", '<path d="M22 12 V39 Q22 62 43 62 Q64 62 64 39 V12" stroke="#5aa9f2" stroke-width="7"/><path d="M43 62 V75 Q43 93 69 87 Q82 83 82 64"/><circle cx="82" cy="56" r="11" fill="#c9d3dd"/><path d="M18 12 H26 M60 12 H68" stroke-width="7"/>'),
  icon("Medical cross", '<rect x="12" y="18" width="76" height="70" rx="12" fill="#fff3d6"/><path d="M38 18 V9 H62 V18"/><path d="M43 32 H57 V46 H71 V60 H57 V74 H43 V60 H29 V46 H43 Z" fill="#e8384f"/>'),
  icon("Scales of justice", '<path d="M50 14 V82 M25 89 H75 M18 30 H82"/><path d="M24 30 L10 61 H38 Z M76 30 L62 61 H90 Z" fill="#ffd24a"/><circle cx="50" cy="14" r="6" fill="#f59e3b"/>'),
  icon("Judge gavel", '<g transform="rotate(-35 50 45)"><rect x="25" y="15" width="50" height="25" rx="5" fill="#a8683c"/><path d="M50 40 V78" stroke="#a8683c" stroke-width="13"/></g><path d="M19 88 H80 L75 78 H24 Z" fill="#a8683c"/>'),
  icon("Courthouse", '<path d="M8 32 L50 9 L92 32 Z" fill="#ffd24a"/><path d="M13 84 H87 M9 92 H91 M23 36 V80 M41 36 V80 M59 36 V80 M77 36 V80" stroke-width="8" stroke="#4b4f63"/>'),
  icon("Officer badge", '<path d="M50 8 Q66 21 84 20 V55 Q81 78 50 92 Q19 78 16 55 V20 Q34 21 50 8 Z" fill="#5aa9f2"/><path d="M50 27 L56 42 L73 43 L60 54 L64 71 L50 62 L36 71 L40 54 L27 43 L44 42 Z" fill="#ffd24a"/>'),
  icon("Service medal", '<path d="M24 8 H43 L57 48 L39 54 Z" fill="#e8384f"/><path d="M57 8 H76 L60 54 L43 48 Z" fill="#5aa9f2"/><circle cx="50" cy="68" r="23" fill="#ffd24a"/><path d="M50 52 L55 62 L66 64 L58 72 L60 83 L50 78 L40 83 L42 72 L34 64 L45 62 Z" fill="#f59e3b"/>'),
  icon("Anchor", '<circle cx="50" cy="16" r="9"/><path d="M50 25 V85 M30 38 H70 M15 60 Q15 83 50 90 Q85 83 85 60 M8 66 L15 56 L25 66 M75 66 L85 56 L92 66" stroke="#5aa9f2" stroke-width="6"/>'),
  icon("Airplane", '<path d="M44 9 Q50 2 56 9 V37 L91 59 V69 L56 57 V78 L68 88 V94 L50 87 L32 94 V88 L44 78 V57 L9 69 V59 L44 37 Z" fill="#9ad8ff"/>'),
  icon("Podium", '<path d="M22 42 H78 L69 88 H31 Z" fill="#a8683c"/><path d="M15 33 H85 V43 H15 Z" fill="#f59e3b"/><path d="M52 33 V21 L63 14"/><circle cx="66" cy="12" r="4" fill="#4b4f63"/>'),
  icon("Ballot box", '<path d="M16 43 H84 V89 H16 Z" fill="#5aa9f2"/><path d="M16 43 L29 30 H71 L84 43 M37 43 H63"/><path d="M37 8 L69 18 L58 46 L27 36 Z" fill="#fff3d6"/><path d="M39 24 L44 31 L56 23" stroke="#5cc98a"/>'),
  icon("Briefcase", '<rect x="10" y="28" width="80" height="60" rx="8" fill="#a8683c"/><path d="M35 28 V14 H65 V28 M10 48 Q50 67 90 48"/><rect x="43" y="48" width="14" height="18" rx="3" fill="#ffd24a"/>'),
  icon("Growth chart", '<path d="M15 13 V87 H91"/><path d="M27 76 V56 H40 V76 M49 76 V40 H62 V76 M71 76 V22 H84 V76" fill="#5cc98a"/><path d="M23 35 L47 24 L60 28 L85 9" stroke="#e8384f"/>'),
  icon("Code laptop", '<rect x="14" y="13" width="72" height="54" rx="6" fill="#9ad8ff"/><path d="M14 67 L5 83 H95 L86 67 Z" fill="#c9d3dd"/><path d="M38 30 L27 40 L38 50 M62 30 L73 40 L62 50 M55 26 L45 54"/>'),
  icon("App phone", '<rect x="27" y="6" width="46" height="88" rx="9" fill="#c9d3dd"/><rect x="33" y="20" width="34" height="54" rx="4" fill="#5aa9f2"/><path d="M43 12 H57 M47 84 H53 M44 36 L39 46 L44 56 M56 36 L61 46 L56 56"/>'),
  icon("Security lock", '<path d="M30 45 V29 Q30 8 50 8 Q70 8 70 29 V45" stroke-width="7"/><rect x="17" y="42" width="66" height="49" rx="9" fill="#5cc98a"/><circle cx="50" cy="61" r="6" fill="#3a1d18"/><path d="M50 67 V77" stroke-width="5"/>'),
  icon("AI robot", '<rect x="16" y="25" width="68" height="58" rx="13" fill="#9ad8ff"/><path d="M50 25 V14 M10 44 V64 M90 44 V64"/><circle cx="50" cy="10" r="5" fill="#e8384f"/><circle cx="35" cy="48" r="7" fill="#fff3d6"/><circle cx="65" cy="48" r="7" fill="#fff3d6"/><path d="M35 68 H65"/>'),
  icon("Microchip", '<rect x="23" y="23" width="54" height="54" rx="5" fill="#5cc98a"/><rect x="35" y="35" width="30" height="30" fill="#4b4f63"/><path d="M34 10 V23 M50 10 V23 M66 10 V23 M34 77 V90 M50 77 V90 M66 77 V90 M10 34 H23 M10 50 H23 M10 66 H23 M77 34 H90 M77 50 H90 M77 66 H90"/>'),
  icon("Safety helmet", '<path d="M17 68 V53 Q17 24 50 24 Q83 24 83 53 V68" fill="#ffd24a"/><path d="M43 61 V16 H57 V61" fill="#f59e3b"/><rect x="8" y="67" width="84" height="16" rx="6" fill="#ffd24a"/>'),
  icon("Engineering gear", '<path d="M42 8 H58 L62 23 L72 28 L87 24 L95 38 L84 49 V60 L94 70 L86 84 L71 80 L61 86 L57 98 H42 L38 85 L27 79 L13 83 L5 69 L16 58 V47 L6 37 L14 23 L29 27 L39 21 Z" fill="#c9d3dd"/><circle cx="50" cy="53" r="18" fill="#5aa9f2"/>'),
  icon("Building blueprint", '<rect x="12" y="10" width="76" height="80" rx="5" fill="#5aa9f2"/><path d="M25 72 V43 L50 24 L75 43 V72 Z M25 43 H75 M43 72 V53 H57 V72" stroke="#fff3d6"/><path d="M19 82 H81" stroke="#fff3d6" stroke-width="2"/>'),
  icon("Interior chair", '<rect x="28" y="12" width="44" height="48" rx="12" fill="#ff8fb1"/><path d="M20 49 H80 V74 H20 Z" fill="#a78bfa"/><path d="M28 74 V91 M72 74 V91 M17 39 V61 M83 39 V61"/>'),
  icon("Interface layout", '<rect x="10" y="14" width="80" height="72" rx="8" fill="#9ad8ff"/><path d="M10 32 H90 M20 23 H22 M30 23 H32"/><rect x="20" y="42" width="22" height="34" rx="3" fill="#a78bfa"/><rect x="51" y="42" width="29" height="12" rx="3" fill="#fff3d6"/><path d="M51 65 H80 M51 75 H70"/>'),
  icon("Event calendar", '<rect x="13" y="18" width="74" height="72" rx="8" fill="#fff3d6"/><path d="M13 39 H87"/><path d="M13 26 Q13 18 21 18 H79 Q87 18 87 26 V39 H13 Z" fill="#e8384f"/><path d="M30 9 V26 M70 9 V26 M32 60 L44 73 L68 49" stroke-width="5"/>')
];

const library = new Map([
  ...DOODLE_CATEGORIES.flatMap((category) => category.items),
  ...symbols,
  ...EXTRA_DOODLES,
  ...Object.values(BOARD_DOODLES)
].map((item) => [item.label, item]));
library.set("Badminton racket", { ...library.get("Tennis racket"), label: "Badminton racket" });

const music = ["Microphone", "Headphones", "Music note", "Notes", "Vinyl", "Speaker", "Boombox"];
const media = ["Retro camera", "Video play", "Microphone", "Film slate", "Stage spotlight"];
const writing = ["Pen", "Notebook", "Open book", "Sharp pencil", "Feather"];
const sport = ["Trophy", "Stopwatch", "Whistle", "Dumbbell", "Water bottle"];
const law = ["Scales of justice", "Judge gavel", "Courthouse", "Book", "Briefcase"];
const tech = ["Code laptop", "Computer", "Microchip", "App phone", "Bright idea"];
const engineering = ["Safety helmet", "Engineering gear", "Building blueprint", "Rulers", "Sharp pencil"];

export const PROFESSION_DOODLE_LABELS = {
  "Singer": music,
  "Actor / Actress": ["Film slate", "Film reel", "Stage spotlight", "Microphone", "Retro camera"],
  "Model": ["Fashion dress", "Retro camera", "Stage spotlight", "Sunglasses"],
  "Dancer": ["Dance shoes", "Dance sticker", "Music note", "Speaker", "Stage spotlight"],
  "Musician": [...music, "Guitar", "Piano"],
  "YouTuber": media,
  "Content Creator": [...media, "Creative", "App phone"],
  "Influencer": ["Retro camera", "App phone", "Video play", "Like", "Chat bubble"],
  "Comedian": ["Microphone", "Stage spotlight", "Laughing", "Grin", "Zany"],
  "Director": ["Film slate", "Film reel", "Retro camera", "Video play", "Notebook"],
  "Photographer": ["Retro camera", "Stage spotlight", "Film reel", "Computer"],
  "TV Presenter": ["Microphone", "Video play", "Retro camera", "Stage spotlight", "Notebook"],
  "Radio Jockey (RJ)": ["Microphone", "Headphones", "Boombox", "Speaker", "Vinyl"],
  "Writer": writing,
  "Journalist": [...writing, "Microphone", "Retro camera"],
  "Doctor": ["Stethoscope", "Medical cross", "Lab coat", "Bandage", "Plaster", "Molecule"],
  "Businessman": ["Briefcase", "Growth chart", "Money", "Computer", "Notebook"],
  "Athlete": sport,
  "Footballer": ["Football", "Trophy", "Whistle", "Stopwatch", "Water bottle"],
  "Cricketer": ["Cricket bat", "Trophy", "Whistle", "Stopwatch", "Water bottle"],
  "Basketball Player": ["Basketball", "Trophy", "Whistle", "Stopwatch", "Water bottle"],
  "Tennis Player": ["Tennis racket", "Trophy", "Stopwatch", "Water bottle"],
  "Badminton Player": ["Shuttlecock", "Badminton racket", "Trophy", "Stopwatch", "Water bottle"],
  "Swimmer": ["Swim goggles", "Swim shorts", "Stopwatch", "Trophy", "Water drop"],
  "Boxer": ["Boxing glove", "Dumbbell", "Stopwatch", "Trophy", "Water bottle"],
  "Fitness Trainer": ["Dumbbell", "Stopwatch", "Water bottle", "Growth chart"],
  "Lawyer": law,
  "Judge": law,
  "Police Officer": ["Officer badge", "Scales of justice", "Courthouse", "Notebook"],
  "Army Officer": ["Officer badge", "Service medal", "Notebook", "Briefcase"],
  "Navy Officer": ["Anchor", "Service medal", "Officer badge", "Globe"],
  "Air Force Officer": ["Airplane", "Service medal", "Officer badge", "Globe"],
  "Politician": ["Podium", "Ballot box", "Courthouse", "Microphone", "Globe"],
  "Government Officer": ["Courthouse", "Folder", "Notebook", "Pen", "Globe"],
  "Software Engineer": tech,
  "Web Developer": ["Code laptop", "Computer", "Globe", "App phone", "Bright idea"],
  "App Developer": ["App phone", "Code laptop", "Microchip", "Bright idea"],
  "Graphic Designer": ["Art", "Pen", "Computer", "Creative", "Rulers", "Sharp pencil"],
  "UI/UX Designer": ["App phone", "Computer", "Pen", "Creative", "Interface layout"],
  "Data Analyst": ["Growth chart", "Computer", "Code laptop", "Notebook"],
  "Cybersecurity Specialist": ["Security lock", "Code laptop", "Microchip", "Computer"],
  "IT Consultant": [...tech, "Briefcase"],
  "AI Engineer": ["AI robot", "Microchip", "Code laptop", "Growth chart", "Bright idea"],
  "Civil Engineer": engineering,
  "Electrical Engineer": ["Microchip", "Lightning bolt", "Power battery", "Engineering gear", "Safety helmet"],
  "Mechanical Engineer": ["Engineering gear", "Safety helmet", "Building blueprint", "Rulers"],
  "Architect": ["Building blueprint", "Little house", "Rulers", "Sharp pencil", "Safety helmet"],
  "Interior Designer": ["Interior chair", "Little house", "Building blueprint", "Rulers", "Art"],
  "Pilot": ["Airplane", "Globe", "Passport", "Suitcase", "Cloud"],
  "Event Manager": ["Event calendar", "Microphone", "Speaker", "Stage spotlight", "Gift", "Party"]
};

// The characters borrow the doodle sets of the older, more specific professions, plus a few new ones.
PROFESSION_DOODLE_LABELS["Gamer"] = ["Game controller", "Computer", "Lightning bolt", "Trophy", "Headphones", "Power battery", "Puzzle piece", "Alien", "Rocket", "Zap"];
PROFESSION_DOODLE_LABELS["Teacher"] = ["Open book", "Notebook", "Pen", "Rulers", "Grad cap", "Apple", "Bright idea", "Backpack", "Globe", "Pencil", "Bookshelf", "Highlighter"];
PROFESSION_DOODLE_LABELS["Traveller"] = ["Suitcase", "Passport", "Globe", "Camping tent", "Retro camera", "Travel", "Airplane", "Caravan", "Binoculars", "Compass", "Field map", "Sunglasses"];
const SHARED_SETS = {
  Corporate: ["Businessman"],
  Entrepreneur: ["Businessman", "IT Consultant"],
  Engineer: ["Civil Engineer", "Mechanical Engineer"]
};

function relatedDoodles(profession) {
  const boardDoodles = getBoardDoodles(profession);
  const replacedLabels = new Set(boardDoodles.flatMap((item) => [item.label, ...item.replaces]));
  const existing = (PROFESSION_DOODLE_LABELS[profession] || [])
    .filter((label) => !replacedLabels.has(label))
    .map((label) => library.get(label));
  const extra = (EXTRA_PROFESSION_LABELS[profession] || [])
    .filter((label) => !replacedLabels.has(label))
    .map((label) => library.get(label));
  const seenLabels = new Set();
  const seenImages = new Set();
  return [...boardDoodles, ...existing, ...extra].filter((item) => {
    if (!item) throw new Error(`Missing doodle artwork for ${profession}`);
    if (seenLabels.has(item.label) || seenImages.has(item.src)) return false;
    seenLabels.add(item.label);
    seenImages.add(item.src);
    return true;
  });
}

// The visitor's NESCAFÉ character comes first, followed by the doodles that go with the profession.
export function getProfessionDoodles(profession) {
  const character = CHARACTERS.find((item) => item.name === profession);
  const related = (SHARED_SETS[profession] || [profession]).flatMap((name) => relatedDoodles(name));
  const characterDoodle = character ? [{ label: `${character.name} character`, src: character.src, aspect: character.aspect, alpha: true }] : [];
  const seen = new Set();
  return [...characterDoodle, ...related].filter((item) => {
    if (seen.has(item.label) || seen.has(item.src)) return false;
    seen.add(item.label);
    seen.add(item.src);
    return true;
  }).slice(0, 18);
}
