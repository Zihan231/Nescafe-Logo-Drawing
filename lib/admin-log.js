import { prisma } from "@/lib/prisma";
import { clientIp } from "@/lib/rate-limit";

// Records an admin action for the super admin's activity log. A failure here never blocks the action itself.
//   logAction(request, admin, "hide_designs", { type: "design", id, details: { count: 3 } })
export async function logAction(request, admin, action, target = {}) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId: admin?.id ?? null,
        username: admin?.username ?? String(target.username ?? "unknown").slice(0, 60),
        action,
        targetType: target.type ?? null,
        targetId: target.id ?? null,
        details: target.details === undefined ? null : JSON.stringify(target.details),
        ip: request ? clientIp(request).slice(0, 64) : null
      }
    });
  } catch (error) {
    console.warn("Could not write to the admin activity log:", error.message);
  }
}
