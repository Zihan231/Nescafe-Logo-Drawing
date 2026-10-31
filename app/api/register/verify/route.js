import { NextResponse } from "next/server";
import { clientIp, isLimited, recordHit } from "@/lib/rate-limit";
import { attachSessionCookie } from "@/lib/session";
import { findUserByCode, markVerified } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A short code can be guessed, so wrong attempts are counted per IP address.
const FAILURE_WINDOW_MS = 5 * 60_000;
const FAILURE_MAX = 15;
const noStore = { "Cache-Control": "no-store" };

export async function POST(request) {
  const failureKey = `verify-fail:${clientIp(request)}`;
  if (isLimited(failureKey, FAILURE_MAX, FAILURE_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many wrong codes. Please wait a few minutes and try again." }, { status: 429, headers: noStore });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore });
  }

  const code = typeof body?.code === "string" ? body.code.trim().toLowerCase() : "";
  if (!/^[0-9a-z]{4}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 4-character code." }, { status: 400, headers: noStore });
  }

  try {
    const user = await findUserByCode(code);
    if (!user) {
      recordHit(failureKey, FAILURE_WINDOW_MS);
      return NextResponse.json({ error: "That code isn't right. Check it and try again." }, { status: 401, headers: noStore });
    }
    await markVerified(user.id);
    const response = NextResponse.json({ ok: true, name: user.name }, { headers: noStore });
    return attachSessionCookie(response, user.id);
  } catch (error) {
    console.error("Verification failed:", error.message);
    return NextResponse.json({ error: "We couldn't check the code right now. Please try again." }, { status: 500, headers: noStore });
  }
}
