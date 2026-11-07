import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/admin-permissions";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-token";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
export const MIN_PASSWORD_LENGTH = 8;
const noStore = { "Cache-Control": "no-store" };

export const usesDatabase = () => Boolean(process.env.DATABASE_URL);

// Passwords are stored as scrypt$<salt>$<hash>, never in plain text.
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const given = await scryptAsync(password, salt, expected.length);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export const adminJson = (data, init = {}) => NextResponse.json(data, { ...init, headers: { ...noStore, ...init.headers } });
export const adminError = (status, error) => adminJson({ error }, { status });

// The super admin is created once, from SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD in .env, when nobody holds that role.
export async function ensureSuperAdmin() {
  if (await prisma.admin.findFirst({ where: { role: "super" }, select: { id: true } })) return;
  const username = process.env.SUPERADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!username || !password) return;
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.warn(`SUPERADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters; super admin not created.`);
    return;
  }
  try {
    await prisma.admin.create({ data: { username, passwordHash: await hashPassword(password), role: "super" } });
  } catch (error) {
    if (error.code !== "P2002") throw error; // P2002: created at the same moment by another request, or the name is taken
  }
}

// The signed-in admin for a token: the JWT must be valid AND the account must still exist, be enabled and not have
// changed its password since. Checking the database is what makes disabling or deleting an account take effect at once.
export async function adminFromToken(token) {
  if (!usesDatabase()) return null;
  const claims = await verifyAdminToken(token);
  if (!claims) return null;
  const admin = await prisma.admin.findUnique({ where: { id: claims.sub } });
  if (!admin || admin.disabled || admin.passwordChangedAt.getTime() !== claims.ver) return null;
  return admin;
}

// Every admin API starts with this. Resolves to { admin } or { response } (an error to return as it is).
//   const auth = await requireAdmin(request, "moderate");
//   if (auth.response) return auth.response;
export async function requireAdmin(request, permission = "view") {
  if (!usesDatabase()) return { response: adminError(503, "The admin panel needs the database (DATABASE_URL).") };
  let admin = null;
  try {
    admin = await adminFromToken(request.cookies.get(ADMIN_COOKIE)?.value);
  } catch (error) {
    console.error("Admin session check failed:", error.message);
    return { response: adminError(503, "Could not check your sign-in. Please try again.") };
  }
  if (!admin) return { response: adminError(401, "Please sign in again.") };
  if (!can(admin.role, permission)) return { response: adminError(403, "Your account can't do that.") };
  return { admin };
}

// The safe parts of an account, for the pages.
export const publicAdmin = (admin) => ({
  id: admin.id,
  username: admin.username,
  role: admin.role,
  disabled: admin.disabled,
  createdAt: admin.createdAt,
  lastLoginAt: admin.lastLoginAt
});

// Write requests must send JSON: together with the sameSite=strict cookie this keeps other sites from posting forms here.
export async function readJson(request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}
