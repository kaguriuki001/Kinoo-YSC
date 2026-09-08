import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !session.user) redirect("/");

  const userRoles = session.user.roles || [];
  const roleLinks = userRoles.map(role => ({
    role,
    href: `/dashboard/${role}`,
    label: role.replace(/_/g, ' ')
  }));

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Kinoo YSC</h2>
          <p className="text-sm text-gray-400 mt-1">{session.user.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {roleLinks.map(({ role, href, label }) => (
            <Link
              key={role}
              href={href}
              className="block p-2 rounded hover:bg-gray-700 capitalize transition"
            >
              {label}
            </Link>
          ))}
        </nav>

        <form action={async () => {
          "use server";
          const { signOut } = await import("@/lib/auth");
          await signOut({ redirectTo: "/" });
        }}>
          <button className="w-full p-3 bg-red-600 hover:bg-red-700 text-white font-semibold">
            Sign Out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}