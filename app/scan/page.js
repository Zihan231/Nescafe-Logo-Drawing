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

// Little leaves that drift up behind the pack: [colour, left %, size px, seconds, delay seconds]
const LEAVES = [
  ["yellow", 6, 34, 11, 0],
  ["white", 20, 26, 13, 3.2],
  ["blue", 33, 30, 12, 6.1],
  ["red", 66, 28, 14, 1.4],
  ["yellow", 80, 32, 12, 4.8],
  ["white", 92, 24, 15, 7.5]
];

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
        <div className="scan-stage">
          <div className="scan-leaves" aria-hidden="true">
            {LEAVES.map(([colour, left, size, seconds, delay], index) => (
              <img key={index} className="scan-leaf" src={`/assets/leaves/leaf-${colour}.webp`} alt="" draggable={false} style={{ left: `${left}%`, width: size, animationDuration: `${seconds}s`, animationDelay: `${delay}s` }} />
            ))}
          </div>

          <motion.div className="scan-char-wrap scan-char-left" {...slide(-70, 0.55)}>
            <img className="scan-char scan-sway-a" src="/assets/characters/influencer.webp" alt="" draggable={false} />
          </motion.div>

          <motion.div className="scan-pack-wrap" {...rise(0.25)}>
            <div className="scan-pack">
              <div className="scan-pack-brand">
                <img src="/assets/nescafe-wordmark.webp" alt="NESCAFÉ" draggable={false} />
              </div>
              <div className="scan-qr">
                {qr ? <img src={qr} alt="QR code that opens the NESCAFÉ registration page" draggable={false} /> : <span className="sk sk-qr-block" role="status" aria-label="Preparing the QR code" />}
              </div>
              <span className="scan-pack-label">SCAN ME</span>
              {link && <span className="scan-pack-link">{link.replace(/^https?:\/\//, "")}</span>}
            </div>
          </motion.div>

          <motion.div className="scan-char-wrap scan-char-right" {...slide(70, 0.7)}>
            <img className="scan-char scan-sway-b" src="/assets/characters/gamer.webp" alt="" draggable={false} />
          </motion.div>
        </div>
        </div>
      </div>
    </motion.main>
  );
}
