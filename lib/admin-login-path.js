// The secret address of the admin sign-in page, from ADMIN_LOGIN_PATH (8-80 letters, numbers, - or _), without
// slashes. null when it is not set (or not valid): the sign-in page is then at /admin/login instead.
let warned = false;

export function adminLoginSlug() {
  const value = (process.env.ADMIN_LOGIN_PATH || "").trim().replace(/^\/+|\/+$/g, "");
  if (/^[A-Za-z0-9_-]{8,80}$/.test(value)) return value;
  if (!warned) {
    warned = true;
    console.warn("ADMIN_LOGIN_PATH is not set (or shorter than 8 letters/numbers); the admin sign-in page is at /admin/login.");
  }
  return null;
}
