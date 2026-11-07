// Small helpers shared by the admin list APIs.
export const PAGE_SIZE = 48;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function pageOf(searchParams) {
  const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
  return { page, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
}

// A list of ids from a request body: valid uuids only, no repeats, at most 200 at a time.
export function idList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === "string" && UUID.test(id)))].slice(0, 200);
}

export function dateParam(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Matches visitors by name, code, email or phone. Phones are stored as 8801XXXXXXXXX (older ones as 01XXXXXXXXX),
// so "01712 345678" and "+880 1712..." both find the same person.
export function visitorSearch(query) {
  const text = String(query || "").trim().slice(0, 80);
  if (!text) return null;
  const or = [{ name: { contains: text } }, { email: { contains: text } }, { code: { contains: text } }];
  const digits = text.replace(/\D/g, "");
  if (digits.length >= 3) {
    or.push({ phone: { contains: digits } });
    if (digits.startsWith("0")) or.push({ phone: { contains: `88${digits}` } });
    if (digits.startsWith("880")) or.push({ phone: { contains: digits.slice(2) } });
  }
  return { OR: or };
}

export const USER_SORTS = {
  newest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
  name: [{ name: "asc" }],
  verified: [{ verifiedAt: { sort: "desc", nulls: "last" } }],
  designs: [{ designs: { _count: "desc" } }, { createdAt: "desc" }]
};

// Visitors matching ?q (name, phone, code, email) and ?status=verified|unverified|designed.
export function userWhere(params) {
  const where = { ...(visitorSearch(params.get("q")) || {}) };
  const status = params.get("status");
  if (status === "verified") where.verifiedAt = { not: null };
  if (status === "unverified") where.verifiedAt = null;
  if (status === "designed") where.designs = { some: {} };
  return where;
}

// Shows a stored phone the way people write it in Bangladesh: 8801712345678 -> 01712 345678.
export function formatPhone(phone) {
  const local = String(phone || "").replace(/^880/, "0");
  return /^01\d{9}$/.test(local) ? `${local.slice(0, 5)} ${local.slice(5)}` : String(phone || "");
}
