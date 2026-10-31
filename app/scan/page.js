"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

const STEPS = [
  { title: "Scan the code", text: "Point your phone camera at the QR code." },
  { title: "Register on your phone", text: "Add your name and number to get your 4-digit code." },
  { title: "Enter it here", text: "Come back to this screen and type your code." }
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
          <motion.button
            type="button"
            className="capture-confirm-btn scan-have-code"
            onClick={() => router.push("/capture")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>I HAVE MY CODE</span>
            <ArrowRight weight="bold" size={20} />
          </motion.button>
        </motion.div>

        <div className="scan-stage-col">
          <div className="scan-stage scan-billboard-stage">
            <div className="scan-ground" aria-hidden="true" />

            <motion.div className="scan-board-wrap" {...rise(0.25)}>
              <div className="scan-board">
                <div className="scan-board-lamps" aria-hidden="true"><i /><i /><i /></div>
                <div className="scan-board-face">
                  <div className="scan-board-brand">
                    <img src="/assets/nescafe-wordmark.webp" alt="NESCAFÉ" draggable={false} />
                  </div>
                  <div className="scan-qr">
                    {qr ? <img src={qr} alt="QR code that opens the NESCAFÉ registration page" draggable={false} /> : <span className="sk sk-qr-block" role="status" aria-label="Preparing the QR code" />}
                  </div>
                  <span className="scan-board-label">SCAN ME</span>
                  {link && <span className="scan-board-link">{link.replace(/^https?:\/\//, "")}</span>}
                </div>
                <div className="scan-board-posts" aria-hidden="true"><i /><i /></div>
              </div>
            </motion.div>

            {/* leaning on the left edge of the board */}
            <motion.div className="scan-man-wrap" {...(reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5, duration: 0.7 } })}>
              <img className="scan-man" src="/assets/characters/young-man.webp" alt="" draggable={false} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
