import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const fallbackPath = path.join(process.cwd(), "data", "designs.json");
let fallbackWriteQueue = Promise.resolve();
const usesMySql = () => Boolean(process.env.DATABASE_URL);

async function readFallback() {
  try {
    const data = JSON.parse(await fs.readFile(fallbackPath, "utf8"));
    return Array.isArray(data.designs) ? data.designs.filter((item) => item.imageUrl) : [];
  } catch {
    return [];
  }
}

const uploadDirectory = () => process.env.UPLOAD_DIRECTORY || path.join(process.cwd(), "uploads");

// For the public wall: designs an admin hid are left out.
export async function getLatestDesigns(limit = 10) {
  if (usesMySql()) {
    try {
      const designs = await prisma.design.findMany({ where: { hidden: false }, orderBy: { createdAt: "desc" }, take: limit });
      return designs.reverse();
    } catch (err) {
      console.warn("Database query failed, falling back to local storage:", err.message);
    }
  }
  const designs = await readFallback();
  return designs.slice(-limit);
}

export async function createDesign(input) {
  if (usesMySql()) {
    try {
      return await prisma.design.create({ data: input });
    } catch (err) {
      console.warn("Database insert failed, falling back to local storage:", err.message);
    }
  }
  const design = { id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString() };
  fallbackWriteQueue = fallbackWriteQueue.then(async () => {
    const designs = await readFallback();
    designs.push(design);
    await fs.mkdir(path.dirname(fallbackPath), { recursive: true });
    await fs.writeFile(fallbackPath, JSON.stringify({ designs }, null, 2));
  });
  await fallbackWriteQueue;
  return design;
}

// Whether a design may be shown publicly (wall, download page, image files). Without the database every design is.
export async function isDesignPublic(id) {
  if (!usesMySql()) return true;
  try {
    const design = await prisma.design.findUnique({ where: { id }, select: { hidden: true } });
    return Boolean(design) && !design.hidden;
  } catch (err) {
    console.warn("Could not check design visibility:", err.message);
    return true; // a database hiccup should not take the download page down
  }
}

export async function setDesignsHidden(ids, hidden) {
  const { count } = await prisma.design.updateMany({ where: { id: { in: ids } }, data: { hidden, hiddenAt: hidden ? new Date() : null } });
  return count;
}

// Deletes the designs and their image files (the design and the take-home card).
export async function deleteDesigns(ids) {
  const { count } = await prisma.design.deleteMany({ where: { id: { in: ids } } });
  const directory = uploadDirectory();
  await Promise.all(ids.flatMap((id) => [`${id}.png`, `${id}-frame.png`].map((name) => fs.unlink(path.join(directory, name)).catch(() => {}))));
  return count;
}
