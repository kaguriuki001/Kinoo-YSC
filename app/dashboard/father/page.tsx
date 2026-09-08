import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FatherDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Father In-Charge Dashboard</h1>
      <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
        <h2 className="text-lg font-semibold text-red-800">Supreme Admin</h2>
        <p className="text-red-600">Full control over all systems.</p>
      </div>
    </div>
  );
}