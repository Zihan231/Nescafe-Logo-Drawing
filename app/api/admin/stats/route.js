import { prisma } from "@/lib/prisma";
import { adminJson, requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS = 14;
// Days and hours are counted on the event's clock, not the server's.
const timeZone = () => process.env.ADMIN_TIMEZONE || "Asia/Dhaka";

function localParts(date, zone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export async function GET(request) {
  const auth = await requireAdmin(request, "view");
  if (auth.response) return auth.response;
  const zone = timeZone();

  const [designs, users] = await Promise.all([
    prisma.design.findMany({ select: { createdAt: true, hidden: true, profession: true, userId: true } }),
    prisma.user.findMany({ select: { createdAt: true, verifiedAt: true } })
  ]);

  const today = localParts(new Date(), zone).day;
  const days = Array.from({ length: DAYS }, (_, i) => localParts(new Date(Date.now() - (DAYS - 1 - i) * 86_400_000), zone).day);
  const perDay = Object.fromEntries(days.map((day) => [day, { day, designs: 0, registrations: 0 }]));
  const perHour = Array.from({ length: 24 }, (_, hour) => ({ hour, designs: 0, registrations: 0 }));
  const professions = {};
  const designers = new Set();
  let hidden = 0;
  let designsToday = 0;

  for (const design of designs) {
    const { day, hour } = localParts(design.createdAt, zone);
    if (perDay[day]) perDay[day].designs++;
    perHour[hour].designs++;
    if (day === today) designsToday++;
    if (design.hidden) hidden++;
    if (design.userId) designers.add(design.userId);
    const profession = design.profession || "Unknown";
    professions[profession] = (professions[profession] || 0) + 1;
  }
  let verified = 0;
  let registrationsToday = 0;
  for (const user of users) {
    const { day, hour } = localParts(user.createdAt, zone);
    if (perDay[day]) perDay[day].registrations++;
    perHour[hour].registrations++;
    if (day === today) registrationsToday++;
    if (user.verifiedAt) verified++;
  }
  const linkedDesigns = designs.filter((design) => design.userId).length;

  return adminJson({
    timeZone: zone,
    totals: {
      designs: designs.length,
      visibleDesigns: designs.length - hidden,
      hiddenDesigns: hidden,
      designsToday,
      visitors: users.length,
      verifiedVisitors: verified,
      registrationsToday,
      visitorsWithDesigns: designers.size,
      avgDesignsPerVisitor: designers.size ? Number((linkedDesigns / designers.size).toFixed(2)) : 0,
      unlinkedDesigns: designs.length - linkedDesigns // sent before designs were linked to visitors
    },
    funnel: [
      { step: "Registered", count: users.length },
      { step: "Entered their code", count: verified },
      { step: "Sent a design", count: designers.size }
    ],
    perDay: days.map((day) => perDay[day]),
    perHour,
    professions: Object.entries(professions).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  });
}
