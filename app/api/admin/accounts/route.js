import { prisma } from "@/lib/prisma";
import { MIN_PASSWORD_LENGTH, adminError, adminJson, hashPassword, publicAdmin, readJson, requireAdmin } from "@/lib/admin-auth";
import { canManageRole } from "@/lib/admin-permissions";
import { logAction } from "@/lib/admin-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USERNAME = /^[a-z0-9._-]{3,60}$/;

// The account `id` if the signed-in admin may manage it (never the super admin, never themselves), otherwise an error.
async function manageable(admin, id) {
  const target = typeof id === "string" ? await prisma.admin.findUnique({ where: { id } }) : null;
  if (!target) return { response: adminError(404, "That account no longer exists.") };
  if (target.id === admin.id || !canManageRole(admin.role, target.role)) return { response: adminError(403, "Your account can't change that login.") };
  return { target };
}

// The logins this admin can see: the super admin sees admins and clients, an admin sees clients. Both see themselves.
export async function GET(request) {
  const auth = await requireAdmin(request, "manageClients");
  if (auth.response) return auth.response;
  const roles = auth.admin.role === "super" ? ["super", "admin", "client"] : ["client"];
  const accounts = await prisma.admin.findMany({ where: { OR: [{ role: { in: roles } }, { id: auth.admin.id }] }, orderBy: [{ role: "asc" }, { createdAt: "asc" }] });
  return adminJson({ accounts: accounts.map(publicAdmin) });
}

// POST { username, password, role }: a new admin (super admin only) or client login.
export async function POST(request) {
  const auth = await requireAdmin(request, "manageClients");
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role;
  if (role !== "admin" && role !== "client") return adminError(400, "Choose Admin or Client.");
  if (!canManageRole(auth.admin.role, role)) return adminError(403, "Your account can't create that kind of login.");
  if (!USERNAME.test(username)) return adminError(400, "Usernames are 3-60 characters: letters, numbers, dots, dashes or underscores.");
  if (password.length < MIN_PASSWORD_LENGTH) return adminError(400, `The password needs at least ${MIN_PASSWORD_LENGTH} characters.`);

  try {
    const created = await prisma.admin.create({ data: { username, passwordHash: await hashPassword(password), role, createdById: auth.admin.id } });
    await logAction(request, auth.admin, "create_account", { type: "admin", id: created.id, details: { username, role } });
    return adminJson({ account: publicAdmin(created) }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") return adminError(409, "That username is already taken.");
    throw error;
  }
}

// PATCH { id, password?, disabled? }: reset a password (signs that login out everywhere) or turn the login off/on.
export async function PATCH(request) {
  const auth = await requireAdmin(request, "manageClients");
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const check = await manageable(auth.admin, body?.id);
  if (check.response) return check.response;

  const data = {};
  if (body.password !== undefined) {
    if (typeof body.password !== "string" || body.password.length < MIN_PASSWORD_LENGTH) return adminError(400, `The password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
    data.passwordHash = await hashPassword(body.password);
    data.passwordChangedAt = new Date();
  }
  if (body.disabled !== undefined) {
    if (typeof body.disabled !== "boolean") return adminError(400, "Invalid request.");
    data.disabled = body.disabled;
  }
  if (!Object.keys(data).length) return adminError(400, "Nothing to change.");

  const updated = await prisma.admin.update({ where: { id: check.target.id }, data });
  const action = data.passwordHash ? "reset_password" : data.disabled ? "disable_account" : "enable_account";
  await logAction(request, auth.admin, action, { type: "admin", id: updated.id, details: { username: updated.username, role: updated.role } });
  return adminJson({ account: publicAdmin(updated) });
}

// DELETE { id }: removes a login.
export async function DELETE(request) {
  const auth = await requireAdmin(request, "manageClients");
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const check = await manageable(auth.admin, body?.id);
  if (check.response) return check.response;
  await prisma.admin.delete({ where: { id: check.target.id } });
  await logAction(request, auth.admin, "delete_account", { type: "admin", id: check.target.id, details: { username: check.target.username, role: check.target.role } });
  return adminJson({ ok: true });
}
