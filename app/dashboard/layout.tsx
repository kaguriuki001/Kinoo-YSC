import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !session.user) redirect("/");

  const userRoles = (session.user as any).roles || [];
  const userName = (session.user as any).name || "User";

  const roleLinks = userRoles.map((role: string) => ({
    role,
    href: `/dashboard/${role}`,
    label: role.replace(/_/g, ' ')
  }));

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Kinoo YSC</h2>
          <p className="text-sm text-gray-400 mt-1">{userName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {roleLinks.map(({ role, href, label }) => (
            <Link key={role} href={href} className="block p-2 rounded hover:bg-gray-700 capitalize">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}