import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PatronMatronDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Patron/Matron Dashboard</h1>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <p className="text-gray-500">Full access to all records.</p>
      </div>
    </div>
  );
}