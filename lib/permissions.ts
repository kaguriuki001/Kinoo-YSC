export const ROLE_PERMISSIONS: Record<string, string[]> = {
  member: ["view_events", "make_contribution", "view_members"],
  secretary: ["view_events", "make_contribution", "view_members", "approve_members", "create_minutes", "send_comms"],
  organizing_secretary: ["view_events", "make_contribution", "view_members", "create_events", "manage_logistics"],
  treasurer: ["view_events", "make_contribution", "view_members", "view_transactions", "create_budgets", "manage_ledger"],
  vice_secretary: ["view_events", "make_contribution", "view_members", "view_analytics", "send_comms"],
  liturgist: ["view_events", "make_contribution", "view_members", "manage_spiritual"],
  vice_moderator: ["view_events", "make_contribution", "view_members", "create_subcommittees", "assign_leaders"],
  moderator: ["view_events", "make_contribution", "view_members", "approve_members", "assign_roles", "reset_passwords", "create_subcommittees", "view_all"],
  patron_matron: ["view_events", "make_contribution", "view_members", "approve_budgets", "confirm_attendance", "view_all"],
  father: ["*"] // wildcard - all permissions
};

export function canPerformAction(userRoles: string[], action: string): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  if (userRoles.includes('father')) return true;
  return userRoles.some(role => ROLE_PERMISSIONS[role]?.includes(action));
}

export function getUserPermissions(userRoles: string[]): string[] {
  if (!userRoles || userRoles.length === 0) return [];
  if (userRoles.includes('father')) return ["*"];
  const perms = new Set<string>();
  userRoles.forEach(role => {
    ROLE_PERMISSIONS[role]?.forEach(p => perms.add(p));
  });
  return Array.from(perms);
}

export function requirePermission(userRoles: string[], action: string): boolean {
  if (!canPerformAction(userRoles, action)) {
    throw new Error(`Permission denied: ${action}`);
  }
  return true;
}