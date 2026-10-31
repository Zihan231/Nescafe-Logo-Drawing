"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, SpeakerHigh, SpeakerSlash, WarningCircle } from "@phosphor-icons/react";
import CoffeePour, { REVEAL_AT } from "@/components/CoffeePour";
import { setMuted, unlockAudio } from "@/lib/coffee-sounds";

const CONFETTI_COLORS = ["#ed1c2e", "#ffca28", "#fff3d6", "#5aa9f2", "#52d19b", "#ff8fb1"];

function makeConfetti(count = 48) {
  return Array.from({ length: count }, (_, id) => {
    const long = Math.random() > 0.5;
    return {
      id,
      x: `${(Math.random() * 100).toFixed(1)}%`,
      w: `${long ? 6 : 9}px`,
      h: `${long ? 14 : 9}px`,
      r: Math.random() > 0.6 ? "50%" : "2px",
      c: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
      d: `${(2.4 + Math.random() * 1.8).toFixed(2)}s`,
      delay: `${(Math.random() * 0.9).toFixed(2)}s`,
      drift: `${Math.round((Math.random() - 0.5) * 220)}px`,
      spin: `${Math.round(360 + Math.random() * 720)}deg`
    };
  });
}

const EMPTY_ERRORS = { name: "", phone: "", email: "", form: "" };

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { code, name, returning }
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);
  const [confetti, setConfetti] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const reduceMotion = useReducedMotion();
  const revealAt = reduceMotion ? 0 : REVEAL_AT; // when the pouring is done and the code shows

  // Confetti celebrates a new registration the moment the code appears, then clears itself.
  useEffect(() => {
    if (!result || result.returning || reduceMotion) return undefined;
    const start = setTimeout(() => setConfetti(makeConfetti()), REVEAL_AT * 1000);
    const stop = setTimeout(() => setConfetti([]), REVEAL_AT * 1000 + 5200);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [result, reduceMotion]);

  // Remember whether the visitor muted the coffee sounds.
  useEffect(() => {
    let off = false;
    try { off = localStorage.getItem("nescafe_sound") === "off"; } catch {}
    setSoundOn(!off);
    setMuted(off);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setMuted(!next);
    try { localStorage.setItem("nescafe_sound", next ? "on" : "off"); } catch {}
  };

  // Starting a registration starts a new visit, so any earlier verification on this device ends.
  useEffect(() => {
    fetch("/api/session", { method: "DELETE" }).catch(() => {});
  }, []);

  const validate = () => {
    const next = { ...EMPTY_ERRORS };
    if (!name.trim()) next.name = "Please enter your name.";
    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) next.phone = "Please enter your phone number.";
    else if (!/^\+?[\d\s\-().]+$/.test(phone.trim()) || digits.length < 7 || digits.length > 15) next.phone = "Enter a valid phone number (7 to 15 digits).";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = "That email address doesn't look right.";
    setErrors(next);
    return !next.name && !next.phone && !next.email;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    unlockAudio(); // the click/Enter that submits the form is what lets the browser play sound later
    if (submitting || !validate()) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors({ ...EMPTY_ERRORS, [data.field || "form"]: data.error || "Something went wrong. Please try again." });
        return;
      }
      setResult(data);
    } catch {
      setErrors({ ...EMPTY_ERRORS, form: "We couldn't reach the server. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(result.code);
      ok = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = result.code;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { ok = document.execCommand("copy"); } catch {}
      area.remove();
    }
    if (!ok) return;
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.main
      className="capture-screen screen register-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {confetti.length > 0 && (
        <div className="confetti-layer" aria-hidden="true">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={{ "--x": piece.x, "--w": piece.w, "--h": piece.h, "--r": piece.r, "--c": piece.c, "--d": piece.d, "--delay": piece.delay, "--drift": piece.drift, "--spin": piece.spin }}
            />
          ))}
        </div>
      )}

      <header className="editor-head">
        <div className="editor-ribbon ribbon-centered">
          <strong>MAKE YOUR WORLD</strong>
          <img src="/assets/nescafe-logo-trimmed.png" alt="NESCAFÉ — Make your world" />
        </div>
      </header>

      <div className="reg-scroll">
        <div className="reg-stage">
        <motion.div
          className="capture-card register-card"
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {!result ? (
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <h1 className="register-title">Register</h1>
              <p className="register-lead">Tell us who you are and we&apos;ll give you a code to start.</p>

              <div className="capture-name-block">
                <label htmlFor="register-name" className="capture-label">
                  <span>YOUR NAME <span className="capture-required-mark" aria-hidden="true">*</span></span>
                </label>
                <input
                  id="register-name"
                  type="text"
                  className="capture-name-input"
                  placeholder="Enter your name"
                  value={name}
                  maxLength={40}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "register-name-error" : undefined}
                  onChange={(event) => setName(event.target.value)}
                />
                {errors.name && <span className="capture-field-error" id="register-name-error" role="alert">{errors.name}</span>}
              </div>

              <div className="capture-name-block">
                <label htmlFor="register-phone" className="capture-label">
                  <span>PHONE NUMBER <span className="capture-required-mark" aria-hidden="true">*</span></span>
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  inputMode="tel"
                  className="capture-name-input"
                  placeholder="e.g. 01712 345678"
                  value={phone}
                  maxLength={20}
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "register-phone-error" : undefined}
                  onChange={(event) => setPhone(event.target.value)}
                />
                {errors.phone && <span className="capture-field-error" id="register-phone-error" role="alert">{errors.phone}</span>}
              </div>

              <div className="capture-name-block">
                <label htmlFor="register-email" className="capture-label">
                  <span>EMAIL <span className="register-optional">(optional)</span></span>
                </label>
                <input
                  id="register-email"
                  type="email"
                  inputMode="email"
                  className="capture-name-input"
                  placeholder="you@example.com"
                  value={email}
                  maxLength={190}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "register-email-error" : undefined}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {errors.email && <span className="capture-field-error" id="register-email-error" role="alert">{errors.email}</span>}
              </div>

              {errors.form && (
                <div className="register-form-error" role="alert">
                  <WarningCircle size={18} weight="bold" aria-hidden="true" />
                  <span>{errors.form}</span>
                </div>
              )}

              <motion.button
                type="submit"
                className="capture-confirm-btn"
                disabled={submitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{submitting ? "REGISTERING..." : "GET MY CODE"}</span>
                <ArrowRight weight="bold" size={20} />
              </motion.button>
            </form>
          ) : (
            <div className="register-success" role="status">
              <button
                type="button"
                className="cp-sound-btn"
                onClick={toggleSound}
                aria-pressed={soundOn}
                aria-label={soundOn ? "Mute sound" : "Turn sound on"}
                title={soundOn ? "Mute sound" : "Turn sound on"}
              >
                {soundOn ? <SpeakerHigh size={20} weight="bold" /> : <SpeakerSlash size={20} weight="bold" />}
              </button>
              <motion.h1
                className="register-title congrats-title"
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
              >
                {result.returning ? "Welcome back" : "Congratulations"}, {result.name.split(" ")[0]}!
              </motion.h1>
              <motion.p
                className="register-lead"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {result.returning
                  ? "This phone number is already registered, so here is your code again."
                  : "You're registered! Here is your code. Keep it safe, you'll type it on the big screen."}
              </motion.p>

              <CoffeePour code={result.code} playSound={!reduceMotion} />

              <div className="code-display">
                <div className="code-digits" aria-label={`Your code is ${result.code.split("").join(" ")}`}>
                  {result.code.split("").map((digit, index) => (
                    <motion.span
                      key={index}
                      className="code-digit"
                      aria-hidden="true"
                      initial={{ opacity: 0, y: 22, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: revealAt + index * 0.12, type: "spring", stiffness: 320, damping: 14 }}
                    >
                      {digit}
                    </motion.span>
                  ))}
                </div>
                <motion.button
                  type="button"
                  className={`code-copy-btn${copied ? " is-copied" : ""}`}
                  onClick={handleCopy}
                  aria-label={copied ? "Code copied" : "Copy code"}
                  title={copied ? "Copied!" : "Copy code"}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: revealAt + 0.5, type: "spring", stiffness: 300, damping: 16 }}
                >
                  {copied ? <Check size={22} weight="bold" /> : <Copy size={22} weight="bold" />}
                </motion.button>
              </div>
              <motion.span
                className="code-copy-note"
                aria-live="polite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: revealAt + 0.6 }}
              >
                {copied ? "Copied to clipboard" : "Tap the icon to copy"}
              </motion.span>

              <motion.p
                className="register-next"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: revealAt + 0.7 }}
              >
                Now go back to the big screen and type this code to start.
              </motion.p>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </motion.main>
  );
}
