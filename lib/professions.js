// The ten NESCAFÉ characters (from "All character Nescafe.ai"). Each one is a profession the visitor can pick;
// its artwork also becomes the first doodle in the editor.
export const CHARACTERS = [
  { name: "Musician", slug: "musician", aspect: 659 / 1000 },
  { name: "Influencer", slug: "influencer", aspect: 454 / 1000 },
  { name: "Gamer", slug: "gamer", aspect: 578 / 1000 },
  { name: "Doctor", slug: "doctor", aspect: 414 / 1000 },
  { name: "Footballer", slug: "footballer", aspect: 513 / 1000 },
  { name: "Corporate", slug: "corporate", aspect: 564 / 1000 },
  { name: "Traveller", slug: "traveller", aspect: 685 / 1000 },
  { name: "Engineer", slug: "engineer", aspect: 442 / 1000 },
  { name: "Teacher", slug: "teacher", aspect: 470 / 1000 },
  { name: "Entrepreneur", slug: "entrepreneur", aspect: 449 / 1000 }
].map((character) => ({ ...character, src: `/assets/characters/${character.slug}.webp` }));

export const PROFESSIONS = CHARACTERS.map((character) => character.name);
