import { SignJWT, jwtVerify } from "jose";

// Admin sign-in token: a JWT (HS256) in an httpOnly cookie. This file only signs and checks it, so proxy.js can
// use it without touching the database; lib/admin-auth.js adds the database check every API call needs.
export const ADMIN_COOKIE = "nescafe_admin";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
const ISSUER = "nescafe-admin";
const DEV_SECRET = "nescafe-admin-development-only-secret";
let warnedAboutSecret = false;

function key() {
  let value = process.env.ADMIN_JWT_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === "production") throw new Error("ADMIN_JWT_SECRET is not set");
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn("ADMIN_JWT_SECRET is not set; using an insecure development secret.");
    }
    value = DEV_SECRET;
  }
  return new TextEncoder().encode(value);
}

// ver is the account's passwordChangedAt time, so changing the password ends older sign-ins.
export function signAdminToken(admin) {
  return new SignJWT({ role: admin.role, ver: admin.passwordChangedAt.getTime() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_SECONDS}s`)
    .sign(key());
}

// Returns { sub, role, ver } for a valid, unexpired token, otherwise null.
export async function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { issuer: ISSUER, algorithms: ["HS256"] });
    return payload?.sub ? payload : null;
  } catch {
    return null;
  }
}

export function adminCookieOptions(maxAge = ADMIN_SESSION_SECONDS) {
  return { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge };
}
