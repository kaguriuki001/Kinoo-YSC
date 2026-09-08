export const ROLES: Record<string, string[]> = {
  member: ["view_own_profile", "view_events", "make_contribution", "request_attendance"],
  secretary: ["register_member", "send_comms", "manage_minutes", "manage_risk_audit"],
  treasurer: ["view_ledger", "manage_budgets", "manage_finance_committee"],
  organizing_secretary: ["create_event", "manage_logistics"],
  vice_secretary: ["deputise_secretary", "view_strategy_ai", "analyse_data"],
  liturgist: ["manage_liturgy", "manage_spiritual_committee"],
  vice_moderator: ["create_subcommittee", "assign_leaders", "moderator_succession"],
  moderator: ["view_all", "moderate_all"],
  patron_matron: ["view_all", "approve_budget", "confirm_attendance", "override_moderator"],
  father: ["*", "dismiss_user", "freeze_treasury", "dissolve_subcommittee"]
};

export function hasPermission(userRoles: string[], requiredPermission: string) {
  if (userRoles.includes("father")) return true;
  const allowedPermissions = userRoles.flatMap(role => ROLES[role] || []);
  return allowedPermissions.includes(requiredPermission);
}