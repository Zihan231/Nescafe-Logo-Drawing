"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { ChartBar, ClockCounterClockwise, ImagesSquare, SignOut, UserGear, Users } from "@phosphor-icons/react";
import { ROLE_LABELS, can } from "@/lib/admin-permissions";
import { adminFetch } from "@/components/admin/api";

const AdminContext = createContext(null);

// The signed-in account and what it may do: const { admin, can } = useAdmin(); can("moderate")
export function useAdmin() {
  return useContext(AdminContext);
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: ChartBar, permission: "view" },
  { href: "/admin/designs", label: "Designs", icon: ImagesSquare, permission: "view" },
  { href: "/admin/users", label: "Visitors", icon: Users, permission: "view" },
  { href: "/admin/accounts", label: "Accounts", icon: UserGear, permission: "manageClients" },
  { href: "/admin/activity", label: "Activity log", icon: ClockCounterClockwise, permission: "viewActivity" }
];

export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const allowed = (permission) => can(admin.role, permission);

  const signOut = async () => {
    setSigningOut(true);
    try { await adminFetch("/api/admin/logout", { method: "POST", body: {} }); } catch {}
    window.location.href = "/"; // not the sign-in page: its address stays secret
  };

  return (
    <AdminContext.Provider value={{ admin, can: allowed }}>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <img src="/assets/nescafe-logo-trimmed.png" alt="NESCAFÉ" />
            <span>Admin</span>
          </div>
          <nav className="admin-nav" aria-label="Admin sections">
            {NAV.filter((item) => allowed(item.permission)).map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`admin-nav-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
                  <Icon size={18} weight={active ? "fill" : "regular"} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="admin-account">
            <div className="admin-account-name">{admin.username}</div>
            <div className={`admin-role admin-role-${admin.role}`}>{ROLE_LABELS[admin.role]}</div>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={signOut} disabled={signingOut}>
              <SignOut size={16} aria-hidden="true" />
              <span>{signingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </AdminContext.Provider>
  );
}
