import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function ViceSecretaryDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const totalMembers = await User.countDocuments({ status: 'active' });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Strategist Dashboard</h1>
      <div className="bg-purple-50 p-6 rounded-lg shadow border border-purple-200">
        <h2 className="text-lg font-semibold text-purple-800">Active Members</h2>
        <p className="text-3xl font-bold text-purple-600">{totalMembers}</p>
      </div>
    </div>
  );
}