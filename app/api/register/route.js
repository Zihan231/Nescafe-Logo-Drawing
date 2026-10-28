import { NextResponse } from "next/server";
import { clientIp, isLimited, recordHit } from "@/lib/rate-limit";
import { createUser, normalizePhone } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTER_WINDOW_MS = 60_000;
const REGISTER_MAX = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const noStore = { "Cache-Control": "no-store" };

export async function POST(request) {
  const limitKey = `register:${clientIp(request)}`;
  if (isLimited(limitKey, REGISTER_MAX, REGISTER_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429, headers: noStore });
  }
  recordHit(limitKey, REGISTER_WINDOW_MS);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore });
  }

  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const phone = normalizePhone(body?.phone);
  const emailInput = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!name) return NextResponse.json({ error: "Please enter your name.", field: "name" }, { status: 400, headers: noStore });
  if (name.length > 40) return NextResponse.json({ error: "Name is too long (40 characters max).", field: "name" }, { status: 400, headers: noStore });
  if (!phone) return NextResponse.json({ error: "Enter a valid phone number (7 to 15 digits).", field: "phone" }, { status: 400, headers: noStore });
  if (emailInput && (emailInput.length > 190 || !EMAIL_PATTERN.test(emailInput))) {
    return NextResponse.json({ error: "That email address doesn't look right.", field: "email" }, { status: 400, headers: noStore });
  }

  try {
    const { user, created } = await createUser({ name, phone, email: emailInput || null });
    return NextResponse.json(
      { code: user.code, name: user.name, returning: !created },
      { status: created ? 201 : 200, headers: noStore }
    );
  } catch (error) {
    console.error("Registration failed:", error.message);
    return NextResponse.json({ error: "We couldn't register you right now. Please try again." }, { status: 500, headers: noStore });
  }
}
