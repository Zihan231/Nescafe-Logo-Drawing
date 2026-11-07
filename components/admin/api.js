"use client";

// Calls an admin API. A 401 means the sign-in ended (expired, password changed, account turned off): leave the panel.
// It goes to the home page, never to the sign-in page, whose address is kept secret (ADMIN_LOGIN_PATH).
export async function adminFetch(url, { method = "GET", body } = {}) {
  const response = await fetch(url, {
    method,
    cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (response.status === 401) {
    window.location.href = "/";
    throw new Error("Please sign in again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

const TIME_ZONE = "Asia/Dhaka";

export function formatDate(value, withTime = true) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "short", year: "numeric", ...(withTime && { hour: "2-digit", minute: "2-digit" }) }).format(new Date(value));
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

// Start / end of a yyyy-mm-dd day on the event clock (Dhaka, UTC+6), as ISO times for the API.
export const dayStart = (day) => (day ? new Date(`${day}T00:00:00+06:00`).toISOString() : "");
export const dayEnd = (day) => (day ? new Date(`${day}T23:59:59.999+06:00`).toISOString() : "");
