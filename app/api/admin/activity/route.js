import { prisma } from "@/lib/prisma";
import { adminJson, requireAdmin } from "@/lib/admin-auth";
import { PAGE_SIZE, pageOf } from "@/lib/admin-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/activity?page&username&action - the super admin's log of everything admins did, newest first.
export async function GET(request) {
  const auth = await requireAdmin(request, "viewActivity");
  if (auth.response) return auth.response;
  const params = new URL(request.url).searchParams;
  const { page, skip, take } = pageOf(params);
  const where = {};
  if (params.get("username")) where.username = params.get("username");
  if (params.get("action")) where.action = params.get("action");

  const [entries, total, usernames, actions] = await Promise.all([
    prisma.adminLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.adminLog.count({ where }),
    prisma.adminLog.findMany({ distinct: ["username"], select: { username: true }, orderBy: { username: "asc" } }),
    prisma.adminLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } })
  ]);
  return adminJson({
    page,
    pageSize: PAGE_SIZE,
    total,
    usernames: usernames.map((item) => item.username),
    actions: actions.map((item) => item.action),
    entries: entries.map((entry) => {
      let details = null;
      try { details = entry.details ? JSON.parse(entry.details) : null; } catch { details = entry.details; }
      return { ...entry, details };
    })
  });
}
