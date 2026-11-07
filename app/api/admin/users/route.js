import { prisma } from "@/lib/prisma";
import { adminError, adminJson, readJson, requireAdmin } from "@/lib/admin-auth";
import { logAction } from "@/lib/admin-log";
import { PAGE_SIZE, USER_SORTS, formatPhone, idList, pageOf, userWhere } from "@/lib/admin-query";
import { deleteDesigns } from "@/lib/design-store";
import { publishDesignRemoved } from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const withPhone = (user) => ({ ...user, phoneDisplay: formatPhone(user.phone), designCount: user._count?.designs ?? 0 });

// GET /api/admin/users?page&sort&status&q, or ?id=<visitor> for one visitor with all their designs.
export async function GET(request) {
  const auth = await requireAdmin(request, "view");
  if (auth.response) return auth.response;
  const params = new URL(request.url).searchParams;

  const id = params.get("id");
  if (id) {
    const user = await prisma.user.findUnique({ where: { id }, include: { designs: { orderBy: { createdAt: "desc" } }, _count: { select: { designs: true } } } });
    if (!user) return adminError(404, "That visitor no longer exists.");
    return adminJson({ user: withPhone(user) });
  }

  const { page, skip, take } = pageOf(params);
  const where = userWhere(params);
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: USER_SORTS[params.get("sort")] || USER_SORTS.newest, skip, take, include: { _count: { select: { designs: true } } } }),
    prisma.user.count({ where })
  ]);
  return adminJson({ page, pageSize: PAGE_SIZE, total, users: users.map(withPhone) });
}

// DELETE { ids, alsoDeleteDesigns }: removes visitors. Their designs stay (no longer linked) unless asked to delete them too.
export async function DELETE(request) {
  const auth = await requireAdmin(request, "moderate");
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const ids = idList(body?.ids);
  if (!ids.length) return adminError(400, "Choose the visitors to delete.");

  let designCount = 0;
  if (body?.alsoDeleteDesigns === true) {
    const designIds = (await prisma.design.findMany({ where: { userId: { in: ids } }, select: { id: true } })).map((design) => design.id);
    if (designIds.length) {
      designCount = await deleteDesigns(designIds);
      designIds.forEach(publishDesignRemoved);
    }
  }
  const { count } = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  await logAction(request, auth.admin, "delete_visitors", { type: "user", id: ids.length === 1 ? ids[0] : null, details: { count, designsDeleted: designCount, ids } });
  return adminJson({ count, designCount });
}
