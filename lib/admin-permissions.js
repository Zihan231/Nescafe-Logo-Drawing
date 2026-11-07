// Who may do what in the admin panel. Used by the API (enforcement) and the pages (which buttons to show).
//   super  - exactly one; everything, including admin logins and the activity log
//   admin  - manages designs, visitors and client logins
//   client - read-only (the event client): sees everything, changes nothing, not even their own password
export const ROLES = ["super", "admin", "client"];
export const ROLE_LABELS = { super: "Super admin", admin: "Admin", client: "Client (read-only)" };

const PERMISSIONS = {
  view: ["super", "admin", "client"], // dashboard, designs, visitors, CSV export
  moderate: ["super", "admin"], // hide, unhide and delete designs; delete visitors
  manageClients: ["super", "admin"],
  manageAdmins: ["super"],
  viewActivity: ["super"],
  changeOwnPassword: ["super", "admin"]
};

export function can(role, permission) {
  return Boolean(PERMISSIONS[permission]?.includes(role));
}

// Whether `actorRole` may create, reset, disable or delete a login with `targetRole`. Nobody manages the super admin.
export function canManageRole(actorRole, targetRole) {
  if (targetRole === "client") return can(actorRole, "manageClients");
  if (targetRole === "admin") return can(actorRole, "manageAdmins");
  return false;
}
