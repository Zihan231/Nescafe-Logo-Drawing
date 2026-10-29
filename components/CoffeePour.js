"use client";

import { useEffect } from "react";
import { playCoffeeScene } from "@/lib/coffee-sounds";

// A NESCAFÉ glass mug fills with coffee while the four code digits drop in with the pour.
// Everything is timed from the same numbers below (seconds), so the landing height of each
// digit matches the rising coffee level exactly. The CSS lives in app/globals.css (.cp-*).

const GLASS_BOTTOM = 272; // y of the empty level (inside the glass)
const SURFACE = 138; // y of the final coffee surface
const FILL_DELAY = 0.8;
const FILL_TIME = 2.6;
const FIRST_DROP = 1.0;
const DROP_GAP = 0.62;
const FALL_TIME = 0.48;
export const POUR_END = FIRST_DROP + 3 * DROP_GAP + FALL_TIME + 0.12; // when the stream stops
export const REVEAL_AT = POUR_END + 0.35; // when the finished code can appear

const DIGIT_X = [120, 140, 160, 180];
// Same curve as the CSS (ease-out cubic), so we can know where the surface is at any moment.
const levelAt = (t) => {
  const p = Math.min(1, Math.max(0, (t - FILL_DELAY) / FILL_TIME));
  return GLASS_BOTTOM - (GLASS_BOTTOM - SURFACE) * (1 - Math.pow(1 - p, 3));
};

// Smoke wisps start at the rim, each with its own width, speed, sway and drift so they never move together.
const SMOKE = [
  { d: "M118 112 C104 92 134 76 119 54 C107 34 130 20 121 2", width: 24, dur: 6.4, delay: 0, sway: 12, drift: -10 },
  { d: "M146 112 C160 94 134 78 149 56 C160 38 138 22 151 2", width: 30, dur: 7.6, delay: 1.7, sway: -13, drift: 12 },
  { d: "M174 112 C160 94 188 78 173 56 C164 38 183 22 176 4", width: 22, dur: 6, delay: 3.1, sway: 11, drift: 14 },
  { d: "M132 112 C122 96 144 84 134 64 C127 48 141 32 135 14", width: 17, dur: 5.4, delay: 0.9, sway: -10, drift: -14 },
  { d: "M160 112 C170 96 150 84 161 64 C168 48 154 32 160 14", width: 18, dur: 6.8, delay: 2.4, sway: 10, drift: 8 },
  { d: "M104 112 C96 98 114 86 106 68 C100 54 112 40 107 24", width: 15, dur: 7.2, delay: 4, sway: -9, drift: -16 },
  { d: "M188 112 C196 98 180 86 189 68 C195 54 183 40 188 24", width: 16, dur: 6.2, delay: 1.2, sway: 9, drift: 16 },
  { d: "M140 112 C130 94 152 80 141 58 C133 40 148 26 142 6", width: 20, dur: 8.2, delay: 4.8, sway: 12, drift: 4 }
];

const SPLASH = [
  [-16, -26], [-9, -34], [-2, -38], [6, -33], [13, -27], [19, -20]
];

// tiny grains that give the cube its sugary sparkle: [x, y, radius, light?]
const SUGAR_GRAINS = [
  [-11, -4, .9, 1], [-5, -7, .7, 0], [8, -8, .8, 1], [11, -2, .7, 0], [-12, 8, .7, 0], [9, 12, .9, 1], [-8, 14, .8, 1], [2, -10.5, .6, 0],
  [-2, -17, .8, 1], [8, -16, .7, 0], [17, -13, .7, 1], [19, -4, .7, 0], [18, 4, .8, 1], [17, 12, .6, 0], [-6, -15.5, .6, 0], [14, -17, .6, 0]
];

const BUBBLES = [
  [84, 140, 4], [96, 137, 3], [108, 141, 5], [121, 136, 3], [133, 140, 4], [146, 137, 5], [158, 141, 3],
  [170, 137, 4], [182, 140, 3], [194, 137, 5], [204, 141, 3], [90, 144, 2.5], [115, 145, 2.5], [176, 145, 2.5], [200, 145, 2]
];

export default function CoffeePour({ code, playSound = false }) {
  // Sound effects follow the same timeline as the animation (see lib/coffee-sounds.js).
  useEffect(() => {
    if (!playSound) return undefined;
    return playCoffeeScene({
      pourStart: 0.6,
      pourEnd: POUR_END,
      landings: [0, 1, 2, 3].map((i) => FIRST_DROP + i * DROP_GAP + FALL_TIME),
      chimeAt: REVEAL_AT + 0.15
    });
  }, [playSound]);

  const digits = String(code).split("").slice(0, 4);
  const wave = "M20 0 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V200 H20 Z";

  return (
    <div className="cp-wrap" aria-hidden="true" style={{ "--pour-end": `${POUR_END}s`, "--reveal": `${REVEAL_AT}s`, "--fill-delay": `${FILL_DELAY}s`, "--fill-time": `${FILL_TIME}s` }}>
      <svg className="cp-scene" viewBox="0 0 300 330" xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
        <defs>
          <clipPath id="cp-inside">
            <path d="M72 118 H216 L211 258 Q209 272 194 272 H94 Q79 272 77 258 Z" />
          </clipPath>
          <linearGradient id="cp-glass" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#cfe0e8" stopOpacity=".55" />
            <stop offset=".18" stopColor="#cfe0e8" stopOpacity=".16" />
            <stop offset=".8" stopColor="#cfe0e8" stopOpacity=".12" />
            <stop offset="1" stopColor="#cfe0e8" stopOpacity=".5" />
          </linearGradient>
          <linearGradient id="cp-coffee" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8a5530" />
            <stop offset=".16" stopColor="#5e3219" />
            <stop offset="1" stopColor="#2a1309" />
          </linearGradient>
          <linearGradient id="cp-crema" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#d9a06a" />
            <stop offset="1" stopColor="#a8693a" />
          </linearGradient>
          <linearGradient id="cp-stream" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#4a2412" />
            <stop offset=".45" stopColor="#8a5530" />
            <stop offset="1" stopColor="#3b1c0d" />
          </linearGradient>
          <linearGradient id="cp-sugar-front" x1="0" x2="0.4" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f1e6d2" />
          </linearGradient>
          <filter id="cp-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <linearGradient id="cp-smoke-fade" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="#f6f0e8" stopOpacity=".2" />
            <stop offset=".18" stopColor="#f6f0e8" stopOpacity="1" />
            <stop offset=".62" stopColor="#f3ece3" stopOpacity=".85" />
            <stop offset="1" stopColor="#f3ece3" stopOpacity="0" />
          </linearGradient>
          {/* the churning noise bends the wisps into soft, uneven curls instead of neat curves */}
          <filter id="cp-smoke" filterUnits="userSpaceOnUse" x="40" y="-30" width="220" height="160">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.035" numOctaves="2" seed="7" result="noise">
              <animate attributeName="baseFrequency" dur="9s" values="0.014 0.035;0.021 0.028;0.014 0.035" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" result="bent" />
            <feGaussianBlur in="bent" stdDeviation="2" result="soft" />
            {/* a faint warm-grey halo keeps the off-white smoke readable on the white card */}
            <feDropShadow in="soft" dx="0" dy="0" stdDeviation="3" floodColor="#76645a" floodOpacity=".7" />
          </filter>
        </defs>

        {/* soft shadow under the mug */}
        <ellipse className="cp-shadow" cx="146" cy="294" rx="86" ry="9" fill="#3a0a0f" opacity=".28" />

        <g className="cp-mug">
          {/* handle (behind the glass) */}
          <path d="M224 142 C264 138 272 178 264 208 C257 234 238 242 219 240" fill="none" stroke="rgba(110,145,162,.55)" strokeWidth="13" strokeLinecap="round" />
          <path d="M224 142 C262 139 269 178 262 207 C255 232 238 239 220 237" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.2" strokeLinecap="round" />

          {/* coffee, clipped to the inside of the glass */}
          <g clipPath="url(#cp-inside)">
            <g className="cp-liquid">
              <g transform="translate(0 134)">
                <g className="cp-wave-slide cp-wave-back">
                  <path d={wave} fill="url(#cp-crema)" opacity=".9" />
                </g>
              </g>
              <g transform="translate(0 138)">
                <g className="cp-wave-slide cp-wave-front">
                  <path d={wave} fill="url(#cp-coffee)" />
                </g>
              </g>
            </g>
          </g>

          {/* the coffee stream: drawn over the coffee, and shortened as the level rises so it always ends at the surface */}
          <g className="cp-stream-wrap">
            <g className="cp-stream-len">
              <g className="cp-stream-pinch">
                <g className="cp-stream-wobble">
                  <path d="M143 -12 C144 70 142 150 141 270 L159 270 C158 150 156 70 157 -12 Z" fill="url(#cp-stream)" />
                  <path d="M148 -12 C148.5 70 147.5 150 147 270" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="2" />
                </g>
              </g>
            </g>
          </g>

          {/* foam bubbles on the finished coffee */}
          <g className="cp-foam" clipPath="url(#cp-inside)">
            {BUBBLES.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill="#e6b883" stroke="#fff" strokeOpacity=".35" strokeWidth=".8" />
            ))}
          </g>

          {/* glass */}
          <path d="M64 112 H224 L218 262 Q216 280 198 280 H90 Q72 280 70 262 Z" fill="url(#cp-glass)" stroke="rgba(70,105,122,.8)" strokeWidth="2.6" strokeLinejoin="round" />
          <ellipse cx="144" cy="112" rx="80" ry="8" fill="none" stroke="rgba(70,105,122,.8)" strokeWidth="2.4" />
          <ellipse cx="144" cy="114" rx="75" ry="5.5" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" />
          <path d="M72 124 L76 250" stroke="#fff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
          <path d="M84 126 L87 214" stroke="#fff" strokeOpacity=".28" strokeWidth="2" strokeLinecap="round" />
          <path d="M214 130 L211 232" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />

          {/* NESCAFÉ logo printed straight on the glass (the artwork has its own red leaf, so no label plate) */}
          <svg x="82" y="150" width="124" height="98" viewBox="181 208 784 620" overflow="visible">
            <image className="cp-logo" href="/assets/nescafe-logo-mark.webp" x="0" y="0" width="1081" height="1080" />
          </svg>
        </g>

        {/* smoke rising off the hot coffee: several soft wisps drifting at different speeds */}
        <g className="cp-steam" filter="url(#cp-smoke)">
          {SMOKE.map((wisp, i) => (
            <path
              key={i}
              d={wisp.d}
              strokeWidth={wisp.width}
              style={{ "--dur": `${wisp.dur}s`, "--delay": `${POUR_END - 1.2 + wisp.delay}s`, "--sway": `${wisp.sway}px`, "--drift": `${wisp.drift}px` }}
            />
          ))}
        </g>

        {/* code digits dropping in with the pour */}
        {digits.map((digit, i) => {
          const dropAt = FIRST_DROP + i * DROP_GAP;
          const land = levelAt(dropAt + FALL_TIME) - 6;
          return (
            <g key={`${digit}-${i}`}>
              <g className="cp-token" style={{ "--x": `${DIGIT_X[i]}px`, "--land": `${land}px`, "--delay": `${dropAt}s`, "--fall": `${FALL_TIME}s`, "--rot": `${i % 2 ? 9 : -9}deg` }}>
                <g className="cp-token-body">
                  <g transform="scale(1.3) translate(-3.5 1.5)">
                  {/* a sugar cube: lit top, white front with the digit, shaded right side */}
                  <g strokeLinejoin="round" strokeLinecap="round">
                    <path d="M14 -12 L23 -21 L23 9 L14 18 Z" fill="#e3d6bf" stroke="#9c8566" strokeWidth="1.5" />
                    <path d="M-16 -12 L-7 -21 L23 -21 L14 -12 Z" fill="#ffffff" stroke="#9c8566" strokeWidth="1.5" />
                    <rect x="-16" y="-12" width="30" height="30" rx="2.5" fill="url(#cp-sugar-front)" stroke="#9c8566" strokeWidth="1.5" />
                  </g>
                  {SUGAR_GRAINS.map(([x, y, r, light], k) => (
                    <circle key={k} cx={x} cy={y} r={r} fill={light ? "#fff" : "#c9b693"} opacity={light ? 0.95 : 0.55} />
                  ))}
                  <path d="M-13 -9 L-7 -9" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".9" />
                  <text x="-1" y="11.5" textAnchor="middle" className="cp-digit-text">{digit}</text>
                  </g>
                </g>
              </g>
              <g className="cp-impact" style={{ "--x": `${DIGIT_X[i]}px`, "--y": `${land + 6}px`, "--hit": `${dropAt + FALL_TIME}s` }}>
                <ellipse className="cp-ripple" cx="0" cy="0" rx="9" ry="2.6" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" />
                <ellipse className="cp-ripple cp-ripple-2" cx="0" cy="0" rx="9" ry="2.6" fill="none" stroke="#e6b883" strokeOpacity=".8" strokeWidth="1.2" />
                {SPLASH.map(([dx, dy], k) => (
                  <circle key={k} className="cp-drop" cx="0" cy="0" r={k % 2 ? 2.2 : 3} fill="#a8693a" style={{ "--dx": `${dx}px`, "--dy": `${dy}px` }} />
                ))}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
