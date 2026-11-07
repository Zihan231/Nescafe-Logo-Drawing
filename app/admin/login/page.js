import { notFound } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import { adminLoginSlug } from "@/lib/admin-login-path";

export const dynamic = "force-dynamic";

// Only a fallback for when no ADMIN_LOGIN_PATH is set. With a secret address, /admin/login is "page not found".
export default function AdminLoginFallback() {
  if (adminLoginSlug()) notFound();
  return <AdminLogin />;
}
