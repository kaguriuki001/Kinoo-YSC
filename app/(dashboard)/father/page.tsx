import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { redirect } from "next/navigation";

export default async function FatherDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const totalMembers = await User.countDocuments();
  const totalAuditLogs = await AuditLog.countDocuments();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Father In-Charge Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-600 text-white p-6 rounded-lg shadow">
          <h2 className="text-lg">Total Members</h2>
          <p className="text-3xl font-bold">{totalMembers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg">Audit Logs</h2>
          <p className="text-3xl font-bold">{totalAuditLogs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg">Status</h2>
          <p className="text-3xl font-bold text-green-600">Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2 text-red-700">Dismiss Member</h3>
          <p className="text-sm text-gray-500">Remove members from the group</p>
          <p className="text-xs text-red-500 mt-1">Immutably logged</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2 text-red-700">Freeze Treasury</h3>
          <p className="text-sm text-gray-500">Emergency stop for all transactions</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2 text-red-700">Dissolve Subcommittee</h3>
          <p className="text-sm text-gray-500">Disband any committee</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">Audit Log</h3>
          <p className="text-sm text-gray-500">View all system actions with hash chain</p>
        </div>
      </div>
    </div>
  );
}