import { prisma } from "@/lib/prisma";
import { MIN_PASSWORD_LENGTH, adminError, adminJson, hashPassword, readJson, requireAdmin, verifyPassword } from "@/lib/admin-auth";
import { ADMIN_COOKIE, adminCookieOptions, signAdminToken } from "@/lib/admin-token";
import { logAction } from "@/lib/admin-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Change your own password (not for clients). Other sign-ins of this account end; this one gets a fresh token.
export async function POST(request) {
  const auth = await requireAdmin(request, "changeOwnPassword");
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const current = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const next = typeof body?.newPassword === "string" ? body.newPassword : "";
  if (next.length < MIN_PASSWORD_LENGTH) return adminError(400, `The new password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
  if (!(await verifyPassword(current, auth.admin.passwordHash))) return adminError(400, "Your current password is not right.");

  const updated = await prisma.admin.update({
    where: { id: auth.admin.id },
    data: { passwordHash: await hashPassword(next), passwordChangedAt: new Date() }
  });
  await logAction(request, updated, "change_own_password", { type: "admin", id: updated.id });
  const response = adminJson({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await signAdminToken(updated), adminCookieOptions());
  return response;
}
