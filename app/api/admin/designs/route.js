import { prisma } from "@/lib/prisma";
import { adminError, adminJson, readJson, requireAdmin } from "@/lib/admin-auth";
import { logAction } from "@/lib/admin-log";
import { PAGE_SIZE, dateParam, formatPhone, idList, pageOf, visitorSearch } from "@/lib/admin-query";
import { deleteDesigns, setDesignsHidden } from "@/lib/design-store";
import { publishDesign, publishDesignRemoved } from "@/lib/realtime";
import { FORMER_PROFESSION_NAMES, PROFESSIONS } from "@/lib/professions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTS = {
  newest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
  largest: [{ fileSize: "desc" }],
  smallest: [{ fileSize: "asc" }],
  profession: [{ profession: "asc" }, { createdAt: "desc" }]
};
const visitorFields = { id: true, name: true, phone: true, email: true, code: true, createdAt: true };

// GET /api/admin/designs?page&sort&visibility=all|visible|hidden&profession&from&to&q
export async function GET(request) {
  const auth = await requireAdmin(request, "view");
  if (auth.response) return auth.response;
  const params = new URL(request.url).searchParams;
  const { page, skip, take } = pageOf(params);

  const where = {};
  const visibility = params.get("visibility");
  if (visibility === "visible") where.hidden = false;
  if (visibility === "hidden") where.hidden = true;
  // one of the ten professions, including designs saved under its old name (Player also finds "Footballer")
  const profession = params.get("profession");
  if (PROFESSIONS.includes(profession)) where.profession = { in: [profession, ...(FORMER_PROFESSION_NAMES[profession] || [])] };
  const from = dateParam(params.get("from"));
  const to = dateParam(params.get("to"));
  if (from || to) where.createdAt = { ...(from && { gte: from }), ...(to && { lte: to }) };
  const search = visitorSearch(params.get("q"));
  if (search) where.user = search;

  const [designs, total] = await Promise.all([
    prisma.design.findMany({ where, orderBy: SORTS[params.get("sort")] || SORTS.newest, skip, take, include: { user: { select: visitorFields } } }),
    prisma.design.count({ where })
  ]);

  return adminJson({
    page,
    pageSize: PAGE_SIZE,
    total,
    professions: PROFESSIONS,
    designs: designs.map((design) => ({
      ...design,
      cardUrl: `/uploads/${design.id}-frame.png`,
      user: design.user && { ...design.user, phoneDisplay: formatPhone(design.user.phone) }
    }))
  });
}

// PATCH { ids, hidden }: hide designs (off the wall, no download) or make them visible again.
export async function PATCH(request) {
  const auth = await requireAdmin(request, "moderate");
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const ids = idList(body?.ids);
  if (!ids.length || typeof body?.hidden !== "boolean") return adminError(400, "Choose the designs to change.");

  const count = await setDesignsHidden(ids, body.hidden);
  if (body.hidden) ids.forEach(publishDesignRemoved);
  else {
    const restored = await prisma.design.findMany({ where: { id: { in: ids }, hidden: false } });
    restored.forEach(({ userId, hiddenAt, ...design }) => publishDesign({ ...design, hidden: false }));
  }
  await logAction(request, auth.admin, body.hidden ? "hide_designs" : "unhide_designs", { type: "design", id: ids.length === 1 ? ids[0] : null, details: { count, ids } });
  return adminJson({ count });
}

// DELETE { ids }: removes the designs and their image files for good.
export async function DELETE(request) {
  const auth = await requireAdmin(request, "moderate");
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const ids = idList(body?.ids);
  if (!ids.length) return adminError(400, "Choose the designs to delete.");

  const existing = (await prisma.design.findMany({ where: { id: { in: ids } }, select: { id: true } })).map((design) => design.id);
  const count = existing.length ? await deleteDesigns(existing) : 0;
  existing.forEach(publishDesignRemoved);
  await logAction(request, auth.admin, "delete_designs", { type: "design", id: existing.length === 1 ? existing[0] : null, details: { count, ids: existing } });
  return adminJson({ count });
}
