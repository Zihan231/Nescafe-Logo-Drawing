import { adminJson, publicAdmin, requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await requireAdmin(request, "view");
  if (auth.response) return auth.response;
  return adminJson({ admin: publicAdmin(auth.admin) });
}
