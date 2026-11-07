"use client";

import { useState } from "react";
import { LockKey } from "@phosphor-icons/react";

// The admin sign-in form. Served only at the secret address (app/[portal]/page.js), or at /admin/login when no
// ADMIN_LOGIN_PATH is set (app/admin/login/page.js).
export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not sign you in.");
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <img className="admin-login-logo" src="/assets/nescafe-logo-trimmed.png" alt="NESCAFÉ" />
        <h1 className="admin-login-title">
          <LockKey size={20} weight="bold" aria-hidden="true" /> Admin sign in
        </h1>
        <label className="admin-field">
          <span>Username</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit" className="admin-btn admin-btn-primary admin-btn-block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
