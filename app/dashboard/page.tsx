"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardLanding() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  const roles = (session.user as any)?.roles || [];
  const name = (session.user as any)?.name || "User";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome, {name}!</h1>
      <p className="text-gray-500 mb-6">Select a console to get started:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role: string) => (
          <Link key={role} href={`/dashboard/${role}`} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 capitalize">{role.replace(/_/g, ' ')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Access your {role.replace(/_/g, ' ')} console</p>
          </Link>
        ))}
      </div>
    </div>
  );
}