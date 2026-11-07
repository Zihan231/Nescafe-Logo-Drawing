"use client";

import { useCallback, useEffect, useState } from "react";
import { DownloadSimple, EyeSlash, MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminFetch, formatDate } from "@/components/admin/api";
import { ConfirmDialog, DesignImage, Empty, Modal, Pager } from "@/components/admin/ui";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "verified", label: "Entered code (latest)" },
  { value: "designs", label: "Most designs" }
];

export default function AdminUsers() {
  const { can } = useAdmin();
  const moderate = can("moderate");
  const [filters, setFilters] = useState({ q: "", status: "", sort: "newest" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null); // visitor with their designs
  const [confirm, setConfirm] = useState(null);
  const [alsoDesigns, setAlsoDesigns] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setFilters((current) => (current.q === search ? current : { ...current, q: search })), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const query = new URLSearchParams({ sort: filters.sort, ...(filters.q && { q: filters.q }), ...(filters.status && { status: filters.status }) });

  const load = useCallback(async () => {
    setError("");
    const params = new URLSearchParams({ page: String(page), sort: filters.sort });
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    try {
      setData(await adminFetch(`/api/admin/users?${params}`));
    } catch (err) {
      setError(err.message);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filters]);

  const openVisitor = async (id) => {
    setError("");
    try {
      setOpen((await adminFetch(`/api/admin/users?id=${id}`)).user);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { count, designCount } = await adminFetch("/api/admin/users", { method: "DELETE", body: { ids: [confirm.id], alsoDeleteDesigns: alsoDesigns } });
      setNotice(`${count} visitor deleted${designCount ? `, with ${designCount} design${designCount === 1 ? "" : "s"}` : ""}.`);
      setConfirm(null);
      setOpen(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Visitors</h1>
          <p className="admin-muted">Everyone who registered. Click a row to see their designs.</p>
        </div>
        <a className="admin-btn admin-btn-primary" href={`/api/admin/users/export?${query}`}>
          <DownloadSimple size={16} aria-hidden="true" /> Download CSV
        </a>
      </header>

      <div className="admin-filters">
        <label className="admin-search">
          <MagnifyingGlass size={16} aria-hidden="true" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, email or code" aria-label="Search visitors" />
        </label>
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} aria-label="Status">
          <option value="">All visitors</option>
          <option value="verified">Entered their code</option>
          <option value="unverified">Never entered their code</option>
          <option value="designed">Sent a design</option>
        </select>
        <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} aria-label="Sort">
          {SORTS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
        </select>
      </div>

      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}

      {!data ? (
        !error && <p className="admin-muted">Loading…</p>
      ) : data.users.length === 0 ? (
        <Empty>No visitors match.</Empty>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-rows">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Email</th><th>Code</th><th>Registered</th><th>Entered code</th><th className="num">Designs</th></tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id} onClick={() => openVisitor(user.id)} tabIndex={0} onKeyDown={(event) => event.key === "Enter" && openVisitor(user.id)}>
                    <td><strong>{user.name}</strong></td>
                    <td className="nowrap">{user.phoneDisplay}</td>
                    <td>{user.email || "—"}</td>
                    <td className="mono">{user.code}</td>
                    <td className="nowrap">{formatDate(user.createdAt)}</td>
                    <td className="nowrap">{user.verifiedAt ? formatDate(user.verifiedAt) : <span className="admin-muted">Not yet</span>}</td>
                    <td className="num">{user.designCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
        </>
      )}

      {open && (
        <Modal title={open.name} onClose={() => setOpen(null)} wide>
          <dl className="admin-dl">
            <dt>Phone</dt><dd>{open.phoneDisplay}</dd>
            <dt>Email</dt><dd>{open.email || "—"}</dd>
            <dt>Code</dt><dd className="mono">{open.code}</dd>
            <dt>Registered</dt><dd>{formatDate(open.createdAt)}</dd>
            <dt>Entered code</dt><dd>{open.verifiedAt ? formatDate(open.verifiedAt) : "Not yet"}</dd>
            <dt>Designs</dt><dd>{open.designCount}</dd>
          </dl>
          {open.designs.length > 0 && (
            <ul className="admin-design-grid admin-design-grid-small">
              {open.designs.map((design) => (
                <li key={design.id} className={`admin-design${design.hidden ? " is-hidden" : ""}`}>
                  <div className="admin-design-thumb">
                    <DesignImage src={`/api/admin/image/${design.id}.png`} />
                    {design.hidden && <span className="admin-badge admin-badge-hidden"><EyeSlash size={12} /> Hidden</span>}
                  </div>
                  <div className="admin-design-meta"><span>{formatDate(design.createdAt)}</span></div>
                </li>
              ))}
            </ul>
          )}
          {moderate && (
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => { setAlsoDesigns(false); setConfirm(open); }}>
                <Trash size={16} /> Delete visitor
              </button>
            </div>
          )}
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title={`Delete ${confirm.name}?`}
          message="Their name, phone number, email and code are removed for good, and their code stops working. This can't be undone."
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirm(null)}
        >
          {confirm.designCount > 0 && (
            <label className="admin-check">
              <input type="checkbox" checked={alsoDesigns} onChange={(event) => setAlsoDesigns(event.target.checked)} />
              <span>Also delete their {confirm.designCount} design{confirm.designCount === 1 ? "" : "s"} (otherwise they stay, without a name)</span>
            </label>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
