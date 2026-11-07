import { adminFromToken, adminJson } from "@/lib/admin-auth";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-token";
import { logAction } from "@/lib/admin-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const admin = await adminFromToken(request.cookies.get(ADMIN_COOKIE)?.value).catch(() => null);
  if (admin) await logAction(request, admin, "logout", { type: "admin", id: admin.id });
  const response = adminJson({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", adminCookieOptions(0));
  return response;
}
