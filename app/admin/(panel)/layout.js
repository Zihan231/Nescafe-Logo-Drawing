import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { adminFromToken, publicAdmin } from "@/lib/admin-auth";
import { ADMIN_COOKIE } from "@/lib/admin-token";

export const dynamic = "force-dynamic";

// The signed-in part of the panel. proxy.js already answered "not found" to anyone without a token; this checks the
// account itself (still exists, enabled, password unchanged) and does the same if it fails, so the panel never
// points anyone to the sign-in page, whose address is secret.
export default async function AdminPanelLayout({ children }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const admin = await adminFromToken(token).catch(() => null);
  if (!admin) notFound();
  return <AdminShell admin={publicAdmin(admin)}>{children}</AdminShell>;
}
