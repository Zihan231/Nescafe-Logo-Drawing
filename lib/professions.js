// The ten NESCAFÉ characters (from "All character Nescafe.ai"). Each one is a profession the visitor can pick;
// its artwork also becomes the first doodle in the editor. aspect is height / width, like every other doodle.
export const CHARACTERS = [
  { name: "Musician", slug: "musician", aspect: 1000 / 658 },
  { name: "Influencer", slug: "influencer", aspect: 1000 / 453 },
  { name: "Gamer", slug: "gamer", aspect: 1000 / 578 },
  { name: "Doctor", slug: "doctor", aspect: 1000 / 412 },
  { name: "Player", slug: "footballer", aspect: 1000 / 515 },
  { name: "Corporate", slug: "corporate", aspect: 1000 / 565 },
  { name: "Traveller", slug: "traveller", aspect: 1000 / 765 },
  { name: "Engineer", slug: "engineer", aspect: 1000 / 442 },
  { name: "Teacher", slug: "teacher", aspect: 1000 / 470 },
  { name: "Entrepreneur", slug: "entrepreneur", aspect: 1000 / 449 }
].map((character) => ({ ...character, src: `/assets/characters/${character.slug}.webp` }));

export const PROFESSIONS = CHARACTERS.map((character) => character.name);

// Old names of current professions, as stored on designs sent before they were renamed.
export const FORMER_PROFESSION_NAMES = { Player: ["Footballer"] };

// The current profession a stored name belongs to (Footballer -> Player), or null for one no longer offered.
export function currentProfession(name) {
  if (PROFESSIONS.includes(name)) return name;
  return Object.keys(FORMER_PROFESSION_NAMES).find((key) => FORMER_PROFESSION_NAMES[key].includes(name)) || null;
}
