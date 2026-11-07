import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAction } from "@/lib/admin-log";
import { USER_SORTS, formatPhone, userWhere } from "@/lib/admin-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zone = () => process.env.ADMIN_TIMEZONE || "Asia/Dhaka";

// One CSV cell. Text that starts like a formula gets a leading ' so a spreadsheet shows it instead of running it.
function cell(value) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const when = (date) => (date ? new Intl.DateTimeFormat("en-GB", { timeZone: zone(), dateStyle: "short", timeStyle: "short" }).format(date) : "");

// GET /api/admin/users/export?q&status&sort: every matching visitor as a CSV file (opens in Excel).
export async function GET(request) {
  const auth = await requireAdmin(request, "view");
  if (auth.response) return auth.response;
  const params = new URL(request.url).searchParams;
  const users = await prisma.user.findMany({
    where: userWhere(params),
    orderBy: USER_SORTS[params.get("sort")] || USER_SORTS.newest,
    include: { _count: { select: { designs: true } } }
  });

  const header = ["Name", "Phone", "Email", "Code", "Registered", "Entered code", "Designs"];
  const rows = users.map((user) => [user.name, formatPhone(user.phone), user.email, user.code, when(user.createdAt), when(user.verifiedAt), user._count.designs]);
  // The BOM tells Excel the file is UTF-8, so names with accents or Bangla show correctly.
  const csv = `﻿${[header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`;

  await logAction(request, auth.admin, "export_visitors", { type: "user", details: { count: users.length } });
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nescafe-visitors-${stamp}.csv"`,
      "Cache-Control": "no-store"
    }
  });
}
