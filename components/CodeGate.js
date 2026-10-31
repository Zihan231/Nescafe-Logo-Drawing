"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ClipboardText, LockKey, ShieldCheck } from "@phosphor-icons/react";

const LENGTH = 4;
const EMPTY = Array(LENGTH).fill("");

// Four boxes for the registration code. Typing moves on by itself, and a pasted code
// (from the Paste button or Ctrl+V in any box) fills all four boxes at once.
export default function CodeGate({ checking, onVerified }) {
  const [digits, setDigits] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const boxes = useRef([]);
  const code = digits.join("");

  useEffect(() => {
    if (!checking) boxes.current[0]?.focus();
  }, [checking]);

  const fill = (text, startAt = 0) => {
    const incoming = text.replace(/\D/g, "").slice(0, LENGTH - startAt).split("");
    if (!incoming.length) return;
    setError("");
    setDigits((current) => {
      const next = [...current];
      incoming.forEach((digit, offset) => { next[startAt + offset] = digit; });
      return next;
    });
    boxes.current[Math.min(startAt + incoming.length, LENGTH - 1)]?.focus();
  };

  const handleChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (!value) {
      setDigits((current) => current.map((digit, i) => (i === index ? "" : digit)));
      return;
    }
    fill(value, index);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((current) => current.map((digit, i) => (i === index - 1 ? "" : digit)));
      boxes.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      boxes.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < LENGTH - 1) {
      event.preventDefault();
      boxes.current[index + 1]?.focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text");
    setDigits(EMPTY);
    fill(text, 0);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.replace(/\D/g, "")) {
        setError("There is no code on your clipboard yet.");
        return;
      }
      setDigits(EMPTY);
      fill(text, 0);
    } catch {
      setError("Your browser blocked clipboard access. Click a box and press Ctrl+V instead.");
      boxes.current[0]?.focus();
    }
  };

  const submit = async () => {
    if (busy || code.length !== LENGTH) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        onVerified(data.name || "");
        return;
      }
      setError(data.error || "That code isn't right. Check it and try again.");
      setDigits(EMPTY);
      boxes.current[0]?.focus();
    } catch {
      setError("We couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="capture-card code-gate"
      initial={{ scale: 0.95, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="code-gate-icon" aria-hidden="true">
        {checking ? <ShieldCheck size={30} weight="duotone" /> : <LockKey size={30} weight="duotone" />}
      </div>
      <h1 className="register-title">Enter your code</h1>
      <p className="register-lead">
        {checking ? "Checking your session..." : "Type the 4-digit code you got when you registered on your phone."}
      </p>

      <div className="code-boxes" role="group" aria-label="4-digit code" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { boxes.current[index] = element; }}
            className={`code-box${error ? " has-error" : ""}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={LENGTH}
            value={digit}
            disabled={checking || busy}
            aria-label={`Digit ${index + 1} of ${LENGTH}`}
            aria-invalid={Boolean(error)}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>

      {error && <span className="capture-field-error code-gate-error" role="alert">{error}</span>}

      <div className="capture-btn-group">
        <button type="button" className="capture-secondary-btn" onClick={pasteFromClipboard} disabled={checking || busy}>
          <ClipboardText weight="bold" size={18} />
          <span>PASTE</span>
        </button>
        <motion.button
          type="button"
          className="capture-confirm-btn"
          onClick={submit}
          disabled={checking || busy || code.length !== LENGTH}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{busy ? "CHECKING..." : "VERIFY"}</span>
        </motion.button>
      </div>

      <p className="code-gate-note">Scan the QR code to register and get your code.</p>
    </motion.div>
  );
}
