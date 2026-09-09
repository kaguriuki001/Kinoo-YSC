"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") return <div className="p-8 text-center">Loading...</div>;
  if (!session?.user) return null;

  const roles = (session.user as any)?.roles || [];
  const name = (session.user as any)?.name || "User";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Kinoo YSC</h2>
          <p className="text-sm text-gray-400 mt-1">{name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {roles.map((role: string) => (
            <Link key={role} href={`/dashboard/${role}`} className={`block p-3 rounded-lg transition ${pathname.startsWith(`/dashboard/${role}`) ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
              {role.replace(/_/g, ' ')}
            </Link>
          ))}
        </nav>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full p-3 bg-red-600 hover:bg-red-700 text-white font-semibold">
          Sign Out
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}