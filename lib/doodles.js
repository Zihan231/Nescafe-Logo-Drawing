// Hand-drawn style SVG doodles, grouped by category. Each is a 100x100 drawing
// turned into a data URI, so they need no files and stay sharp at any size.
// Fills avoid pure white: the editor strips near-white pixels when it exports.

const C = {
  red: "#e8384f",
  orange: "#f59e3b",
  yellow: "#ffd24a",
  green: "#5cc98a",
  blue: "#5aa9f2",
  pink: "#ff8fb1",
  brown: "#a8683c",
  cream: "#fff3d6",
  dark: "#3a1d18",
  gray: "#c9d3dd",
  slate: "#4b4f63",
  purple: "#a78bfa",
  sky: "#9ad8ff"
};

const toUri = (body) =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="240" height="240" fill="none" stroke="${C.dark}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  );

const make = (label, body) => ({ label, src: toUri(body), aspect: 1, alpha: true });

const heartPath = "M50 88 C10 56 10 22 32 18 C42 16 48 24 50 30 C52 24 58 16 68 18 C90 22 90 56 50 88 Z";

const food = [
  make("Pizza", `<path d="M50 90 L14 24 Q50 8 86 24 Z" fill="${C.yellow}"/><path d="M14 24 Q50 8 86 24" stroke="${C.brown}" stroke-width="9"/><circle cx="42" cy="38" r="6" fill="${C.red}"/><circle cx="62" cy="44" r="5" fill="${C.red}"/><circle cx="50" cy="63" r="5" fill="${C.red}"/>`),
  make("Burger", `<path d="M14 46 Q14 16 50 16 Q86 16 86 46 Z" fill="${C.orange}"/><path d="M34 28 l4 2 M52 24 l4 2 M66 34 l4 2 M44 38 l4 2" stroke="${C.cream}" stroke-width="3"/><path d="M14 52 q6 8 12 0 t12 0 t12 0 t12 0 t12 0 t12 0" stroke="${C.green}" stroke-width="7"/><rect x="14" y="60" width="72" height="13" rx="6.5" fill="${C.brown}"/><path d="M14 77 H86 Q86 88 74 88 H26 Q14 88 14 77 Z" fill="${C.orange}"/>`),
  make("Donut", `<circle cx="50" cy="50" r="36" fill="${C.orange}"/><path d="M18 46 Q20 20 50 18 Q80 20 82 46 Q76 40 70 48 Q63 38 56 50 Q49 38 42 50 Q34 40 28 48 Q23 42 18 46 Z" fill="${C.pink}"/><circle cx="50" cy="50" r="9" fill="${C.cream}"/><path d="M34 30 l5 3 M62 28 l-5 4 M70 42 l-5 -1 M30 44 l5 1" stroke="${C.yellow}" stroke-width="3.5"/><path d="M52 30 l4 4 M44 24 l5 1" stroke="${C.blue}" stroke-width="3.5"/>`),
  make("Fries", `<rect x="28" y="20" width="10" height="42" rx="3" fill="${C.yellow}"/><rect x="39" y="12" width="10" height="50" rx="3" fill="${C.yellow}"/><rect x="50" y="18" width="10" height="44" rx="3" fill="${C.yellow}"/><rect x="61" y="24" width="10" height="38" rx="3" fill="${C.yellow}"/><path d="M24 54 H76 L70 90 H30 Z" fill="${C.red}"/><path d="M40 62 q10 8 20 0" stroke="${C.cream}" stroke-width="3"/>`),
  make("Ice cream", `<path d="M32 50 L50 92 L68 50 Z" fill="#e8b36a"/><path d="M38 60 L58 60 M43 72 L55 72" stroke="${C.brown}" stroke-width="2.5"/><circle cx="50" cy="38" r="22" fill="${C.pink}"/><path d="M30 46 q4 12 9 0 q5 12 11 0 q5 12 11 0 q4 12 9 0" fill="${C.pink}"/><circle cx="50" cy="12" r="5" fill="${C.red}"/>`),
  make("Cupcake", `<path d="M24 54 L30 90 H70 L76 54 Z" fill="${C.blue}"/><path d="M38 56 L40 88 M50 56 V88 M62 56 L60 88" stroke="${C.dark}" stroke-width="2.5"/><path d="M20 54 Q14 36 34 34 Q36 18 50 18 Q64 18 66 34 Q86 36 80 54 Z" fill="${C.pink}"/><circle cx="50" cy="12" r="5" fill="${C.red}"/>`),
  make("Taco", `<path d="M10 72 A40 40 0 0 1 90 72 Z" fill="${C.yellow}"/><path d="M18 52 q6 -8 12 0 t12 0 t12 0 t12 0 t10 0" stroke="${C.green}" stroke-width="7"/><circle cx="36" cy="62" r="4.5" fill="${C.red}"/><circle cx="54" cy="60" r="4.5" fill="${C.red}"/><circle cx="70" cy="64" r="4.5" fill="${C.red}"/>`),
  make("Watermelon", `<path d="M8 36 A42 42 0 0 0 92 36 Z" fill="${C.red}"/><path d="M8 36 A42 42 0 0 0 92 36" stroke="${C.green}" stroke-width="8"/><ellipse cx="36" cy="52" rx="2.6" ry="4" fill="${C.dark}"/><ellipse cx="50" cy="62" rx="2.6" ry="4" fill="${C.dark}"/><ellipse cx="64" cy="52" rx="2.6" ry="4" fill="${C.dark}"/>`)
];

const music = [
  make("Note", `<ellipse cx="36" cy="76" rx="15" ry="11" fill="${C.red}"/><path d="M49 74 V16 Q76 20 78 44"/>`),
  make("Notes", `<ellipse cx="28" cy="76" rx="13" ry="10" fill="${C.blue}"/><ellipse cx="68" cy="68" rx="13" ry="10" fill="${C.blue}"/><path d="M39 74 V26 M79 66 V18"/><path d="M39 26 L79 18 V32 L39 40 Z" fill="${C.dark}"/>`),
  make("Headphones", `<path d="M18 58 V50 A32 32 0 0 1 82 50 V58" stroke-width="5"/><rect x="10" y="54" width="20" height="32" rx="9" fill="${C.pink}"/><rect x="70" y="54" width="20" height="32" rx="9" fill="${C.pink}"/>`),
  make("Microphone", `<rect x="36" y="10" width="28" height="44" rx="14" fill="${C.gray}"/><path d="M36 26 H64 M36 36 H64" stroke-width="2.5"/><path d="M24 44 A26 26 0 0 0 76 44"/><path d="M50 70 V86 M34 88 H66"/>`),
  make("Vinyl", `<circle cx="50" cy="50" r="40" fill="#2b2b33"/><circle cx="50" cy="50" r="30" stroke="#6b6b78" stroke-width="2"/><circle cx="50" cy="50" r="22" stroke="#6b6b78" stroke-width="2"/><circle cx="50" cy="50" r="12" fill="${C.red}"/><circle cx="50" cy="50" r="3" fill="${C.cream}" stroke-width="2"/>`),
  make("Guitar", `<g transform="rotate(40 50 50)"><rect x="46" y="6" width="8" height="42" fill="${C.brown}"/><rect x="43" y="-2" width="14" height="12" rx="3" fill="${C.dark}"/><path d="M50 40 C28 40 26 58 36 64 C24 72 28 94 50 94 C72 94 76 72 64 64 C74 58 72 40 50 40 Z" fill="${C.orange}"/><circle cx="50" cy="68" r="7" fill="${C.dark}"/></g>`),
  make("Speaker", `<rect x="22" y="10" width="56" height="80" rx="10" fill="${C.slate}"/><circle cx="50" cy="32" r="9" fill="${C.gray}"/><circle cx="50" cy="64" r="18" fill="${C.gray}"/><circle cx="50" cy="64" r="7" fill="${C.slate}"/>`),
  make("Piano", `<rect x="10" y="24" width="80" height="52" rx="6" fill="${C.cream}"/><path d="M26 50 V76 M42 50 V76 M58 50 V76 M74 50 V76" stroke-width="2.5"/><rect x="21" y="24" width="10" height="32" rx="2" fill="${C.dark}"/><rect x="37" y="24" width="10" height="32" rx="2" fill="${C.dark}"/><rect x="53" y="24" width="10" height="32" rx="2" fill="${C.dark}"/><rect x="69" y="24" width="10" height="32" rx="2" fill="${C.dark}"/>`)
];

const vibe = [
  make("Sparkle", `<path d="M50 6 Q54 46 94 50 Q54 54 50 94 Q46 54 6 50 Q46 46 50 6 Z" fill="${C.yellow}"/>`),
  make("Lightning", `<path d="M58 6 L22 54 H46 L38 94 L80 40 H54 Z" fill="${C.yellow}"/>`),
  make("Sun", `<circle cx="50" cy="50" r="20" fill="${C.yellow}"/><path d="M50 12 V22 M50 78 V88 M12 50 H22 M78 50 H88 M23 23 L30 30 M70 70 L77 77 M77 23 L70 30 M30 70 L23 77"/><circle cx="43" cy="47" r="2" fill="${C.dark}"/><circle cx="57" cy="47" r="2" fill="${C.dark}"/><path d="M42 56 Q50 63 58 56" stroke-width="3"/>`),
  make("Moon", `<path d="M60 10 A40 40 0 1 0 90 62 A32 32 0 0 1 60 10 Z" fill="${C.yellow}"/><path d="M78 20 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" fill="${C.cream}" stroke-width="2.5"/>`),
  make("Rainbow", `<path d="M10 74 A40 40 0 0 1 90 74" stroke="${C.red}" stroke-width="9"/><path d="M19 74 A31 31 0 0 1 81 74" stroke="${C.yellow}" stroke-width="9"/><path d="M28 74 A22 22 0 0 1 72 74" stroke="${C.blue}" stroke-width="9"/><circle cx="14" cy="76" r="9" fill="${C.cream}"/><circle cx="86" cy="76" r="9" fill="${C.cream}"/>`),
  make("Flame", `<path d="M50 92 C24 92 18 66 32 48 C34 58 40 60 43 57 C38 38 48 20 58 8 C60 30 82 42 80 68 C80 82 68 92 50 92 Z" fill="${C.orange}"/><path d="M50 92 C38 92 36 78 44 68 C46 74 52 74 54 70 C58 78 62 92 50 92 Z" fill="${C.yellow}" stroke-width="2.5"/>`),
  make("Cool face", `<circle cx="50" cy="50" r="40" fill="${C.yellow}"/><path d="M18 40 H82 L76 56 Q70 62 62 56 L58 48 H42 L38 56 Q30 62 24 56 Z" fill="${C.dark}"/><path d="M34 70 Q50 84 66 70" stroke-width="4"/>`),
  make("Peace", `<circle cx="50" cy="50" r="38" fill="${C.sky}"/><path d="M50 12 V88 M50 50 L24 76 M50 50 L76 76"/>`)
];

const school = [
  make("Pencil", `<g transform="rotate(45 50 50)"><rect x="41" y="14" width="18" height="58" fill="${C.yellow}"/><path d="M41 72 L59 72 L50 94 Z" fill="#f6d6a8"/><path d="M46 85 L54 85 L50 94 Z" fill="${C.dark}" stroke-width="1.5"/><rect x="41" y="4" width="18" height="12" rx="3" fill="${C.pink}"/><path d="M41 22 H59" stroke-width="2.5"/></g>`),
  make("Book", `<rect x="22" y="10" width="58" height="80" rx="5" fill="${C.blue}"/><path d="M32 10 V90" stroke-width="3"/><rect x="42" y="24" width="28" height="18" rx="3" fill="${C.cream}" stroke-width="2.5"/><path d="M44 54 H70 M44 64 H62" stroke="${C.cream}" stroke-width="3"/>`),
  make("Backpack", `<path d="M30 36 Q30 12 50 12 Q70 12 70 36" stroke-width="5"/><path d="M26 38 Q26 22 50 22 Q74 22 74 38 V84 Q74 90 68 90 H32 Q26 90 26 84 Z" fill="${C.pink}"/><rect x="34" y="56" width="32" height="24" rx="5" fill="${C.cream}"/><path d="M34 66 H66" stroke-width="2.5"/><path d="M40 38 H60" stroke-width="3"/>`),
  make("Grad cap", `<path d="M26 52 V70 Q50 86 74 70 V52 L50 64 Z" fill="${C.slate}"/><path d="M50 18 L94 40 L50 62 L6 40 Z" fill="${C.dark}"/><path d="M88 44 V70" stroke="${C.yellow}" stroke-width="4"/><circle cx="88" cy="74" r="5" fill="${C.yellow}" stroke-width="2.5"/>`),
  make("Ruler", `<g transform="rotate(-35 50 50)"><rect x="6" y="36" width="88" height="28" rx="4" fill="${C.yellow}"/><path d="M18 36 V48 M30 36 V44 M42 36 V48 M54 36 V44 M66 36 V48 M78 36 V44" stroke-width="3"/></g>`),
  make("Apple", `<path d="M50 32 C34 20 12 32 16 58 C20 82 38 94 50 88 C62 94 80 82 84 58 C88 32 66 20 50 32 Z" fill="${C.red}"/><path d="M50 32 Q50 20 56 12" stroke-width="4"/><path d="M54 26 Q58 10 74 10 Q72 26 54 26 Z" fill="${C.green}"/>`),
  make("Notebook", `<rect x="24" y="10" width="56" height="80" rx="5" fill="${C.cream}"/><path d="M36 10 V90" stroke="${C.red}" stroke-width="2.5"/><path d="M44 30 H70 M44 44 H70 M44 58 H70 M44 72 H62" stroke="${C.blue}" stroke-width="2.5"/><path d="M18 20 h12 M18 34 h12 M18 48 h12 M18 62 h12 M18 76 h12"/>`),
  make("Idea", `<path d="M50 8 C28 8 20 28 28 44 C32 52 38 56 38 66 H62 C62 56 68 52 72 44 C80 28 72 8 50 8 Z" fill="${C.yellow}"/><rect x="38" y="66" width="24" height="10" rx="3" fill="${C.gray}"/><path d="M42 84 H58" stroke-width="4"/>`)
];

const coffee = [
  make("Coffee cup", `<path d="M28 6 q-6 8 0 14 M46 4 q-6 8 0 14 M64 6 q-6 8 0 14" stroke-width="3"/><path d="M16 38 H72 V58 Q72 82 44 82 Q16 82 16 58 Z" fill="${C.cream}"/><path d="M72 44 H80 Q92 44 92 56 Q92 68 78 68 H70"/><path d="M16 38 H72" stroke-width="5" stroke="${C.brown}"/><ellipse cx="44" cy="88" rx="32" ry="5" fill="${C.gray}" stroke-width="3"/>`),
  make("Coffee beans", `<g transform="rotate(-30 36 40)"><ellipse cx="36" cy="40" rx="22" ry="30" fill="${C.brown}"/><path d="M36 12 Q28 40 36 68" stroke="${C.dark}"/></g><g transform="rotate(30 66 64)"><ellipse cx="66" cy="64" rx="20" ry="28" fill="#c0824f"/><path d="M66 38 Q58 64 66 90" stroke="${C.dark}"/></g>`),
  make("Heart mug", `<path d="M20 28 H72 V62 Q72 88 46 88 Q20 88 20 62 Z" fill="${C.pink}"/><path d="M72 36 H80 Q92 36 92 48 Q92 62 78 62 H70"/><path d="M46 70 C32 60 32 46 40 44 C44 43 46 46 46 48 C46 46 48 43 52 44 C60 46 60 60 46 70 Z" fill="${C.cream}" stroke-width="2.5"/><path d="M34 12 q-5 6 0 12 M52 10 q-5 6 0 12" stroke-width="3"/>`),
  make("Takeaway cup", `<rect x="18" y="12" width="64" height="14" rx="5" fill="${C.dark}"/><path d="M24 26 H76 L68 90 H32 Z" fill="${C.cream}"/><path d="M28 46 H72 L70 66 H30 Z" fill="${C.red}"/>`),
  make("Coffee jar", `<rect x="24" y="8" width="52" height="18" rx="5" fill="${C.red}"/><rect x="24" y="26" width="52" height="64" rx="9" fill="${C.brown}"/><rect x="32" y="40" width="36" height="34" rx="6" fill="${C.cream}" stroke-width="2.5"/><path d="M42 50 q-3 5 0 9 M50 48 q-3 5 0 9 M58 50 q-3 5 0 9" stroke="${C.brown}" stroke-width="2.5"/>`),
  make("Croissant", `<path d="M10 66 Q14 26 50 22 Q86 26 90 66 Q78 56 72 68 Q64 48 50 50 Q36 48 28 68 Q22 56 10 66 Z" fill="${C.orange}"/><path d="M32 30 Q36 44 38 56 M50 24 V50 M68 30 Q64 44 62 56" stroke-width="2.5"/>`),
  make("Iced coffee", `<path d="M62 6 L52 52" stroke="${C.red}" stroke-width="6"/><path d="M26 28 H74 L68 90 H32 Z" fill="#e8c9a4"/><path d="M29 52 H71 L68 90 H32 Z" fill="${C.brown}"/><rect x="36" y="34" width="14" height="14" rx="3" fill="${C.sky}" stroke-width="2.5" transform="rotate(-10 43 41)"/><rect x="52" y="38" width="13" height="13" rx="3" fill="${C.sky}" stroke-width="2.5" transform="rotate(12 58 44)"/>`),
  make("Moka pot", `<path d="M38 14 H62 L58 26 H42 Z" fill="${C.gray}"/><path d="M42 26 L30 56 H70 L58 26 Z" fill="${C.gray}"/><rect x="28" y="56" width="44" height="8" rx="2" fill="${C.slate}"/><path d="M32 64 H68 L74 90 H26 Z" fill="${C.gray}"/><path d="M62 18 H76 Q86 18 86 30 Q86 42 74 44" stroke-width="4"/>`)
];

const drinks = [
  make("Soda", `<path d="M62 4 L52 24" stroke="${C.red}" stroke-width="6"/><rect x="22" y="22" width="56" height="10" rx="4" fill="${C.dark}"/><path d="M26 32 H74 L68 90 H32 Z" fill="${C.red}"/><circle cx="50" cy="60" r="12" fill="${C.cream}" stroke-width="2.5"/>`),
  make("Bubble tea", `<path d="M60 2 L54 40" stroke="${C.green}" stroke-width="8"/><rect x="20" y="30" width="60" height="9" rx="4" fill="${C.pink}"/><path d="M24 39 H76 L70 90 H30 Z" fill="#f0d4b8"/><path d="M27 62 H73 L70 90 H30 Z" fill="${C.brown}"/><circle cx="40" cy="80" r="4.5" fill="${C.dark}"/><circle cx="52" cy="82" r="4.5" fill="${C.dark}"/><circle cx="62" cy="78" r="4.5" fill="${C.dark}"/><circle cx="46" cy="70" r="4.5" fill="${C.dark}"/><circle cx="58" cy="68" r="4.5" fill="${C.dark}"/>`),
  make("Juice box", `<path d="M62 2 V16 H72" stroke-width="3.5"/><rect x="26" y="16" width="48" height="74" rx="6" fill="${C.orange}"/><circle cx="50" cy="52" r="15" fill="${C.yellow}"/><path d="M50 37 V67 M35 52 H65 M39 41 L61 63 M61 41 L39 63" stroke-width="2"/>`),
  make("Cocktail", `<path d="M70 6 L48 40" stroke="${C.red}" stroke-width="4"/><path d="M12 22 H88 L50 62 Z" fill="${C.sky}"/><path d="M50 62 V86 M30 90 H70"/><circle cx="76" cy="24" r="9" fill="${C.green}" stroke-width="3"/>`),
  make("Bottle", `<rect x="42" y="6" width="16" height="10" rx="3" fill="${C.dark}"/><path d="M42 16 H58 V28 Q70 34 70 48 V86 Q70 92 64 92 H36 Q30 92 30 86 V48 Q30 34 42 28 Z" fill="${C.sky}"/><path d="M30 56 H70 V76 H30 Z" fill="${C.blue}" stroke-width="2.5"/>`),
  make("Milkshake", `<circle cx="50" cy="16" r="6" fill="${C.red}"/><path d="M28 34 Q26 18 42 20 Q50 8 60 20 Q76 18 72 34 Z" fill="${C.cream}"/><path d="M26 34 H74 L66 90 H34 Z" fill="${C.pink}"/><path d="M62 4 L56 22" stroke="${C.blue}" stroke-width="5"/>`),
  make("Lemonade", `<path d="M22 22 H78 L70 90 H30 Z" fill="${C.yellow}"/><path d="M26 50 H74" stroke-width="2.5"/><circle cx="76" cy="26" r="16" fill="${C.yellow}"/><circle cx="76" cy="26" r="10" fill="${C.cream}" stroke-width="2.5"/><path d="M76 16 V36 M66 26 H86" stroke-width="2"/><rect x="38" y="62" width="12" height="12" rx="3" fill="${C.sky}" stroke-width="2.5" transform="rotate(-8 44 68)"/>`),
  make("Water drop", `<path d="M50 8 C50 8 18 46 18 64 C18 82 32 92 50 92 C68 92 82 82 82 64 C82 46 50 8 50 8 Z" fill="${C.sky}"/><path d="M36 64 Q38 76 48 78" stroke="${C.cream}" stroke-width="4"/>`)
];

const love = [
  make("Heart", `<path d="${heartPath}" fill="${C.red}"/><path d="M26 34 Q28 28 34 28" stroke="${C.cream}" stroke-width="4"/>`),
  make("Two hearts", `<path d="M36 78 C6 54 6 30 22 26 C30 24 34 30 36 34 C38 30 42 24 50 26 C66 30 66 54 36 78 Z" fill="${C.pink}"/><path d="M68 90 C44 70 44 50 56 46 C62 44 66 48 68 52 C70 48 74 44 80 46 C92 50 92 70 68 90 Z" fill="${C.red}"/>`),
  make("Love letter", `<rect x="10" y="26" width="80" height="54" rx="6" fill="${C.cream}"/><path d="M10 30 L50 60 L90 30"/><path d="M50 70 C40 62 40 54 45 53 C48 52 50 54 50 56 C50 54 52 52 55 53 C60 54 60 62 50 70 Z" fill="${C.red}" stroke-width="2.5"/>`),
  make("Rose", `<path d="M50 52 V92" stroke="${C.green}" stroke-width="5"/><path d="M50 74 Q70 66 76 76 Q64 84 50 80 Z" fill="${C.green}"/><path d="M50 12 C30 12 22 28 28 42 C34 54 66 54 72 42 C78 28 70 12 50 12 Z" fill="${C.red}"/><path d="M46 22 Q62 20 62 34 Q60 46 46 42 Q36 38 40 30 Q44 26 50 30" stroke-width="2.5"/>`),
  make("Cupid heart", `<path d="${heartPath}" fill="${C.pink}"/><path d="M10 86 L92 12" stroke-width="4"/><path d="M92 12 L78 14 M92 12 L90 26" stroke-width="4"/><path d="M10 86 L8 74 M10 86 L22 84 M18 78 L12 72 M24 74 L16 68" stroke-width="3"/>`),
  make("Heart balloon", `<path d="M50 62 C14 38 14 8 34 6 C42 5 48 11 50 16 C52 11 58 5 66 6 C86 8 86 38 50 62 Z" fill="${C.red}"/><path d="M50 62 L46 68 H54 Z" fill="${C.red}" stroke-width="2.5"/><path d="M50 68 Q40 78 52 84 Q62 90 50 98" stroke-width="2.5"/>`),
  make("Lips", `<path d="M10 52 Q28 30 50 40 Q72 30 90 52 Q72 80 50 80 Q28 80 10 52 Z" fill="${C.red}"/><path d="M10 52 Q50 58 90 52" stroke-width="3"/>`),
  make("Gift", `<rect x="14" y="40" width="72" height="50" rx="4" fill="${C.pink}"/><rect x="10" y="28" width="80" height="16" rx="4" fill="${C.red}"/><path d="M50 28 V90" stroke="${C.yellow}" stroke-width="10"/><path d="M50 28 C40 10 22 14 30 26 Z M50 28 C60 10 78 14 70 26 Z" fill="${C.yellow}"/>`)
];

const nature = [
  make("Flower", `<g fill="${C.pink}"><circle cx="50" cy="24" r="14"/><circle cx="76" cy="42" r="14"/><circle cx="66" cy="72" r="14"/><circle cx="34" cy="72" r="14"/><circle cx="24" cy="42" r="14"/></g><circle cx="50" cy="50" r="13" fill="${C.yellow}"/>`),
  make("Cactus", `<path d="M42 72 H30 Q22 72 22 64 V46 Q22 40 28 40 Q34 40 34 46 V60 H42 Z" fill="${C.green}"/><path d="M58 60 H70 Q78 60 78 52 V36 Q78 30 72 30 Q66 30 66 36 V48 H58 Z" fill="${C.green}"/><path d="M40 90 V28 Q40 12 50 12 Q60 12 60 28 V90 Z" fill="${C.green}"/><path d="M50 28 V40 M50 54 V64" stroke-width="2.5"/><rect x="28" y="80" width="44" height="12" rx="3" fill="${C.orange}"/>`),
  make("Mushroom", `<path d="M10 52 Q10 12 50 12 Q90 12 90 52 Z" fill="${C.red}"/><circle cx="32" cy="34" r="6" fill="${C.cream}" stroke-width="2.5"/><circle cx="58" cy="26" r="5" fill="${C.cream}" stroke-width="2.5"/><circle cx="72" cy="42" r="5" fill="${C.cream}" stroke-width="2.5"/><path d="M36 52 V80 Q36 90 50 90 Q64 90 64 80 V52 Z" fill="${C.cream}"/>`),
  make("Butterfly", `<path d="M50 50 C30 14 8 20 14 46 C16 58 36 58 50 50 Z" fill="${C.purple}"/><path d="M50 50 C70 14 92 20 86 46 C84 58 64 58 50 50 Z" fill="${C.purple}"/><path d="M50 50 C34 54 22 78 36 84 C46 88 50 64 50 50 Z" fill="${C.pink}"/><path d="M50 50 C66 54 78 78 64 84 C54 88 50 64 50 50 Z" fill="${C.pink}"/><path d="M50 36 V74" stroke-width="5"/><path d="M50 36 Q44 24 38 22 M50 36 Q56 24 62 22"/>`),
  make("Cloud", `<path d="M26 74 Q8 74 10 56 Q12 42 28 44 Q30 24 52 26 Q70 26 72 44 Q92 42 90 60 Q90 74 74 74 Z" fill="${C.sky}"/><path d="M34 86 l-3 7 M50 86 l-3 7 M66 86 l-3 7" stroke="${C.blue}" stroke-width="3.5"/>`),
  make("Leaf", `<path d="M14 86 C10 40 40 12 88 12 C90 60 62 90 14 86 Z" fill="${C.green}"/><path d="M14 86 C34 64 52 44 76 26 M40 62 L46 76 M52 50 L66 56" stroke-width="3"/>`),
  make("Palm tree", `<path d="M46 92 Q44 62 52 34" stroke="${C.brown}" stroke-width="7"/><path d="M52 34 Q30 20 12 32 Q34 34 52 34 Z M52 34 Q70 16 90 26 Q70 34 52 34 Z M52 34 Q44 14 54 6 Q62 18 52 34 Z M52 34 Q28 44 14 62 Q38 56 52 34 Z M52 34 Q74 44 84 64 Q62 56 52 34 Z" fill="${C.green}" stroke-width="3"/><circle cx="48" cy="38" r="4" fill="${C.brown}" stroke-width="2.5"/>`),
  make("Star fish", `<path d="M50 8 L61 36 L92 38 L68 58 L76 88 L50 72 L24 88 L32 58 L8 38 L39 36 Z" fill="${C.orange}"/><circle cx="50" cy="42" r="2.5" fill="${C.cream}" stroke-width="1.5"/><circle cx="44" cy="54" r="2.5" fill="${C.cream}" stroke-width="1.5"/><circle cx="56" cy="54" r="2.5" fill="${C.cream}" stroke-width="1.5"/>`)
];

// Cut out of the school sticker pack (EPS): real transparency, so no white-stripping and no multiply blend.
const schoolPack = [
  { src: "/assets/doodles/school/backpack.png", label: "Backpack", aspect: 1.002, alpha: true },
  { src: "/assets/doodles/school/notebook.png", label: "Notebook", aspect: 0.889, alpha: true },
  { src: "/assets/doodles/school/folder.png", label: "Folder", aspect: 0.982, alpha: true },
  { src: "/assets/doodles/school/pencil-case.png", label: "Pencil case", aspect: 0.895, alpha: true },
  { src: "/assets/doodles/school/pen.png", label: "Pen", aspect: 3.060, alpha: true },
  { src: "/assets/doodles/school/rulers.png", label: "Rulers", aspect: 1.647, alpha: true },
  { src: "/assets/doodles/school/highlighter.png", label: "Highlighter", aspect: 0.821, alpha: true },
  { src: "/assets/doodles/school/globe.png", label: "Globe", aspect: 1.318, alpha: true },
  { src: "/assets/doodles/school/bookshelf.png", label: "Bookshelf", aspect: 0.721, alpha: true },
  { src: "/assets/doodles/school/computer.png", label: "Computer", aspect: 0.820, alpha: true },
  { src: "/assets/doodles/school/lab-coat.png", label: "Lab coat", aspect: 1.305, alpha: true },
  { src: "/assets/doodles/school/thermos-and-lunch.png", label: "Thermos and lunch", aspect: 1.100, alpha: true },
  { src: "/assets/doodles/school/creative.png", label: "Creative", aspect: 0.838, alpha: true },
  { src: "/assets/doodles/school/happy.png", label: "Happy", aspect: 0.691, alpha: true },
  { src: "/assets/doodles/school/fun.png", label: "Fun", aspect: 0.789, alpha: true },
  { src: "/assets/doodles/school/art.png", label: "Art", aspect: 0.762, alpha: true },
  { src: "/assets/doodles/school/success.png", label: "Success", aspect: 1.848, alpha: true },
  { src: "/assets/doodles/school/heart.png", label: "Heart", aspect: 0.850, alpha: true },
  { src: "/assets/doodles/school/gold-heart.png", label: "Gold heart", aspect: 0.883, alpha: true },
  { src: "/assets/doodles/school/brown-star.png", label: "Brown star", aspect: 0.985, alpha: true },
  { src: "/assets/doodles/school/orange-star.png", label: "Orange star", aspect: 0.993, alpha: true }
];

// More hand-drawn stickers cut out of two vector packs (EPS): real transparency, grouped by theme.
const packs = {
  school: [
    { src: "/assets/doodles/school/bright-idea.png", label: "Bright idea", aspect: 1.327, alpha: true },
    { src: "/assets/doodles/school/sharp-pencil.png", label: "Sharp pencil", aspect: 1.443, alpha: true },
    { src: "/assets/doodles/school/open-book.png", label: "Open book", aspect: 1.014, alpha: true },
    { src: "/assets/doodles/school/molecule.png", label: "Molecule", aspect: 0.716, alpha: true }
  ],
  music: [
    { src: "/assets/doodles/music/boombox.png", label: "Boombox", aspect: 0.716, alpha: true },
    { src: "/assets/doodles/music/music-note.png", label: "Music note", aspect: 1.135, alpha: true }
  ],
  vibe: [
    { src: "/assets/doodles/vibe/just-peachy.png", label: "Just peachy", aspect: 0.568, alpha: true },
    { src: "/assets/doodles/vibe/pink-star.png", label: "Pink star", aspect: 1.021, alpha: true },
    { src: "/assets/doodles/vibe/good-night.png", label: "Good night", aspect: 0.996, alpha: true },
    { src: "/assets/doodles/vibe/little-things-jar.png", label: "Little things jar", aspect: 1.290, alpha: true },
    { src: "/assets/doodles/vibe/power-battery.png", label: "Power battery", aspect: 0.345, alpha: true },
    { src: "/assets/doodles/vibe/blue-star.png", label: "Blue star", aspect: 1.021, alpha: true },
    { src: "/assets/doodles/vibe/like.png", label: "Like", aspect: 0.573, alpha: true },
    { src: "/assets/doodles/vibe/yin-yang.png", label: "Yin yang", aspect: 1.066, alpha: true },
    { src: "/assets/doodles/vibe/diamond.png", label: "Diamond", aspect: 0.751, alpha: true },
    { src: "/assets/doodles/vibe/sparkles.png", label: "Sparkles", aspect: 1.447, alpha: true },
    { src: "/assets/doodles/vibe/chat-bubble.png", label: "Chat bubble", aspect: 1.053, alpha: true },
    { src: "/assets/doodles/vibe/lightning-bolt.png", label: "Lightning bolt", aspect: 2.759, alpha: true },
    { src: "/assets/doodles/vibe/yes-burst.png", label: "Yes burst", aspect: 1.022, alpha: true },
    { src: "/assets/doodles/vibe/nope.png", label: "Nope", aspect: 1.728, alpha: true },
    { src: "/assets/doodles/vibe/create-and-innovate.png", label: "Create and innovate", aspect: 1.184, alpha: true },
    { src: "/assets/doodles/vibe/relax-bubble.png", label: "Relax bubble", aspect: 1.029, alpha: true },
    { src: "/assets/doodles/vibe/bang.png", label: "Bang", aspect: 0.850, alpha: true },
    { src: "/assets/doodles/vibe/omg.png", label: "OMG", aspect: 0.648, alpha: true },
    { src: "/assets/doodles/vibe/star.png", label: "Star", aspect: 1.118, alpha: true },
    { src: "/assets/doodles/vibe/zap.png", label: "Zap", aspect: 3.590, alpha: true },
    { src: "/assets/doodles/vibe/smiley-outline.png", label: "Smiley outline", aspect: 1.005, alpha: true },
    { src: "/assets/doodles/vibe/bead-ring.png", label: "Bead ring", aspect: 0.882, alpha: true },
    { src: "/assets/doodles/vibe/yin-yang-flower.png", label: "Yin yang flower", aspect: 1.043, alpha: true },
    { src: "/assets/doodles/vibe/lightning-outline.png", label: "Lightning outline", aspect: 1.505, alpha: true },
    { src: "/assets/doodles/vibe/cosmic-swirl.png", label: "Cosmic swirl", aspect: 0.728, alpha: true },
    { src: "/assets/doodles/vibe/gem.png", label: "Gem", aspect: 1.000, alpha: true }
  ],
  love: [
    { src: "/assets/doodles/love/winged-heart.png", label: "Winged heart", aspect: 0.707, alpha: true },
    { src: "/assets/doodles/love/lips.png", label: "Lips", aspect: 1.037, alpha: true },
    { src: "/assets/doodles/love/glowing-heart.png", label: "Glowing heart", aspect: 0.946, alpha: true },
    { src: "/assets/doodles/love/broken-heart.png", label: "Broken heart", aspect: 0.728, alpha: true },
    { src: "/assets/doodles/love/kiss.png", label: "Kiss", aspect: 0.456, alpha: true },
    { src: "/assets/doodles/love/heart-lollipop.png", label: "Heart lollipop", aspect: 1.084, alpha: true },
    { src: "/assets/doodles/love/love-sign.png", label: "Love sign", aspect: 0.815, alpha: true },
    { src: "/assets/doodles/love/zebra-heart.png", label: "Zebra heart", aspect: 0.989, alpha: true },
    { src: "/assets/doodles/love/angel-heart.png", label: "Angel heart", aspect: 0.713, alpha: true }
  ],
  fun: [
    { src: "/assets/doodles/fun/shark.png", label: "Shark", aspect: 0.986, alpha: true },
    { src: "/assets/doodles/fun/unicorn.png", label: "Unicorn", aspect: 1.324, alpha: true },
    { src: "/assets/doodles/fun/alien.png", label: "Alien", aspect: 1.358, alpha: true },
    { src: "/assets/doodles/fun/mustache.png", label: "Mustache", aspect: 0.323, alpha: true },
    { src: "/assets/doodles/fun/little-mustache.png", label: "Little mustache", aspect: 0.562, alpha: true },
    { src: "/assets/doodles/fun/round-glasses.png", label: "Round glasses", aspect: 0.659, alpha: true },
    { src: "/assets/doodles/fun/eye-apple.png", label: "Eye apple", aspect: 1.116, alpha: true },
    { src: "/assets/doodles/fun/eye.png", label: "Eye", aspect: 1.270, alpha: true },
    { src: "/assets/doodles/fun/cat.png", label: "Cat", aspect: 0.341, alpha: true },
    { src: "/assets/doodles/fun/antlers.png", label: "Antlers", aspect: 0.955, alpha: true },
    { src: "/assets/doodles/fun/paper-plane.png", label: "Paper plane", aspect: 0.601, alpha: true },
    { src: "/assets/doodles/fun/bandage.png", label: "Bandage", aspect: 2.026, alpha: true },
    { src: "/assets/doodles/fun/plaster.png", label: "Plaster", aspect: 0.996, alpha: true },
    { src: "/assets/doodles/fun/little-house.png", label: "Little house", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/fun/ghost.png", label: "Ghost", aspect: 1.202, alpha: true },
    { src: "/assets/doodles/fun/grumpy-monster.png", label: "Grumpy monster", aspect: 1.152, alpha: true },
    { src: "/assets/doodles/fun/wide-eye.png", label: "Wide eye", aspect: 0.775, alpha: true },
    { src: "/assets/doodles/fun/sleepy-bear.png", label: "Sleepy bear", aspect: 1.051, alpha: true },
    { src: "/assets/doodles/fun/rocket.png", label: "Rocket", aspect: 1.642, alpha: true },
    { src: "/assets/doodles/fun/flying-saucer.png", label: "Flying saucer", aspect: 0.780, alpha: true },
    { src: "/assets/doodles/fun/skull.png", label: "Skull", aspect: 0.896, alpha: true },
    { src: "/assets/doodles/fun/astronaut.png", label: "Astronaut", aspect: 1.618, alpha: true },
    { src: "/assets/doodles/fun/flip-phone.png", label: "Flip phone", aspect: 1.432, alpha: true },
    { src: "/assets/doodles/fun/puzzle-piece.png", label: "Puzzle piece", aspect: 0.922, alpha: true },
    { src: "/assets/doodles/fun/melting-clock.png", label: "Melting clock", aspect: 0.626, alpha: true },
    { src: "/assets/doodles/fun/money.png", label: "Money", aspect: 0.839, alpha: true },
    { src: "/assets/doodles/fun/pyramid-eye.png", label: "Pyramid eye", aspect: 0.867, alpha: true },
    { src: "/assets/doodles/fun/baby.png", label: "Baby", aspect: 0.986, alpha: true }
  ],
  coffee: [
    { src: "/assets/doodles/coffee/coffee-cup.png", label: "Coffee cup", aspect: 0.829, alpha: true },
    { src: "/assets/doodles/coffee/steaming-cup.png", label: "Steaming cup", aspect: 1.174, alpha: true },
    { src: "/assets/doodles/coffee/spilled-mug.png", label: "Spilled mug", aspect: 0.789, alpha: true }
  ],
  food: [
    { src: "/assets/doodles/food/lemon-squeezy.png", label: "Lemon squeezy", aspect: 1.600, alpha: true },
    { src: "/assets/doodles/food/green-popsicle.png", label: "Green popsicle", aspect: 1.965, alpha: true },
    { src: "/assets/doodles/food/donut.png", label: "Donut", aspect: 1.202, alpha: true },
    { src: "/assets/doodles/food/watermelon.png", label: "Watermelon", aspect: 0.985, alpha: true },
    { src: "/assets/doodles/food/popsicle.png", label: "Popsicle", aspect: 0.994, alpha: true },
    { src: "/assets/doodles/food/avocado.png", label: "Avocado", aspect: 1.328, alpha: true },
    { src: "/assets/doodles/food/ice-cream-swirl.png", label: "Ice cream swirl", aspect: 2.205, alpha: true },
    { src: "/assets/doodles/food/lollipop.png", label: "Lollipop", aspect: 1.573, alpha: true },
    { src: "/assets/doodles/food/pizza-slice.png", label: "Pizza slice", aspect: 1.253, alpha: true },
    { src: "/assets/doodles/food/fried-egg.png", label: "Fried egg", aspect: 0.759, alpha: true },
    { src: "/assets/doodles/food/cherries.png", label: "Cherries", aspect: 1.002, alpha: true },
    { src: "/assets/doodles/food/glazed-donut.png", label: "Glazed donut", aspect: 0.876, alpha: true },
    { src: "/assets/doodles/food/candy.png", label: "Candy", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/food/fries-doodle.png", label: "Fries doodle", aspect: 1.145, alpha: true },
    { src: "/assets/doodles/food/sundae-cone.png", label: "Sundae cone", aspect: 1.379, alpha: true },
    { src: "/assets/doodles/food/ice-pop.png", label: "Ice pop", aspect: 1.383, alpha: true },
    { src: "/assets/doodles/food/citrus-plate.png", label: "Citrus plate", aspect: 0.829, alpha: true },
    { src: "/assets/doodles/food/red-apple.png", label: "Red apple", aspect: 1.294, alpha: true },
    { src: "/assets/doodles/food/cake-slice.png", label: "Cake slice", aspect: 1.017, alpha: true }
  ],
  drinks: [
    { src: "/assets/doodles/drinks/milk-carton.png", label: "Milk carton", aspect: 1.569, alpha: true },
    { src: "/assets/doodles/drinks/paper-cup.png", label: "Paper cup", aspect: 1.518, alpha: true },
    { src: "/assets/doodles/drinks/coconut-drink.png", label: "Coconut drink", aspect: 1.045, alpha: true },
    { src: "/assets/doodles/drinks/juice-pitcher.png", label: "Juice pitcher", aspect: 1.296, alpha: true },
    { src: "/assets/doodles/drinks/tropical-cocktail.png", label: "Tropical cocktail", aspect: 1.647, alpha: true },
    { src: "/assets/doodles/drinks/water-bottle.png", label: "Water bottle", aspect: 1.600, alpha: true },
    { src: "/assets/doodles/drinks/soda-can.png", label: "Soda can", aspect: 1.349, alpha: true }
  ],
  nature: [
    { src: "/assets/doodles/nature/whale.png", label: "Whale", aspect: 0.534, alpha: true },
    { src: "/assets/doodles/nature/cactus.png", label: "Cactus", aspect: 1.854, alpha: true },
    { src: "/assets/doodles/nature/mountains.png", label: "Mountains", aspect: 1.279, alpha: true },
    { src: "/assets/doodles/nature/storm-cloud.png", label: "Storm cloud", aspect: 1.207, alpha: true },
    { src: "/assets/doodles/nature/sunrise.png", label: "Sunrise", aspect: 0.448, alpha: true },
    { src: "/assets/doodles/nature/umbrella.png", label: "Umbrella", aspect: 1.594, alpha: true },
    { src: "/assets/doodles/nature/daisy.png", label: "Daisy", aspect: 1.002, alpha: true },
    { src: "/assets/doodles/nature/potted-cactus.png", label: "Potted cactus", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/nature/apple-tree.png", label: "Apple tree", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/nature/pine-trees.png", label: "Pine trees", aspect: 0.998, alpha: true },
    { src: "/assets/doodles/nature/leaf.png", label: "Leaf", aspect: 0.396, alpha: true },
    { src: "/assets/doodles/nature/feather.png", label: "Feather", aspect: 1.697, alpha: true },
    { src: "/assets/doodles/nature/bold-flower.png", label: "Bold flower", aspect: 0.925, alpha: true },
    { src: "/assets/doodles/nature/sketch-flower.png", label: "Sketch flower", aspect: 0.971, alpha: true },
    { src: "/assets/doodles/nature/little-flower.png", label: "Little flower", aspect: 1.020, alpha: true },
    { src: "/assets/doodles/nature/smiley-flower.png", label: "Smiley flower", aspect: 1.013, alpha: true },
    { src: "/assets/doodles/nature/flower-outline.png", label: "Flower outline", aspect: 1.100, alpha: true },
    { src: "/assets/doodles/nature/butterfly.png", label: "Butterfly", aspect: 0.891, alpha: true },
    { src: "/assets/doodles/nature/cloud-outline.png", label: "Cloud outline", aspect: 0.951, alpha: true },
    { src: "/assets/doodles/nature/rose.png", label: "Rose", aspect: 0.852, alpha: true },
    { src: "/assets/doodles/nature/tulip-leaves.png", label: "Tulip leaves", aspect: 1.006, alpha: true }
  ]
};

const spacePack = [
    { src: "/assets/doodles/space/purple-planet.png", label: "Purple planet", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/space/ringed-planet.png", label: "Ringed planet", aspect: 0.597, alpha: true },
    { src: "/assets/doodles/space/ocean-planet.png", label: "Ocean planet", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/space/cool-earth.png", label: "Cool earth", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/space/happy-planet.png", label: "Happy planet", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/space/giggle-planet.png", label: "Giggle planet", aspect: 1.002, alpha: true },
    { src: "/assets/doodles/space/moon-ufo.png", label: "Moon ufo", aspect: 1.000, alpha: true },
    { src: "/assets/doodles/space/space-rocket.png", label: "Space rocket", aspect: 0.497, alpha: true }
];

const summerPack = [
    { src: "/assets/doodles/summer/sunscreen.png", label: "Sunscreen", aspect: 1.343, alpha: true },
    { src: "/assets/doodles/summer/swim-shorts.png", label: "Swim shorts", aspect: 0.932, alpha: true },
    { src: "/assets/doodles/summer/summer.png", label: "Summer", aspect: 1.620, alpha: true },
    { src: "/assets/doodles/summer/sunglasses.png", label: "Sunglasses", aspect: 0.773, alpha: true },
    { src: "/assets/doodles/summer/beach.png", label: "Beach", aspect: 0.565, alpha: true },
    { src: "/assets/doodles/summer/retro-camera.png", label: "Retro camera", aspect: 0.887, alpha: true },
    { src: "/assets/doodles/summer/paradise.png", label: "Paradise", aspect: 0.587, alpha: true },
    { src: "/assets/doodles/summer/surfboard.png", label: "Surfboard", aspect: 1.018, alpha: true },
    { src: "/assets/doodles/summer/beach-umbrella.png", label: "Beach umbrella", aspect: 1.043, alpha: true },
    { src: "/assets/doodles/summer/sun-hat.png", label: "Sun hat", aspect: 0.939, alpha: true },
    { src: "/assets/doodles/summer/vacation.png", label: "Vacation", aspect: 0.669, alpha: true },
    { src: "/assets/doodles/summer/sandals.png", label: "Sandals", aspect: 0.755, alpha: true },
    { src: "/assets/doodles/summer/suitcase.png", label: "Suitcase", aspect: 1.311, alpha: true },
    { src: "/assets/doodles/summer/beach-ball.png", label: "Beach ball", aspect: 1.009, alpha: true },
    { src: "/assets/doodles/summer/barbecue.png", label: "Barbecue", aspect: 1.256, alpha: true },
    { src: "/assets/doodles/summer/caravan.png", label: "Caravan", aspect: 0.998, alpha: true },
    { src: "/assets/doodles/summer/pineapple.png", label: "Pineapple", aspect: 1.175, alpha: true },
    { src: "/assets/doodles/summer/travel.png", label: "Travel", aspect: 0.576, alpha: true },
    { src: "/assets/doodles/summer/tropical.png", label: "Tropical", aspect: 0.980, alpha: true },
    { src: "/assets/doodles/summer/desk-fan.png", label: "Desk fan", aspect: 1.514, alpha: true },
    { src: "/assets/doodles/summer/passport.png", label: "Passport", aspect: 1.063, alpha: true },
    { src: "/assets/doodles/summer/camping-tent.png", label: "Camping tent", aspect: 0.809, alpha: true },
    { src: "/assets/doodles/summer/beach-paddles.png", label: "Beach paddles", aspect: 0.868, alpha: true },
    { src: "/assets/doodles/summer/exotic.png", label: "Exotic", aspect: 0.657, alpha: true },
    { src: "/assets/doodles/summer/beach-tote.png", label: "Beach tote", aspect: 1.026, alpha: true },
    { src: "/assets/doodles/summer/summertime.png", label: "Summertime", aspect: 0.497, alpha: true },
    { src: "/assets/doodles/summer/kite.png", label: "Kite", aspect: 0.959, alpha: true },
    { src: "/assets/doodles/summer/cocktail.png", label: "Cocktail", aspect: 0.653, alpha: true },
    { src: "/assets/doodles/summer/life-ring.png", label: "Life ring", aspect: 0.809, alpha: true }
];

const legacy = {
  love: { src: "/assets/sticker-love.png", label: "Love sticker", aspect: 1.23 },
  secret: { src: "/assets/sticker-secret.png", label: "Secret sticker", aspect: 1.23 },
  dance: { src: "/assets/sticker-dance.png", label: "Dance sticker", aspect: 1.23 },
  snack: { src: "/assets/sticker-snack.png", label: "Snack sticker", aspect: 1.23 }
};

// Emoji-style faces and symbols (the "Classic" category).
const FACE = C.yellow;
const eyeDots = `<ellipse cx="35" cy="42" rx="4.5" ry="7" fill="${C.dark}" stroke-width="0"/><ellipse cx="65" cy="42" rx="4.5" ry="7" fill="${C.dark}" stroke-width="0"/>`;
const face = (inner, fill = FACE) => `<circle cx="50" cy="50" r="42" fill="${fill}"/>${inner}`;
const tooth = "#fff8ec";
const tear = (x, y) => `<path d="M${x} ${y} q-5 8 0 12 q5 -4 0 -12 Z" fill="${C.sky}" stroke-width="2.5"/>`;

const emoji = [
  make("Grin", face(`${eyeDots}<path d="M24 58 Q50 92 76 58 Z" fill="${tooth}"/><path d="M24 58 H76" stroke-width="3"/>`)),
  make("Laughing", face(`<path d="M24 44 Q32 34 42 44 M58 44 Q68 34 76 44" stroke-width="4"/><path d="M26 56 Q50 94 74 56 Z" fill="${C.red}"/><path d="M30 57 H70" stroke="${tooth}" stroke-width="6"/>${tear(18, 54)}${tear(82, 54)}`)),
  make("Wink", face(`<ellipse cx="35" cy="42" rx="4.5" ry="7" fill="${C.dark}" stroke-width="0"/><path d="M58 44 Q66 36 74 44" stroke-width="4"/><path d="M28 62 Q50 84 72 62" stroke-width="4"/>`)),
  make("Heart eyes", face(`<path d="M35 52 C20 42 24 30 33 31 C35 31 35 33 35 34 C35 33 36 31 38 31 C47 30 51 42 35 52 Z" fill="${C.red}" stroke-width="2.5"/><path d="M65 52 C50 42 54 30 63 31 C65 31 65 33 65 34 C65 33 66 31 68 31 C77 30 81 42 65 52 Z" fill="${C.red}" stroke-width="2.5"/><path d="M28 60 Q50 90 72 60 Z" fill="${C.red}"/>`)),
  make("Cool", face(`<path d="M14 38 H86 L80 56 Q72 62 64 56 L60 46 H40 L36 56 Q28 62 20 56 Z" fill="${C.dark}"/><path d="M32 70 Q50 82 68 70" stroke-width="4"/>`)),
  make("Kiss", face(`<ellipse cx="35" cy="42" rx="4.5" ry="7" fill="${C.dark}" stroke-width="0"/><path d="M58 44 Q66 36 74 44" stroke-width="4"/><path d="M50 62 Q58 66 50 74 Q42 66 50 62 Z" fill="${C.red}" stroke-width="2.5"/><path d="M80 24 C72 18 74 10 80 12 C86 10 88 18 80 24 Z" fill="${C.red}" stroke-width="2"/>`)),
  make("Thinking", face(`<ellipse cx="35" cy="46" rx="4.5" ry="6" fill="${C.dark}" stroke-width="0"/><ellipse cx="65" cy="46" rx="4.5" ry="6" fill="${C.dark}" stroke-width="0"/><path d="M26 32 Q36 24 46 32" stroke-width="3.5"/><path d="M56 28 L74 24" stroke-width="3.5"/><path d="M36 70 Q50 64 64 72" stroke-width="4"/>`)),
  make("Sleepy", face(`<path d="M26 46 Q35 54 44 46 M56 46 Q65 54 74 46" stroke-width="4"/><ellipse cx="50" cy="68" rx="6" ry="5" fill="${C.dark}"/><path d="M76 20 h10 l-10 10 h10 M64 8 h7 l-7 7 h7" stroke-width="2.5"/>`)),
  make("Angry", face(`<path d="M24 34 L44 42 M76 34 L56 42" stroke-width="5"/><ellipse cx="35" cy="50" rx="4.5" ry="5.5" fill="${C.dark}" stroke-width="0"/><ellipse cx="65" cy="50" rx="4.5" ry="5.5" fill="${C.dark}" stroke-width="0"/><path d="M34 76 Q50 62 66 76" stroke-width="4"/>`, "#ff7a59")),
  make("Crying", face(`<path d="M24 44 Q34 36 44 44 M56 44 Q66 36 76 44" stroke-width="4"/><path d="M34 74 Q50 62 66 74" stroke-width="4"/><path d="M28 50 V86 M72 50 V86" stroke="${C.sky}" stroke-width="7"/>`)),
  make("Surprised", face(`<circle cx="35" cy="42" r="6" fill="${tooth}"/><circle cx="65" cy="42" r="6" fill="${tooth}"/><circle cx="35" cy="42" r="2.5" fill="${C.dark}" stroke-width="0"/><circle cx="65" cy="42" r="2.5" fill="${C.dark}" stroke-width="0"/><ellipse cx="50" cy="72" rx="8" ry="10" fill="${C.dark}"/>`)),
  make("Party", `<circle cx="50" cy="56" r="38" fill="${FACE}"/><path d="M50 4 L72 36 H28 Z" fill="${C.pink}"/><circle cx="50" cy="6" r="5" fill="${C.blue}" stroke-width="2.5"/><path d="M36 28 H64" stroke="${C.yellow}" stroke-width="3"/><path d="M33 48 q2 -6 6 0 M61 48 q2 -6 6 0" stroke-width="4"/><path d="M30 64 Q50 88 70 64 Z" fill="${C.red}"/><path d="M12 22 l4 4 M88 30 l-5 3 M90 56 l-6 -1" stroke="${C.blue}" stroke-width="3"/>`),
  make("Nerd", face(`<circle cx="34" cy="44" r="12" fill="${tooth}"/><circle cx="66" cy="44" r="12" fill="${tooth}"/><path d="M46 44 H54" stroke-width="3"/><circle cx="34" cy="44" r="3" fill="${C.dark}" stroke-width="0"/><circle cx="66" cy="44" r="3" fill="${C.dark}" stroke-width="0"/><path d="M30 68 Q50 80 70 68" stroke-width="4"/><rect x="44" y="70" width="12" height="9" rx="2" fill="${tooth}" stroke-width="2.5"/>`)),
  make("Star eyes", face(`<path d="M35 28 L38.5 37 L48 37.5 L40.5 43.5 L43 53 L35 47.5 L27 53 L29.5 43.5 L22 37.5 L31.5 37 Z" fill="${C.orange}" stroke-width="2.5"/><path d="M65 28 L68.5 37 L78 37.5 L70.5 43.5 L73 53 L65 47.5 L57 53 L59.5 43.5 L52 37.5 L61.5 37 Z" fill="${C.orange}" stroke-width="2.5"/><path d="M26 62 Q50 92 74 62 Z" fill="${tooth}"/><path d="M26 62 H74" stroke-width="3"/>`)),
  make("Zany", face(`<path d="M24 36 L44 44 M44 36 L24 44" stroke-width="4"/><ellipse cx="66" cy="42" rx="5" ry="7" fill="${C.dark}" stroke-width="0"/><path d="M26 62 Q50 78 74 62" stroke-width="4"/><path d="M52 68 V84 Q52 92 62 92 Q72 92 72 84 V66 Z" fill="${C.pink}" stroke-width="3"/>`)),
  make("Blush", face(`<path d="M26 46 Q35 38 44 46 M56 46 Q65 38 74 46" stroke-width="4"/><ellipse cx="24" cy="60" rx="8" ry="5" fill="${C.pink}" stroke-width="0"/><ellipse cx="76" cy="60" rx="8" ry="5" fill="${C.pink}" stroke-width="0"/><path d="M36 66 Q50 78 64 66" stroke-width="4"/>`)),
  make("Sad", face(`<ellipse cx="35" cy="46" rx="4.5" ry="6.5" fill="${C.dark}" stroke-width="0"/><ellipse cx="65" cy="46" rx="4.5" ry="6.5" fill="${C.dark}" stroke-width="0"/><path d="M24 36 L42 30 M76 36 L58 30" stroke-width="3.5"/><path d="M34 76 Q50 62 66 76" stroke-width="4"/>${tear(30, 60)}`)),
  make("Screaming", face(`<circle cx="35" cy="42" r="6" fill="${tooth}"/><circle cx="65" cy="42" r="6" fill="${tooth}"/><circle cx="35" cy="44" r="2.5" fill="${C.dark}" stroke-width="0"/><circle cx="65" cy="44" r="2.5" fill="${C.dark}" stroke-width="0"/><path d="M30 60 Q50 54 70 60 L66 86 Q50 94 34 86 Z" fill="${C.dark}"/><path d="M33 61 Q50 57 67 61 L66 66 Q50 62 34 66 Z" fill="${tooth}" stroke-width="0"/>`, "#b8a9f2")),
  make("Hmm", face(`<ellipse cx="35" cy="44" rx="4.5" ry="6.5" fill="${C.dark}" stroke-width="0"/><ellipse cx="65" cy="44" rx="4.5" ry="6.5" fill="${C.dark}" stroke-width="0"/><path d="M32 70 H68" stroke-width="4.5"/>`)),
  make("Smile", face(`${eyeDots}<path d="M26 60 Q50 84 74 60" stroke-width="4.5"/>`)),
  make("Thumbs up", `<path d="M10 50 H30 V90 H10 Z" fill="${C.blue}"/><path d="M30 54 L44 20 Q54 10 60 22 L56 44 H82 Q94 46 90 58 L88 62 Q94 70 86 76 Q90 84 82 88 Q84 94 74 94 H30 Z" fill="${C.yellow}"/><path d="M60 62 H80 M62 76 H80" stroke-width="2.5"/>`),
  make("Crown", `<path d="M10 74 L6 30 L32 52 L50 18 L68 52 L94 30 L90 74 Z" fill="${C.yellow}"/><rect x="10" y="74" width="80" height="14" rx="4" fill="${C.orange}"/><circle cx="6" cy="28" r="5" fill="${C.red}" stroke-width="2.5"/><circle cx="50" cy="14" r="5" fill="${C.red}" stroke-width="2.5"/><circle cx="94" cy="28" r="5" fill="${C.red}" stroke-width="2.5"/><circle cx="30" cy="81" r="3" fill="${C.red}" stroke-width="2"/><circle cx="50" cy="81" r="3" fill="${C.blue}" stroke-width="2"/><circle cx="70" cy="81" r="3" fill="${C.red}" stroke-width="2"/>`),
  make("Eyes", `<ellipse cx="30" cy="50" rx="20" ry="28" fill="${tooth}"/><ellipse cx="70" cy="50" rx="20" ry="28" fill="${tooth}"/><circle cx="36" cy="54" r="9" fill="${C.dark}"/><circle cx="64" cy="54" r="9" fill="${C.dark}"/>`),
  make("100", `<path d="M14 24 L26 18 V80" stroke="${C.red}" stroke-width="9"/><ellipse cx="50" cy="50" rx="11" ry="28" stroke="${C.red}" stroke-width="9"/><ellipse cx="80" cy="50" rx="11" ry="28" stroke="${C.red}" stroke-width="9"/><path d="M8 90 H92" stroke="${C.red}" stroke-width="5"/>`)
];

const CATEGORIES = [
  { id: "classic", label: "Classic", items: emoji },
  { id: "food", label: "Food", items: [...(packs.food || []), ...food, legacy.snack] },
  { id: "music", label: "Music", items: [...(packs.music || []), ...music, legacy.dance] },
  { id: "vibe", label: "Vibe", items: [...(packs.vibe || []), ...vibe, legacy.secret] },
  { id: "school", label: "School", items: [...schoolPack, ...(packs.school || []), ...school] },
  { id: "coffee", label: "Coffee", items: [...(packs.coffee || []), ...coffee] },
  { id: "drinks", label: "Drinks", items: [...(packs.drinks || []), ...drinks] },
  { id: "love", label: "Love", items: [...(packs.love || []), ...love, legacy.love] },
  { id: "nature", label: "Nature", items: [...(packs.nature || []), ...nature] },
  { id: "summer", label: "Summer", items: summerPack },
  { id: "space", label: "Space", items: spacePack },
  { id: "fun", label: "Fun", items: packs.fun || [] }
];

// Cut-out packs come first; a simple icon with the same name as a pack doodle is dropped.
const unique = (items) => items.filter((item, i) => items.findIndex((other) => other.label === item.label) === i);
export const DOODLE_CATEGORIES = CATEGORIES.map((category) => ({ ...category, items: unique(category.items) }));
