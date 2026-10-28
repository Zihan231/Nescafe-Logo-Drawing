import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "nescafe_session";
const MAX_AGE_SECONDS = 6 * 60 * 60;
const DEV_SECRET = "nescafe-development-only-secret";
let warnedAboutSecret = false;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is not set");
  if (!warnedAboutSecret) {
    warnedAboutSecret = true;
    console.warn("SESSION_SECRET is not set; using an insecure development secret.");
  }
  return DEV_SECRET;
}

const sign = (payload) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function createSessionToken(userId) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token) {
  if (typeof token !== "string") return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data?.uid && data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

// Returns { uid, exp } for a verified visitor, otherwise null.
export function readSession(request) {
  try {
    return readSessionToken(request.cookies?.get(SESSION_COOKIE)?.value);
  } catch (error) {
    console.error("Unable to read session", error.message);
    return null;
  }
}

export function attachSessionCookie(response, userId) {
  response.cookies.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  });
  return response;
}
