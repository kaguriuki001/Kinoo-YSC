import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLanding() {
  const session = await auth();
  if (!session || !session.user) redirect("/");

  const userRoles = (session.user as any).roles || [];
  const userName = (session.user as any).name || "User";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome, {userName}!</h1>
      <p className="text-gray-600 mb-6">Select a console:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userRoles.map((role: string) => (
          <Link key={role} href={`/dashboard/${role}`} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition capitalize">
            <h2 className="text-xl font-semibold text-blue-700">{role.replace(/_/g, ' ')}</h2>
            <p className="text-gray-500 mt-2 text-sm">Access your console</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
