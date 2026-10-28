import { NextResponse } from "next/server";
import { clearSessionCookie, readSession } from "@/lib/session";
import { findUserById } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request) {
  const session = readSession(request);
  if (!session) return NextResponse.json({ verified: false }, { headers: noStore });
  try {
    const user = await findUserById(session.uid);
    return NextResponse.json(user ? { verified: true, name: user.name } : { verified: false }, { headers: noStore });
  } catch (error) {
    console.error("Session lookup failed:", error.message);
    return NextResponse.json({ verified: false }, { headers: noStore });
  }
}

// Ends the visit: used when a new visitor starts registering and after a design is sent,
// so the next person on the same device has to enter their own code.
export async function DELETE() {
  return clearSessionCookie(NextResponse.json({ verified: false }, { headers: noStore }));
}
