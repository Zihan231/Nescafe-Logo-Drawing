"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

const STEPS = [
  { title: "Scan the code", text: "Point your phone camera at the QR code." },
  { title: "Register on your phone", text: "Add your name and phone number to get your 4-digit code." },
  { title: "Enter it here", text: "Come back to this screen and type your code to start." }
];

// Shown from the code screen: the visitor scans this with their own phone, registers there, and then
// types the code they were given on this screen.
export default function ScanPage() {
  const router = useRouter();
  const [qr, setQr] = useState(null);
  const [link, setLink] = useState("");

  useEffect(() => {
    let alive = true;
    const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
    const target = `${base}/register`;
    setLink(target);
    import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(target, { width: 640, margin: 1, errorCorrectionLevel: "M", color: { dark: "#3a0a0e", light: "#ffffff" } }))
      .then((url) => alive && setQr(url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <motion.main
      className="capture-screen screen"
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

      <div className="capture-container">
        <motion.div
          className="capture-card scan-card"
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="scan-qr-side">
            <div className="scan-qr">
              {qr ? <img src={qr} alt="QR code that opens the NESCAFÉ registration page" draggable={false} /> : <span className="sk sk-qr-block" role="status" aria-label="Preparing the QR code" />}
            </div>
            <span className="scan-scan-label">SCAN WITH YOUR PHONE</span>
            {link && <span className="scan-link">{link.replace(/^https?:\/\//, "")}</span>}
          </div>

          <div className="scan-text-side">
            <h1 className="register-title">Get your code</h1>
            <p className="register-lead">Register on your own phone, then come back here with your code.</p>
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
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
