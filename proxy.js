import { NextResponse } from "next/server";
import { readSession } from "./lib/session.js";
import { ADMIN_COOKIE, verifyAdminToken } from "./lib/admin-token.js";
import { adminLoginSlug } from "./lib/admin-login-path.js";

// Server-side redirects:
//  - /edit without a valid visitor session goes to /capture (which shows the code screen until a code is entered)
//  - /verify with a valid session goes on to /capture
//  - the secret admin sign-in address (ADMIN_LOGIN_PATH), when already signed in, goes on to /admin
// There are no rewrites here on purpose: behind a reverse proxy the app can't tell its own internal address, and
// Next.js would treat a rewrite as an outside address. The pages decide what to show instead (app/capture/page.js,
// app/[portal]/page.js, app/admin/(panel)/layout.js, which answers "page not found" to anyone not signed in).

// Where a redirect sends the browser. Behind a reverse proxy (nginx -> 127.0.0.1:3001) the app may see its own
// internal address in request.url, which a visitor's browser can't open. So the public address comes from the
// proxy's X-Forwarded-Host / X-Forwarded-Proto headers, else NEXT_PUBLIC_SITE_URL, else the request itself.
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

  const slug = adminLoginSlug();
  const loginPath = slug ? `/${slug}` : "/admin/login";
  if (pathname === loginPath) {
    const signedIn = Boolean(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value));
    return signedIn ? redirectTo("/admin", request) : NextResponse.next();
  }

  if (pathname === "/edit" && !readSession(request)) return redirectTo("/capture", request);
  if (pathname === "/verify" && readSession(request)) return redirectTo("/capture", request);
  return NextResponse.next();
}

// Every page request: the secret sign-in address comes from .env, so it can't be listed here (matchers are fixed
// at build time). Files, images, scripts and API calls skip the proxy.
export const config = {
  matcher: ["/((?!api/|_next/|uploads/|assets/|fonts/|favicon\\.ico|icon\\.png|apple-icon\\.png|.*\\.[A-Za-z0-9]+$).*)"]
};
