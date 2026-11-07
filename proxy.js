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

// Where a redirect sends the browser. Behind a reverse proxy (nginx -> 127.0.0.1:3001) the app may see its own
// internal address in request.url, which a visitor's browser can't open. So the public address comes from the
// proxy's X-Forwarded-Host / X-Forwarded-Proto headers, else NEXT_PUBLIC_SITE_URL, else the request itself.
// (Rewrites stay on request.url: they happen inside the app, so its own address is the right one there.)
function redirectTo(path, request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || "https";
    return NextResponse.redirect(new URL(path, `${proto}://${forwardedHost}`));
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site && /^https?:\/\//.test(site)) return NextResponse.redirect(new URL(path, site));
  return NextResponse.redirect(new URL(path, request.url));
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const secretLogin = loginPath();
  const isSecretLogin = pathname === secretLogin;

  if (isSecretLogin || pathname === "/admin" || pathname.startsWith("/admin/")) {
    const signedIn = Boolean(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value));
    if (isSecretLogin) {
      if (signedIn) return redirectTo("/admin", request);
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
    return verified ? NextResponse.next() : redirectTo("/capture", request);
  }
  if (pathname === "/verify" && verified) {
    return redirectTo("/capture", request);
  }
  return NextResponse.next();
}

// Every page request: the secret sign-in address comes from .env, so it can't be listed here (matchers are fixed
// at build time). Files, images, scripts and API calls skip the proxy.
export const config = {
  matcher: ["/((?!api/|_next/|uploads/|assets/|fonts/|favicon\\.ico|icon\\.png|apple-icon\\.png|.*\\.[A-Za-z0-9]+$).*)"]
};
