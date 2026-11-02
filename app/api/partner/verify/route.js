import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { clientIp, isLimited, recordHit } from "@/lib/rate-limit";
import { findUserByCode } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lets the photo-sharing app (Qr-Photo-Share) ask "is this registration code valid?".
// Only that app can call it: every request is signed with PARTNER_SECRET, which never travels over the wire.
//   x-timestamp: milliseconds since epoch
//   x-signature: hex HMAC-SHA256(PARTNER_SECRET, `${timestamp}.${code}`)
// Every failure gets the same answer, so an outsider learns nothing (not even whether a code exists).
const MAX_AGE_MS = 30_000;
const FAILURE_WINDOW_MS = 5 * 60_000;
const FAILURE_MAX = 20;
const noStore = { "Cache-Control": "no-store" };
const denied = () => NextResponse.json({ valid: false }, { status: 401, headers: noStore });

function signatureMatches(secret, timestamp, code, given) {
  const expected = createHmac("sha256", secret).update(`${timestamp}.${code}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  const ip = clientIp(request);
  const failureKey = `partner-fail:${ip}`;
  if (isLimited(failureKey, FAILURE_MAX, FAILURE_WINDOW_MS)) {
    return NextResponse.json({ valid: false }, { status: 429, headers: noStore });
  }
  const fail = () => {
    recordHit(failureKey, FAILURE_WINDOW_MS);
    return denied();
  };

  const secret = process.env.PARTNER_SECRET;
  if (!secret) return fail();

  const allowed = (process.env.PARTNER_ALLOWED_IPS || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(ip)) return fail();

  const timestamp = request.headers.get("x-timestamp") || "";
  const signature = request.headers.get("x-signature") || "";
  const age = Math.abs(Date.now() - Number(timestamp));
  if (!/^\d{10,16}$/.test(timestamp) || !(age <= MAX_AGE_MS) || !/^[0-9a-f]{64}$/.test(signature)) return fail();

  let code = "";
  try {
    const body = await request.json();
    code = typeof body?.code === "string" ? body.code.trim() : "";
  } catch {
    return fail();
  }
  if (!/^\d{5}$/.test(code)) return fail();

  // The signature is checked before the code is looked up, so without the secret nobody can test codes.
  if (!signatureMatches(secret, timestamp, code, signature)) return fail();

  try {
    const user = await findUserByCode(code);
    if (!user) return fail();
    return NextResponse.json({ valid: true, name: user.name }, { headers: noStore });
  } catch (error) {
    console.error("Partner verification failed:", error.message);
    return NextResponse.json({ valid: false }, { status: 503, headers: noStore });
  }
}
