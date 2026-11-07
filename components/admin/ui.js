"use client";

import { useEffect, useState } from "react";
import { CaretLeft, CaretRight, ImageBroken, X } from "@phosphor-icons/react";

// A design picture, or a clear note when its file isn't on this server (instead of a broken-image icon).
export function DesignImage({ src, alt = "", loading = "lazy" }) {
  const [missing, setMissing] = useState(false);
  useEffect(() => setMissing(false), [src]);
  if (missing) {
    return <span className="admin-img-missing"><ImageBroken size={22} aria-hidden="true" />Image file missing</span>;
  }
  return <img src={src} alt={alt} loading={loading} onError={() => setMissing(true)} />;
}

// A dialog on top of the page (Escape or the backdrop closes it).
export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`admin-modal${wide ? " is-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="admin-modal-head">
          <h2>{title}</h2>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// "Are you sure?" inside the page, for deletes and other changes that can't be undone.
export function ConfirmDialog({ title, message, confirmLabel = "Delete", danger = true, busy = false, onConfirm, onCancel, children }) {
  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel}>
      <p className="admin-modal-text">{message}</p>
      {children}
      <div className="admin-modal-actions">
        <button type="button" className="admin-btn" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="button" className={`admin-btn ${danger ? "admin-btn-danger" : "admin-btn-primary"}`} onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Pager({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return <p className="admin-muted admin-small">{total} in total</p>;
  return (
    <div className="admin-pager">
      <button type="button" className="admin-btn" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page"><CaretLeft size={16} /></button>
      <span>Page {page} of {pages} · {total} in total</span>
      <button type="button" className="admin-btn" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page"><CaretRight size={16} /></button>
    </div>
  );
}

export function Empty({ children }) {
  return <div className="admin-empty">{children}</div>;
}
