import { randomInt } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

// Registered visitors. MySQL (Prisma) when DATABASE_URL is set, otherwise a local JSON file.
// Unlike designs there is no silent fallback when the database fails: phone numbers and
// codes must stay unique, so a database error is reported to the caller instead.
const filePath = path.join(process.cwd(), "data", "users.json");
let fileQueue = Promise.resolve();
const usesMySql = () => Boolean(process.env.DATABASE_URL);
const CODE_SPACE = 10_000;

export function normalizePhone(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!/^\+?[\d\s\-().]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  // Digits only, so "+880 1712-345678" and "8801712345678" count as the same number.
  return digits;
}

const randomCode = () => String(randomInt(0, CODE_SPACE)).padStart(4, "0");

async function readFileUsers() {
  try {
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));
    return Array.isArray(data.users) ? data.users : [];
  } catch {
    return [];
  }
}

// File writes are serialised so two registrations can never pick the same code or phone.
function withFileLock(task) {
  const run = fileQueue.then(task);
  fileQueue = run.catch(() => {});
  return run;
}

async function writeFileUsers(users) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify({ users }, null, 2));
}

export async function findUserByPhone(phone) {
  if (usesMySql()) return prisma.user.findUnique({ where: { phone } });
  return (await readFileUsers()).find((user) => user.phone === phone) || null;
}

export async function findUserByCode(code) {
  if (usesMySql()) return prisma.user.findUnique({ where: { code } });
  return (await readFileUsers()).find((user) => user.code === code) || null;
}

export async function findUserById(id) {
  if (usesMySql()) return prisma.user.findUnique({ where: { id } });
  return (await readFileUsers()).find((user) => user.id === id) || null;
}

export async function markVerified(id) {
  try {
    if (usesMySql()) {
      await prisma.user.update({ where: { id }, data: { verifiedAt: new Date() } });
      return;
    }
    await withFileLock(async () => {
      const users = await readFileUsers();
      const user = users.find((item) => item.id === id);
      if (!user) return;
      user.verifiedAt = new Date().toISOString();
      await writeFileUsers(users);
    });
  } catch (error) {
    console.warn("Could not record verification time:", error.message);
  }
}

// Creates a visitor, or returns the existing one when the phone is already registered.
// Resolves to { user, created }.
export async function createUser({ name, phone, email }) {
  if (usesMySql()) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) return { user: existing, created: false };
      try {
        const user = await prisma.user.create({ data: { name, phone, email, code: randomCode() } });
        return { user, created: true };
      } catch (error) {
        if (error.code !== "P2002") throw error;
        // Phone taken in the meantime or the code collided: loop and look again.
      }
    }
    throw new Error("Could not allocate a unique code");
  }

  return withFileLock(async () => {
    const users = await readFileUsers();
    const existing = users.find((user) => user.phone === phone);
    if (existing) return { user: existing, created: false };
    if (users.length >= CODE_SPACE) throw new Error("All codes are in use");
    const taken = new Set(users.map((user) => user.code));
    let code = randomCode();
    while (taken.has(code)) code = randomCode();
    const user = { id: crypto.randomUUID(), name, phone, email, code, createdAt: new Date().toISOString(), verifiedAt: null };
    users.push(user);
    await writeFileUsers(users);
    return { user, created: true };
  });
}
