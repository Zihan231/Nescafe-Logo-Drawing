import { notFound } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import { adminLoginSlug } from "@/lib/admin-login-path";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · NESCAFÉ Make Your World", robots: { index: false, follow: false } };

// Any one-word address that isn't a page of the site lands here. Only the secret ADMIN_LOGIN_PATH shows the admin
// sign-in; everything else is the normal "page not found".
export default async function SecretAdminLogin({ params }) {
  const { portal } = await params;
  const slug = adminLoginSlug();
  if (!slug || portal !== slug) notFound();
  return (
    <div className="admin-app">
      <AdminLogin />
    </div>
  );
}
