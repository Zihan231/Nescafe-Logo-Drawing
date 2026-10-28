const globalForLimits = globalThis;
const buckets = globalForLimits.__nescafeLimitBuckets || new Map();
globalForLimits.__nescafeLimitBuckets = buckets;

export function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function recent(key, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((time) => now - time < windowMs);
  buckets.set(key, hits);
  return hits;
}

// True when `key` already used up `max` hits inside the window.
export function isLimited(key, max, windowMs) {
  return recent(key, windowMs).length >= max;
}

export function recordHit(key, windowMs) {
  const hits = recent(key, windowMs);
  hits.push(Date.now());
  buckets.set(key, hits);
}
