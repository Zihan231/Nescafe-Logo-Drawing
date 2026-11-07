"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDate } from "@/components/admin/api";
import { Empty, Pager } from "@/components/admin/ui";

const ACTION_LABELS = {
  login: "Signed in",
  login_failed: "Failed sign-in",
  logout: "Signed out",
  hide_designs: "Hid designs",
  unhide_designs: "Unhid designs",
  delete_designs: "Deleted designs",
  delete_visitors: "Deleted visitors",
  export_visitors: "Downloaded visitor CSV",
  create_account: "Created a login",
  reset_password: "Reset a password",
  disable_account: "Turned off a login",
  enable_account: "Turned on a login",
  delete_account: "Deleted a login",
  change_own_password: "Changed own password"
};

// A short line about what was affected, from the entry's details.
function describe(entry) {
  const d = entry.details;
  if (!d || typeof d !== "object") return entry.targetId && entry.targetType !== "admin" ? `${entry.targetType} ${entry.targetId.slice(0, 8)}` : "";
  const parts = [];
  if (d.username) parts.push(`${d.username}${d.role ? ` (${d.role})` : ""}`);
  if (typeof d.count === "number") parts.push(`${d.count} item${d.count === 1 ? "" : "s"}`);
  if (d.designsDeleted) parts.push(`+${d.designsDeleted} designs`);
  if (d.reason) parts.push(d.reason);
  return parts.join(" · ");
}

export default function AdminActivity() {
  const [filters, setFilters] = useState({ username: "", action: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const params = new URLSearchParams({ page: String(page) });
    if (filters.username) params.set("username", filters.username);
    if (filters.action) params.set("action", filters.action);
    try {
      setData(await adminFetch(`/api/admin/activity?${params}`));
    } catch (err) {
      setError(err.message);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filters]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Activity log</h1>
          <p className="admin-muted">Everything done in the admin panel, newest first. Only you (the super admin) can see this.</p>
        </div>
      </header>

      <div className="admin-filters">
        <select value={filters.username} onChange={(event) => setFilters({ ...filters, username: event.target.value })} aria-label="Account">
          <option value="">All accounts</option>
          {data?.usernames.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value })} aria-label="Action">
          <option value="">All actions</option>
          {data?.actions.map((action) => <option key={action} value={action}>{ACTION_LABELS[action] || action}</option>)}
        </select>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {!data ? (
        !error && <p className="admin-muted">Loading…</p>
      ) : data.entries.length === 0 ? (
        <Empty>Nothing logged yet.</Empty>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>When</th><th>Account</th><th>Action</th><th>Details</th><th>IP address</th></tr></thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={entry.id} className={entry.action === "login_failed" ? "is-warning" : undefined}>
                    <td className="nowrap">{formatDate(entry.createdAt)}</td>
                    <td><strong>{entry.username}</strong></td>
                    <td>{ACTION_LABELS[entry.action] || entry.action}</td>
                    <td>{describe(entry)}</td>
                    <td className="mono">{entry.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
