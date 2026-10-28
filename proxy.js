import { NextResponse } from "next/server";
import { readSession } from "./lib/session.js";

// Server-side gate: /capture and /edit are only served to visitors who entered a valid code.
//  - /capture without a valid session shows the code screen (the /verify page) at the same URL
//  - /edit without a valid session redirects to /capture
//  - /verify with a valid session redirects on to /capture
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const verified = Boolean(readSession(request));

  if (pathname === "/capture") {
    return verified ? NextResponse.next() : NextResponse.rewrite(new URL("/verify", request.url));
  }
  if (pathname === "/edit") {
    return verified ? NextResponse.next() : NextResponse.redirect(new URL("/capture", request.url));
  }
  if (pathname === "/verify" && verified) {
    return NextResponse.redirect(new URL("/capture", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/capture", "/edit", "/verify"]
};
