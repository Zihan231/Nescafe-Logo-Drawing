const encoder = new TextEncoder();
const globalForRealtime = globalThis;
const hub = globalForRealtime.__nescafeRealtimeHub || { listeners: new Set() };
globalForRealtime.__nescafeRealtimeHub = hub;

export function subscribeToDesigns(listener) {
  hub.listeners.add(listener);
  return () => hub.listeners.delete(listener);
}

function broadcast(event, data) {
  const payload = encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  for (const listener of hub.listeners) {
    try { listener(payload); } catch { hub.listeners.delete(listener); }
  }
}

// A new design, or one an admin made visible again.
export function publishDesign(design) {
  broadcast("design.created", design);
}

// An admin hid or deleted a design: open walls take it off straight away.
export function publishDesignRemoved(id) {
  broadcast("design.removed", { id });
}

export { encoder };
