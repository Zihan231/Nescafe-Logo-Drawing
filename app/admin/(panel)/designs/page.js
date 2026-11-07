"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckSquare, DownloadSimple, Eye, EyeSlash, MagnifyingGlass, Square, Trash } from "@phosphor-icons/react";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminFetch, dayEnd, dayStart, formatBytes, formatDate } from "@/components/admin/api";
import { ConfirmDialog, DesignImage, Empty, Modal, Pager } from "@/components/admin/ui";

const image = (id, card = false) => `/api/admin/image/${id}${card ? "-frame" : ""}.png`;

export default function AdminDesigns() {
  const { can } = useAdmin();
  const moderate = can("moderate");
  const [filters, setFilters] = useState({ q: "", visibility: "all", profession: "", from: "", to: "", sort: "newest" });
  const [search, setSearch] = useState(""); // typed text, applied after a short pause
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [open, setOpen] = useState(null); // design shown in the detail view
  const [confirm, setConfirm] = useState(null); // ids waiting for "delete?" confirmation
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setFilters((current) => (current.q === search ? current : { ...current, q: search })), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setError("");
    const params = new URLSearchParams({ page: String(page), sort: filters.sort, visibility: filters.visibility });
    if (filters.q) params.set("q", filters.q);
    if (filters.profession) params.set("profession", filters.profession);
    if (filters.from) params.set("from", dayStart(filters.from));
    if (filters.to) params.set("to", dayEnd(filters.to));
    try {
      setData(await adminFetch(`/api/admin/designs?${params}`));
    } catch (err) {
      setError(err.message);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); setSelected(new Set()); }, [filters]);

  const setFilter = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  const toggle = (id) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const allOnPage = data?.designs.length > 0 && data.designs.every((design) => selected.has(design.id));
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(data.designs.map((design) => design.id)));

  const act = async (ids, change) => {
    setBusy(true);
    setNotice("");
    try {
      if (change === "delete") {
        const { count } = await adminFetch("/api/admin/designs", { method: "DELETE", body: { ids } });
        setNotice(`${count} design${count === 1 ? "" : "s"} deleted.`);
      } else {
        const hidden = change === "hide";
        const { count } = await adminFetch("/api/admin/designs", { method: "PATCH", body: { ids, hidden } });
        setNotice(`${count} design${count === 1 ? "" : "s"} ${hidden ? "hidden from the wall and download page" : "visible again"}.`);
      }
      setSelected(new Set());
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
          <h1>Designs</h1>
          <p className="admin-muted">{moderate ? "Hide a design to take it off the wall and block its download; delete removes it for good." : "Every design visitors have sent."}</p>
        </div>
      </header>

      <div className="admin-filters">
        <label className="admin-search">
          <MagnifyingGlass size={16} aria-hidden="true" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Visitor name, phone or code" aria-label="Search by visitor" />
        </label>
        <select value={filters.visibility} onChange={setFilter("visibility")} aria-label="Visibility">
          <option value="all">All designs</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
        <select value={filters.profession} onChange={setFilter("profession")} aria-label="Profession">
          <option value="">All professions</option>
          {data?.professions.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <label className="admin-date">From <input type="date" value={filters.from} onChange={setFilter("from")} /></label>
        <label className="admin-date">To <input type="date" value={filters.to} onChange={setFilter("to")} /></label>
        <select value={filters.sort} onChange={setFilter("sort")} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="largest">Largest file</option>
          <option value="smallest">Smallest file</option>
          <option value="profession">By profession</option>
        </select>
      </div>

      {moderate && data?.designs.length > 0 && (
        <div className="admin-bulkbar">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={toggleAll}>
            {allOnPage ? <CheckSquare size={16} weight="fill" /> : <Square size={16} />} {allOnPage ? "Clear selection" : "Select page"}
          </button>
          {selected.size > 0 && (
            <>
              <span className="admin-muted">{selected.size} selected</span>
              <button type="button" className="admin-btn" disabled={busy} onClick={() => act([...selected], "hide")}><EyeSlash size={16} /> Hide</button>
              <button type="button" className="admin-btn" disabled={busy} onClick={() => act([...selected], "unhide")}><Eye size={16} /> Unhide</button>
              <button type="button" className="admin-btn admin-btn-danger" disabled={busy} onClick={() => setConfirm([...selected])}><Trash size={16} /> Delete</button>
            </>
          )}
        </div>
      )}

      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}

      {!data ? (
        !error && <p className="admin-muted">Loading…</p>
      ) : data.designs.length === 0 ? (
        <Empty>No designs match these filters.</Empty>
      ) : (
        <>
          <ul className="admin-design-grid">
            {data.designs.map((design) => (
              <li key={design.id} className={`admin-design${design.hidden ? " is-hidden" : ""}${selected.has(design.id) ? " is-selected" : ""}`}>
                <button type="button" className="admin-design-thumb" onClick={() => setOpen(design)} aria-label="Open design">
                  <DesignImage src={image(design.id)} />
                  {design.hidden && <span className="admin-badge admin-badge-hidden"><EyeSlash size={12} /> Hidden</span>}
                </button>
                {moderate && (
                  <label className="admin-design-check">
                    <input type="checkbox" checked={selected.has(design.id)} onChange={() => toggle(design.id)} aria-label="Select design" />
                  </label>
                )}
                <div className="admin-design-meta">
                  <strong>{design.user?.name || "Unknown visitor"}</strong>
                  <span>{design.profession || "—"} · {formatDate(design.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
          <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
        </>
      )}

      {open && (
        <Modal title="Design" onClose={() => setOpen(null)} wide>
          <div className="admin-design-detail">
            <div className="admin-design-images">
              <figure>
                <DesignImage src={image(open.id)} alt="Design" loading="eager" />
                <figcaption>Design</figcaption>
              </figure>
              <figure>
                <img src={image(open.id, true)} alt="Take-home card" onError={(event) => { event.currentTarget.parentElement.hidden = true; }} />
                <figcaption>Take-home card</figcaption>
              </figure>
            </div>
            <dl className="admin-dl">
              <dt>Status</dt><dd>{open.hidden ? `Hidden (since ${formatDate(open.hiddenAt)})` : "Visible on the wall"}</dd>
              <dt>Visitor</dt><dd>{open.user?.name || "Unknown (sent before designs were linked to visitors)"}</dd>
              {open.user && (<><dt>Phone</dt><dd>{open.user.phoneDisplay}</dd><dt>Email</dt><dd>{open.user.email || "—"}</dd><dt>Code</dt><dd>{open.user.code}</dd></>)}
              <dt>Profession</dt><dd>{open.profession || "—"}</dd>
              <dt>Sent</dt><dd>{formatDate(open.createdAt)}</dd>
              <dt>Size</dt><dd>{open.width} × {open.height} px · {formatBytes(open.fileSize)}</dd>
            </dl>
            <div className="admin-modal-actions">
              <a className="admin-btn" href={`${image(open.id)}?download=1`}><DownloadSimple size={16} /> Design</a>
              <a className="admin-btn" href={`${image(open.id, true)}?download=1`}><DownloadSimple size={16} /> Card</a>
              {moderate && (
                <>
                  <button type="button" className="admin-btn" disabled={busy} onClick={() => act([open.id], open.hidden ? "unhide" : "hide")}>
                    {open.hidden ? <><Eye size={16} /> Unhide</> : <><EyeSlash size={16} /> Hide</>}
                  </button>
                  <button type="button" className="admin-btn admin-btn-danger" disabled={busy} onClick={() => setConfirm([open.id])}><Trash size={16} /> Delete</button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.length === 1 ? "Delete this design?" : `Delete ${confirm.length} designs?`}
          message="The design and its take-home card are removed for good and leave the wall straight away. This can't be undone. To keep them, hide them instead."
          busy={busy}
          onConfirm={() => act(confirm, "delete")}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
