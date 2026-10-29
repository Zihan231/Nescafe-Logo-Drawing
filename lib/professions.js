// The ten NESCAFÉ characters (from "All character Nescafe.ai"). Each one is a profession the visitor can pick;
// its artwork also becomes the first doodle in the editor. aspect is height / width, like every other doodle.
export const CHARACTERS = [
  { name: "Musician", slug: "musician", aspect: 1000 / 658 },
  { name: "Influencer", slug: "influencer", aspect: 1000 / 453 },
  { name: "Gamer", slug: "gamer", aspect: 1000 / 578 },
  { name: "Doctor", slug: "doctor", aspect: 1000 / 412 },
  { name: "Footballer", slug: "footballer", aspect: 1000 / 515 },
  { name: "Corporate", slug: "corporate", aspect: 1000 / 565 },
  { name: "Traveller", slug: "traveller", aspect: 1000 / 765 },
  { name: "Engineer", slug: "engineer", aspect: 1000 / 442 },
  { name: "Teacher", slug: "teacher", aspect: 1000 / 470 },
  { name: "Entrepreneur", slug: "entrepreneur", aspect: 1000 / 449 }
].map((character) => ({ ...character, src: `/assets/characters/${character.slug}.webp` }));

export const PROFESSIONS = CHARACTERS.map((character) => character.name);
