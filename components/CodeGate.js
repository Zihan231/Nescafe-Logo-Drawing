"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Backspace, LockKey, ShieldCheck } from "@phosphor-icons/react";

const LENGTH = 5;
const EMPTY = Array(LENGTH).fill("");
const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

// Five boxes for the registration code, filled from the keypad below them. On a tablet the system
// keyboard would cover most of the screen, so the boxes never open it (inputMode "none"); a physical
// keyboard still types into them, moving on by itself, and a pasted code fills all five boxes at once.
export default function CodeGate({ checking, onVerified }) {
  const [digits, setDigits] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const boxes = useRef([]);
  const activeRef = useRef(0); // the box the keypad types into
  const restartRef = useRef(false); // a wrong code was entered: start again from the first box
  const code = digits.join("");

  useEffect(() => {
    if (!checking) boxes.current[0]?.focus();
  }, [checking]);

  useEffect(() => {
    if (busy || !restartRef.current) return;
    restartRef.current = false;
    boxes.current[0]?.focus();
  }, [busy]);

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

  // Keypad: a digit goes into the selected box and moves on; backspace clears that box, or the one before
  // it when it is already empty.
  const pressKey = (key) => {
    if (checking || busy) return;
    const index = activeRef.current;
    if (key === "clear") {
      setError("");
      setDigits(EMPTY);
      boxes.current[0]?.focus();
    } else if (key === "back") {
      const target = digits[index] ? index : Math.max(0, index - 1);
      setDigits((current) => current.map((digit, i) => (i === target ? "" : digit)));
      boxes.current[target]?.focus();
    } else {
      fill(key, index);
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
      activeRef.current = 0;
      restartRef.current = true; // the boxes are disabled while checking: focus the first one once they're back
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
      <h1 className="register-title">Enter Your MYW ID</h1>
      <p className="register-lead">
        {checking ? "Checking your session..." : "Type the 5-digit code you got during registration."}
      </p>

      <div className="code-boxes" role="group" aria-label="5-digit code" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { boxes.current[index] = element; }}
            className={`code-box${error ? " has-error" : ""}`}
            type="text"
            inputMode="none"
            pattern="[0-9]*"
            autoCorrect="off"
            spellCheck={false}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={LENGTH}
            value={digit}
            disabled={checking || busy}
            aria-label={`Digit ${index + 1} of ${LENGTH}`}
            aria-invalid={Boolean(error)}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => {
              activeRef.current = index;
              event.target.select();
            }}
          />
        ))}
      </div>

      {error && <span className="capture-field-error code-gate-error" role="alert">{error}</span>}

      <div className="code-keypad" role="group" aria-label="Number keypad">
        {KEYPAD.map((key) => (
          <button
            key={key}
            type="button"
            className={`code-key${key === "clear" || key === "back" ? " is-action" : ""}`}
            disabled={checking || busy}
            // keep the selected box focused, so the keypad keeps typing into it
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => pressKey(key)}
            aria-label={key === "back" ? "Delete digit" : key === "clear" ? "Clear code" : key}
          >
            {key === "back" ? <Backspace size={24} weight="bold" /> : key === "clear" ? "CLEAR" : key}
          </button>
        ))}
      </div>

      <div className="capture-btn-group">
        <motion.button
          type="button"
          className="capture-confirm-btn"
          onClick={submit}
          disabled={checking || busy || code.length !== LENGTH}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{busy ? "CHECKING..." : "START"}</span>
        </motion.button>
      </div>

      <p className="code-gate-note">Scan the QR code to register and get your code.</p>
    </motion.div>
  );
}
