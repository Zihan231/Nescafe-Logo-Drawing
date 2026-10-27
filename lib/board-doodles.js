// Original vector artwork extracted from the user-supplied Illustrator board.
// Bounds and original path counts are recorded beside the SVGs in manifest.json.
const assets = [
  ["headphones", "Headphones", 1.1132],
  ["guitar", "Guitar", 0.8962],
  ["music-notes", "Music notes", 1.6391],
  ["music-note", "Music note", 0.9625],
  ["guitarist", "Guitarist", 0.9057],
  ["music-listener", "Music listener", 1.2249],
  ["dancer", "Dancer", 1.0989],
  ["jumping-dancer", "Jumping dancer", 1.1102],
  ["skater", "Street dancer", 1.0078],
  ["photographer", "Photographer", 1.6273],
  ["camera", "Camera", 0.9276],
  ["football", "Football", 0.9511],
  ["basketball", "Basketball", 0.9517],
  ["trophy", "Trophy", 1.0575],
  ["medal", "Medal", 1.356],
  ["stopwatch", "Stopwatch", 1.1061],
  ["tennis-ball", "Tennis ball", 0.949],
  ["laptop", "Laptop", 0.7796],
  ["phone", "Phone", 1.1969],
  ["game-controller", "Game controller", 0.8725],
  ["rocket", "Rocket", 1.8582],
  ["globe", "Globe", 0.946],
  ["lightning", "Lightning", 1.2215],
  ["pen", "Pencil", 0.7806],
  ["paintbrush", "Paintbrush", 2.5239],
  ["potted-flower", "Potted flower", 2.0002],
  ["coffee-leaves", "Coffee leaves", 0.8311],
  ["sunglasses", "Sunglasses", 1.072],
  ["cap", "Cap", 0.6419],
  ["coffee-break", "Coffee break", 1.0423],
  ["reading", "Reading", 0.7086],
  ["red-mug", "Red NESCAFE mug", 1.0199],
  ["steaming-coffee", "Steaming coffee", 1.8794],
  ["takeaway-coffee", "Takeaway coffee", 1.237],
  ["coffee-jar", "Coffee jar", 1.2358],
  ["skateboard", "Skateboard", 0.8912],
];

const replacements = {
  camera: ["Retro camera"],
  laptop: ["Computer", "Code laptop"],
  phone: ["App phone", "Flip phone"],
  pen: ["Pen", "Pencil", "Sharp pencil"],
  "music-notes": ["Notes"]
};

export const BOARD_DOODLES = Object.fromEntries(assets.map(([slug, label, aspect]) => [
  slug,
  { label, src: `/assets/doodles/nescafe-board/${slug}.svg`, aspect, alpha: true,
    replaces: replacements[slug] || [] }
]));

// Only assign artwork that is relevant to the profession; coffee and generic
// decorations remain available as extracted assets without appearing for every role.
export const BOARD_PROFESSION_DOODLES = {
  "Singer": [
    "guitarist",
    "headphones",
    "music-note",
    "music-notes",
    "guitar",
    "music-listener"
  ],
  "Actor / Actress": [
    "camera",
    "photographer"
  ],
  "Model": [
    "camera",
    "sunglasses",
    "cap"
  ],
  "Dancer": [
    "dancer",
    "jumping-dancer",
    "skater",
    "music-notes"
  ],
  "Musician": [
    "guitarist",
    "guitar",
    "headphones",
    "music-note",
    "music-notes",
    "music-listener"
  ],
  "YouTuber": [
    "camera",
    "phone",
    "headphones"
  ],
  "Content Creator": [
    "camera",
    "photographer",
    "phone",
    "headphones"
  ],
  "Influencer": [
    "camera",
    "phone",
    "sunglasses"
  ],
  "Director": [
    "camera",
    "photographer"
  ],
  "Photographer": [
    "photographer",
    "camera"
  ],
  "TV Presenter": [
    "camera",
    "headphones"
  ],
  "Radio Jockey (RJ)": [
    "headphones",
    "music-notes",
    "music-listener"
  ],
  "Writer": [
    "reading",
    "pen"
  ],
  "Journalist": [
    "camera",
    "phone",
    "pen"
  ],
  "Businessman": [
    "laptop",
    "phone",
    "globe"
  ],
  "Athlete": [
    "football",
    "basketball",
    "trophy",
    "medal",
    "stopwatch",
    "skateboard"
  ],
  "Footballer": [
    "football",
    "trophy",
    "medal",
    "stopwatch"
  ],
  "Cricketer": [
    "trophy",
    "medal",
    "stopwatch"
  ],
  "Basketball Player": [
    "basketball",
    "trophy",
    "medal",
    "stopwatch"
  ],
  "Tennis Player": [
    "tennis-ball",
    "trophy",
    "medal",
    "stopwatch"
  ],
  "Badminton Player": [
    "trophy",
    "medal",
    "stopwatch"
  ],
  "Swimmer": [
    "trophy",
    "medal",
    "stopwatch"
  ],
  "Boxer": [
    "trophy",
    "medal",
    "stopwatch"
  ],
  "Fitness Trainer": [
    "stopwatch",
    "trophy",
    "medal"
  ],
  "Lawyer": [
    "reading",
    "pen"
  ],
  "Judge": [
    "reading"
  ],
  "Army Officer": [
    "globe"
  ],
  "Navy Officer": [
    "globe"
  ],
  "Air Force Officer": [
    "globe"
  ],
  "Politician": [
    "globe",
    "phone"
  ],
  "Government Officer": [
    "laptop",
    "pen"
  ],
  "Software Engineer": [
    "laptop",
    "phone"
  ],
  "Web Developer": [
    "laptop",
    "phone",
    "globe"
  ],
  "App Developer": [
    "phone",
    "laptop"
  ],
  "Graphic Designer": [
    "pen",
    "paintbrush",
    "laptop"
  ],
  "UI/UX Designer": [
    "phone",
    "laptop",
    "pen"
  ],
  "Data Analyst": [
    "laptop",
    "pen"
  ],
  "Cybersecurity Specialist": [
    "laptop",
    "phone"
  ],
  "IT Consultant": [
    "laptop",
    "phone",
    "globe"
  ],
  "AI Engineer": [
    "laptop",
    "phone"
  ],
  "Civil Engineer": [
    "pen",
    "laptop"
  ],
  "Electrical Engineer": [
    "lightning",
    "laptop"
  ],
  "Mechanical Engineer": [
    "pen",
    "laptop"
  ],
  "Architect": [
    "pen",
    "laptop"
  ],
  "Interior Designer": [
    "paintbrush",
    "pen",
    "potted-flower",
    "laptop"
  ],
  "Pilot": [
    "globe"
  ],
  "Event Manager": [
    "camera",
    "phone"
  ]
};

export function getBoardDoodles(profession) {
  return (BOARD_PROFESSION_DOODLES[profession] || []).map((slug) => BOARD_DOODLES[slug]);
}
