"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Copy, WarningCircle } from "@phosphor-icons/react";

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
              <h1 className="register-title">{result.returning ? "Welcome back" : "You're in"}, {result.name.split(" ")[0]}!</h1>
              <p className="register-lead">
                {result.returning
                  ? "This phone number is already registered, so here is your code again."
                  : "Here is your code. Keep it safe, you'll enter it on the next screen."}
              </p>

              <div className="code-display">
                <div className="code-digits" aria-label={`Your code is ${result.code.split("").join(" ")}`}>
                  {result.code.split("").map((digit, index) => (
                    <span key={index} className="code-digit" aria-hidden="true">{digit}</span>
                  ))}
                </div>
                <button
                  type="button"
                  className={`code-copy-btn${copied ? " is-copied" : ""}`}
                  onClick={handleCopy}
                  aria-label={copied ? "Code copied" : "Copy code"}
                  title={copied ? "Copied!" : "Copy code"}
                >
                  {copied ? <Check size={22} weight="bold" /> : <Copy size={22} weight="bold" />}
                </button>
              </div>
              <span className="code-copy-note" aria-live="polite">{copied ? "Copied to clipboard" : "Tap the icon to copy"}</span>

              <motion.button
                type="button"
                className="capture-confirm-btn"
                onClick={() => router.push("/capture")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>CONTINUE</span>
                <ArrowRight weight="bold" size={20} />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.main>
  );
}
