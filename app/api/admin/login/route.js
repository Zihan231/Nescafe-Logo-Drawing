import { prisma } from "@/lib/prisma";
import { clientIp, isLimited, recordHit } from "@/lib/rate-limit";
import { adminError, adminJson, ensureSuperAdmin, publicAdmin, readJson, usesDatabase, verifyPassword } from "@/lib/admin-auth";
import { ADMIN_COOKIE, adminCookieOptions, signAdminToken } from "@/lib/admin-token";
import { logAction } from "@/lib/admin-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Wrong passwords are counted per IP address and per username, so guessing is slow either way.
const FAILURE_WINDOW_MS = 10 * 60_000;
const MAX_FAILURES_PER_IP = 15;
const MAX_FAILURES_PER_NAME = 8;

export async function POST(request) {
  if (!usesDatabase()) return adminError(503, "The admin panel needs the database (DATABASE_URL).");
  const body = await readJson(request);
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase().slice(0, 60) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !password) return adminError(400, "Enter your username and password.");

  const ipKey = `admin-login-ip:${clientIp(request)}`;
  const nameKey = `admin-login-name:${username}`;
  if (isLimited(ipKey, MAX_FAILURES_PER_IP, FAILURE_WINDOW_MS) || isLimited(nameKey, MAX_FAILURES_PER_NAME, FAILURE_WINDOW_MS)) {
    return adminError(429, "Too many wrong attempts. Please wait a few minutes.");
  }

  try {
    await ensureSuperAdmin();
    const admin = await prisma.admin.findUnique({ where: { username } });
    const ok = admin && !admin.disabled && (await verifyPassword(password, admin.passwordHash));
    if (!ok) {
      recordHit(ipKey, FAILURE_WINDOW_MS);
      recordHit(nameKey, FAILURE_WINDOW_MS);
      await logAction(request, admin, "login_failed", { type: "admin", id: admin?.id, username, details: admin?.disabled ? { reason: "disabled" } : undefined });
      return adminError(401, "Wrong username or password.");
    }
    const updated = await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await logAction(request, updated, "login", { type: "admin", id: updated.id });
    const response = adminJson({ admin: publicAdmin(updated) });
    response.cookies.set(ADMIN_COOKIE, await signAdminToken(updated), adminCookieOptions());
    return response;
  } catch (error) {
    console.error("Admin login failed:", error.message);
    return adminError(503, "Could not sign you in right now. Please try again.");
  }
}
