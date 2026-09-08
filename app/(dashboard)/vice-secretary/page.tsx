import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Transaction from "@/models/Transaction";
import { redirect } from "next/navigation";

export default async function ViceSecretaryDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const totalMembers = await User.countDocuments({ status: 'active' });
  const totalEvents = await Event.countDocuments();
  const totalTransactions = await Transaction.countDocuments({ verified: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Strategist Dashboard (AI)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 p-6 rounded-lg shadow border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800">Active Members</h2>
          <p className="text-3xl font-bold text-purple-600">{totalMembers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Events</h2>
          <p className="text-3xl font-bold">{totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Verified Transactions</h2>
          <p className="text-3xl font-bold">{totalTransactions}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Strategy Console</h2>
        <p className="text-gray-500 mb-4">
          Ask questions about the group's performance, membership trends, and event planning.
        </p>
        <textarea 
          className="w-full p-3 border rounded mb-3" 
          rows={3}
          placeholder="e.g., 'Which members have been inactive for 3 months?'"
          disabled
        />
        <button className="bg-purple-600 text-white px-4 py-2 rounded" disabled>
          Ask AI (Coming Soon)
        </button>
      </div>
    </div>
  );
}