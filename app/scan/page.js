"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

const STEPS = [
  { title: "Scan the code", text: "Point your phone camera at the QR code." },
  { title: "Register on your phone", text: "Add your name and number to get your 4-digit code." }
];

// Leaves fall from the top of the screen like leaves off a tree: each drops at its own speed, swings from
// side to side and tumbles as it goes. Seeded, so the server and the browser draw the same ones.
const LEAVES = (() => {
  let seed = 23;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const colours = ["yellow", "white", "red", "blue", "yellow", "white"];
  return Array.from({ length: 26 }, (_, index) => {
    const fall = 9 + rand() * 9; // seconds to fall the whole screen
    return {
      colour: colours[index % colours.length],
      left: rand() * 98,
      size: 20 + rand() * 26,
      fall,
      delay: -rand() * fall, // negative, so the screen is already full of falling leaves on arrival
      sway: 22 + rand() * 60, // how far it swings sideways (px)
      swayTime: 2.8 + rand() * 3.4,
      tumbleTime: 2.2 + rand() * 3,
      tilt: 25 + rand() * 45,
      flip: rand() > 0.35
    };
  });
})();

// Shown from the code screen: the visitor scans this with their own phone, registers there, and then
// types the code they were given on this screen. The QR code is the hero, printed on a NESCAFÉ pack
// with two of the characters standing beside it.
export default function ScanPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [qr, setQr] = useState(null);
  const [link, setLink] = useState("");

  useEffect(() => {
    let alive = true;
    const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
    const target = `${base}/register`;
    setLink(target);
    import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(target, { width: 800, margin: 1, errorCorrectionLevel: "M", color: { dark: "#3a0a0e", light: "#ffffff" } }))
      .then((url) => alive && setQr(url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const rise = (delay) => (reduceMotion ? {} : { initial: { opacity: 0, y: 70, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { delay, type: "spring", stiffness: 120, damping: 17 } });
  const slide = (from, delay) => (reduceMotion ? {} : { initial: { opacity: 0, x: from }, animate: { opacity: 1, x: 0 }, transition: { delay, type: "spring", stiffness: 90, damping: 16 } });

  return (
    <motion.main
      className="capture-screen screen scan-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="editor-head">
        <div className="editor-ribbon">
          <button className="nav-back" onClick={() => router.push("/capture")} aria-label="Back to the code screen">
            <ArrowLeft weight="bold" /> <span>BACK</span>
          </button>
          <strong>LET&apos;S MAKE YOUR WORLD</strong>
          <img src="/assets/nescafe-logo-trimmed.png" alt="NESCAFÉ — Make your world" />
        </div>
      </header>

      <div className="scan-leaves" aria-hidden="true">
        {LEAVES.map((leaf, index) => (
          <span key={index} className="scan-leaf-fall" style={{ left: `${leaf.left.toFixed(1)}%`, animationDuration: `${leaf.fall.toFixed(2)}s`, animationDelay: `${leaf.delay.toFixed(2)}s` }}>
            <span className="scan-leaf-sway" style={{ "--amp": `${leaf.sway.toFixed(0)}px`, animationDuration: `${leaf.swayTime.toFixed(2)}s` }}>
              <img
                className={`scan-leaf-tumble${leaf.flip ? " is-flipping" : ""}`}
                src={`/assets/leaves/leaf-${leaf.colour}.webp`}
                alt=""
                draggable={false}
                style={{ width: leaf.size, "--tilt": `${leaf.tilt.toFixed(0)}deg`, animationDuration: `${leaf.tumbleTime.toFixed(2)}s` }}
              />
            </span>
          </span>
        ))}
      </div>

      <div className="scan-layout">
        <motion.div className="scan-info" initial={reduceMotion ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
          <h1 className="scan-title">Get your code</h1>
          <p className="scan-lead">Register on your own phone, then come back here with your code.</p>
          <ol className="scan-steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="scan-step-number" aria-hidden="true">{index + 1}</span>
                <span className="scan-step-copy">
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </motion.div>

        <div className="scan-stage-col">
          <div className="scan-stage scan-billboard-stage">
            <div className="scan-ground" aria-hidden="true" />

            <motion.div className="scan-board-wrap" {...rise(0.25)}>
              <div className="scan-bb">
                {/* the structure: frame, gooseneck lamps, posts, bracing and concrete footings */}
                <svg className="scan-bb-art" viewBox="0 0 800 1000" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="bb-steel" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0" stopColor="#3b3634" />
                      <stop offset=".42" stopColor="#9a918c" />
                      <stop offset=".62" stopColor="#6a625e" />
                      <stop offset="1" stopColor="#332e2c" />
                    </linearGradient>
                    <linearGradient id="bb-frame" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#58504d" />
                      <stop offset=".08" stopColor="#2d2827" />
                      <stop offset="1" stopColor="#1d1918" />
                    </linearGradient>
                    <linearGradient id="bb-concrete" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#b3aca6" />
                      <stop offset="1" stopColor="#7d7771" />
                    </linearGradient>
                    <radialGradient id="bb-shadow" cx=".5" cy=".5" r=".5">
                      <stop offset="0" stopColor="#3a0008" stopOpacity=".55" />
                      <stop offset="1" stopColor="#3a0008" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <ellipse cx="400" cy="978" rx="400" ry="22" fill="url(#bb-shadow)" />

                  {/* posts with cross bracing */}
                  <g>
                    <path d="M290 842 L510 932 M510 842 L290 932" stroke="#463f3c" strokeWidth="9" strokeLinecap="round" />
                    <rect x="282" y="878" width="236" height="10" fill="#4f4845" />
                    <rect x="262" y="820" width="44" height="140" fill="url(#bb-steel)" />
                    <rect x="494" y="820" width="44" height="140" fill="url(#bb-steel)" />
                    <rect x="262" y="820" width="44" height="140" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="2" />
                    <rect x="494" y="820" width="44" height="140" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="2" />
                    {[284, 516].map((x) => (
                      <g key={x}>
                        <rect x={x - 38} y="952" width="76" height="12" rx="2" fill="#2d2827" />
                        <circle cx={x - 28} cy="958" r="3.4" fill="#8f8782" />
                        <circle cx={x + 28} cy="958" r="3.4" fill="#8f8782" />
                        <path d={`M${x - 56} 964 H${x + 56} L${x + 64} 978 H${x - 64} Z`} fill="url(#bb-concrete)" />
                      </g>
                    ))}
                    {/* brackets from the posts to the frame */}
                    <path d="M262 822 L206 812 H330 L306 822 Z M494 822 L470 812 H594 L538 822 Z" fill="#2d2827" />
                  </g>

                  {/* frame */}
                  <rect x="40" y="95" width="720" height="722" rx="12" fill="url(#bb-frame)" />
                  <rect x="40" y="95" width="720" height="722" rx="12" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" />
                  <rect x="40" y="800" width="720" height="22" rx="4" fill="#26211f" />
                  <rect x="40" y="800" width="720" height="4" fill="rgba(255,255,255,.18)" />

                  {/* gooseneck lamps */}
                  {[170, 400, 630].map((x) => (
                    <g key={x}>
                      <rect x={x - 14} y="86" width="28" height="12" rx="3" fill="#2d2827" />
                      <path d={`M${x} 88 L${x} 56 Q${x} 18 ${x + 40} 18`} fill="none" stroke="#5b5350" strokeWidth="9" strokeLinecap="round" />
                      <path d={`M${x + 22} 14 H${x + 84} L${x + 74} 44 H${x + 32} Z`} fill="#3a3432" stroke="#6b625e" strokeWidth="2" />
                      <rect x={x + 36} y="42" width="34" height="6" rx="3" fill="#fff3cf" />
                    </g>
                  ))}
                </svg>

                <div className="scan-bb-face">
                  <div className="scan-bb-brand">
                    <img src="/assets/nescafe-wordmark.webp" alt="NESCAFÉ" draggable={false} />
                  </div>
                  <div className="scan-qr">
                    {qr ? <img src={qr} alt="QR code that opens the NESCAFÉ registration page" draggable={false} /> : <span className="sk sk-qr-block" role="status" aria-label="Preparing the QR code" />}
                  </div>
                  <span className="scan-bb-label">SCAN ME</span>
                  {link && <span className="scan-bb-link">{link.replace(/^https?:\/\//, "")}</span>}
                </div>

                {/* a soft beam from each lamp, fading out well before the middle of the poster */}
                <svg className="scan-bb-light" viewBox="0 0 800 1000" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="bb-beam" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#fff4d2" stopOpacity=".75" />
                      <stop offset=".5" stopColor="#fff4d2" stopOpacity=".22" />
                      <stop offset="1" stopColor="#fff4d2" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="bb-bulb" cx=".5" cy=".5" r=".5">
                      <stop offset="0" stopColor="#fff8e0" stopOpacity=".95" />
                      <stop offset="1" stopColor="#fff8e0" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {[170, 400, 630].map((x) => (
                    <g key={x}>
                      <circle cx={x + 53} cy="48" r="26" fill="url(#bb-bulb)" />
                      <polygon points={`${x + 40},48 ${x + 66},48 ${x + 150},290 ${x - 44},290`} fill="url(#bb-beam)" />
                    </g>
                  ))}
                </svg>

              </div>
            </motion.div>

            {/* leaning on the left edge of the board */}
            <motion.div className="scan-man-wrap" {...(reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5, duration: 0.7 } })}>
              <img className="scan-man" src="/assets/characters/boy.webp" alt="" draggable={false} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
