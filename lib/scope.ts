import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type Scope = {
  level: "parish" | "outstation";
  outstation: string | null;
  roles: string[];
  isParishAdmin: boolean;
};

const PARISH_ROLES = ["father", "moderator"];

export async function getCallerScope(): Promise<Scope> {
  try {
    const session: any = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return { level: "outstation", outstation: null, roles: [], isParishAdmin: false };
    const roles: string[] = (user.roles || []).map((r: string) => r.toLowerCase());
    const isParishAdmin = roles.some(r => PARISH_ROLES.includes(r));
    return {
      level: isParishAdmin ? "parish" : "outstation",
      outstation: user.outstation || null,
      roles,
      isParishAdmin
    };
  } catch {
    return { level: "outstation", outstation: null, roles: [], isParishAdmin: false };
  }
}

export function inScope(record: any, scope: Scope, outstationField = "outstation"): boolean {
  if (scope.isParishAdmin) return true;
  const recOut = record?.[outstationField];
  // Records with no outstation = parish-wide → visible to everyone
  if (!recOut || recOut === "parish" || recOut === "Parish") return true;
  if (!scope.outstation) return false;
  return String(recOut).toLowerCase() === String(scope.outstation).toLowerCase();
}

export function filterInScope(records: any[], scope: Scope, outstationField = "outstation"): any[] {
  if (scope.isParishAdmin) return records;
  return records.filter(r => inScope(r, scope, outstationField));
}
