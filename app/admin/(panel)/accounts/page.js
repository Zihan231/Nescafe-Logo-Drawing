"use client";

import { useCallback, useEffect, useState } from "react";
import { Key, Plus, Prohibit, Check, Trash } from "@phosphor-icons/react";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminFetch, formatDate } from "@/components/admin/api";
import { ConfirmDialog, Empty, Modal } from "@/components/admin/ui";
import { ROLE_LABELS, canManageRole } from "@/lib/admin-permissions";

const MIN_PASSWORD = 8;

export default function AdminAccounts() {
  const { admin: me, can } = useAdmin();
  const [accounts, setAccounts] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "client" });
  const [resetting, setResetting] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [own, setOwn] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setAccounts((await adminFetch("/api/admin/accounts")).accounts);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  // Runs one change, shows the outcome, reloads the list.
  const run = async (task, done) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      setNotice(done);
      await load();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    const ok = await run(() => adminFetch("/api/admin/accounts", { method: "POST", body: form }), `Login "${form.username.trim().toLowerCase()}" created.`);
    if (ok) {
      setCreating(false);
      setForm({ username: "", password: "", role: "client" });
    }
  };

  const reset = async (event) => {
    event.preventDefault();
    const ok = await run(() => adminFetch("/api/admin/accounts", { method: "PATCH", body: { id: resetting.id, password: newPassword } }), `New password set for "${resetting.username}". They are signed out everywhere.`);
    if (ok) setResetting(null);
  };

  const changeOwn = async (event) => {
    event.preventDefault();
    const ok = await run(() => adminFetch("/api/admin/password", { method: "POST", body: own }), "Your password was changed. Other sign-ins of your account have ended.");
    if (ok) setOwn({ currentPassword: "", newPassword: "" });
  };

  const manageable = (account) => account.id !== me.id && canManageRole(me.role, account.role);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Accounts</h1>
          <p className="admin-muted">
            {me.role === "super" ? "Admin and client logins. Clients can only look; they can't change anything." : "Client logins. Clients can only look; they can't change anything."}
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> New login</button>
      </header>

      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}

      {!accounts ? (
        !error && <p className="admin-muted">Loading…</p>
      ) : accounts.length === 0 ? (
        <Empty>No logins yet.</Empty>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Created</th><th>Last sign-in</th><th /></tr></thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td><strong>{account.username}</strong>{account.id === me.id && <span className="admin-muted"> (you)</span>}</td>
                  <td><span className={`admin-role admin-role-${account.role}`}>{ROLE_LABELS[account.role]}</span></td>
                  <td>{account.disabled ? <span className="admin-badge admin-badge-hidden">Turned off</span> : "Active"}</td>
                  <td className="nowrap">{formatDate(account.createdAt, false)}</td>
                  <td className="nowrap">{formatDate(account.lastLoginAt)}</td>
                  <td className="admin-row-actions">
                    {manageable(account) && (
                      <>
                        <button type="button" className="admin-btn admin-btn-small" disabled={busy} onClick={() => { setNewPassword(""); setResetting(account); }}><Key size={14} /> Reset password</button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-small"
                          disabled={busy}
                          onClick={() => run(() => adminFetch("/api/admin/accounts", { method: "PATCH", body: { id: account.id, disabled: !account.disabled } }), `"${account.username}" ${account.disabled ? "turned on" : "turned off and signed out"}.`)}
                        >
                          {account.disabled ? <><Check size={14} /> Turn on</> : <><Prohibit size={14} /> Turn off</>}
                        </button>
                        <button type="button" className="admin-btn admin-btn-small admin-btn-danger" disabled={busy} onClick={() => setDeleting(account)}><Trash size={14} /> Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {can("changeOwnPassword") && (
        <section className="admin-card admin-narrow">
          <h2>Change my password</h2>
          <form className="admin-form" onSubmit={changeOwn}>
            <label className="admin-field"><span>Current password</span>
              <input type="password" autoComplete="current-password" value={own.currentPassword} onChange={(event) => setOwn({ ...own, currentPassword: event.target.value })} required />
            </label>
            <label className="admin-field"><span>New password (at least {MIN_PASSWORD} characters)</span>
              <input type="password" autoComplete="new-password" minLength={MIN_PASSWORD} value={own.newPassword} onChange={(event) => setOwn({ ...own, newPassword: event.target.value })} required />
            </label>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>Change password</button>
          </form>
        </section>
      )}

      {creating && (
        <Modal title="New login" onClose={() => setCreating(false)}>
          <form className="admin-form" onSubmit={create}>
            <label className="admin-field"><span>Role</span>
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="client">{ROLE_LABELS.client}</option>
                {can("manageAdmins") && <option value="admin">{ROLE_LABELS.admin}</option>}
              </select>
            </label>
            <label className="admin-field"><span>Username (letters, numbers, dots, dashes)</span>
              <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoCapitalize="none" spellCheck={false} required />
            </label>
            <label className="admin-field"><span>Password (at least {MIN_PASSWORD} characters)</span>
              <input type="text" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={MIN_PASSWORD} autoComplete="off" required />
            </label>
            <p className="admin-muted admin-small">Share the password with them yourself. {form.role === "client" ? "Clients can't change it; reset it here if needed." : "They can change it after signing in."}</p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn" onClick={() => setCreating(false)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>{busy ? "Creating…" : "Create login"}</button>
            </div>
          </form>
        </Modal>
      )}

      {resetting && (
        <Modal title={`New password for ${resetting.username}`} onClose={() => setResetting(null)}>
          <form className="admin-form" onSubmit={reset}>
            <label className="admin-field"><span>New password (at least {MIN_PASSWORD} characters)</span>
              <input type="text" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={MIN_PASSWORD} autoComplete="off" required autoFocus />
            </label>
            <p className="admin-muted admin-small">They are signed out everywhere and need the new password to sign in again.</p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn" onClick={() => setResetting(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>Set password</button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete the login "${deleting.username}"?`}
          message="They are signed out and can't sign in again. Their past actions stay in the activity log."
          busy={busy}
          onConfirm={async () => {
            const ok = await run(() => adminFetch("/api/admin/accounts", { method: "DELETE", body: { id: deleting.id } }), `Login "${deleting.username}" deleted.`);
            if (ok) setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
