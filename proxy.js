import { NextResponse } from "next/server";
import { readSession } from "./lib/session.js";
import { ADMIN_COOKIE, verifyAdminToken } from "./lib/admin-token.js";

// Server-side gate: /capture and /edit are only served to visitors who entered a valid code.
//  - /capture without a valid session shows the code screen (the /verify page) at the same URL
//  - /edit without a valid session redirects to /capture
//  - /verify with a valid session redirects on to /capture
// The admin panel is kept out of sight:
//  - its sign-in page is only reachable at the secret address in ADMIN_LOGIN_PATH (e.g. /staff-8k2q7xw9)
//  - /admin/login itself, and every /admin page for someone not signed in, answer "page not found"
//    (the token is checked here without the database; every admin API checks the account itself as well)

let warnedAboutLoginPath = false;

// The secret sign-in address, as "/<path>". Without ADMIN_LOGIN_PATH it falls back to /admin/login.
function loginPath() {
  const value = (process.env.ADMIN_LOGIN_PATH || "").trim().replace(/^\/+|\/+$/g, "");
  if (/^[A-Za-z0-9_-]{8,80}$/.test(value)) return `/${value}`;
  if (!warnedAboutLoginPath) {
    warnedAboutLoginPath = true;
    console.warn("ADMIN_LOGIN_PATH is not set (or shorter than 8 letters/numbers); the admin sign-in page is at /admin/login.");
  }
  return "/admin/login";
}

// Shows the normal 404 page (a path that matches no page), so nothing hints that an admin area exists.
const notFound = (request) => NextResponse.rewrite(new URL("/__not-found", request.url));

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const secretLogin = loginPath();
  const isSecretLogin = pathname === secretLogin;

  if (isSecretLogin || pathname === "/admin" || pathname.startsWith("/admin/")) {
    const signedIn = Boolean(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value));
    if (isSecretLogin) {
      if (signedIn) return NextResponse.redirect(new URL("/admin", request.url));
      return secretLogin === "/admin/login" ? NextResponse.next() : NextResponse.rewrite(new URL("/admin/login", request.url));
    }
    if (pathname === "/admin/login" || !signedIn) return notFound(request);
    return NextResponse.next();
  }

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

// Every page request: the secret sign-in address comes from .env, so it can't be listed here (matchers are fixed
// at build time). Files, images, scripts and API calls skip the proxy.
export const config = {
  matcher: ["/((?!api/|_next/|uploads/|assets/|fonts/|favicon\\.ico|icon\\.png|apple-icon\\.png|.*\\.[A-Za-z0-9]+$).*)"]
};
