import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LiturgistDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Liturgist Dashboard</h1>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Spiritual Matters</h2>
        <p className="text-gray-500">Liturgy calendar, prayer wall, and homilies coming soon.</p>
      </div>
    </div>
  );
}