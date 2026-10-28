"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import CodeGate from "@/components/CodeGate";

// Shown at /capture (via proxy.js) until the visitor has entered a valid code.
export default function VerifyPage() {
  const router = useRouter();

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
          <button className="nav-back" onClick={() => router.push("/")} aria-label="Back to home page">
            <ArrowLeft weight="bold" /> <span>BACK</span>
          </button>
          <strong>LET&apos;S MAKE YOUR WORLD</strong>
          <img src="/assets/nescafe-logo-trimmed.png" alt="NESCAFÉ — Make your world" />
        </div>
      </header>

      <div className="capture-container">
        {/* Refreshing in place (not a page load) lets the server see the new cookie and serve the real
            capture page without leaving full screen mode. */}
        <CodeGate checking={false} onVerified={() => router.refresh()} />
      </div>
    </motion.main>
  );
}
