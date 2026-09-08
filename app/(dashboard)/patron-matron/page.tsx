import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Budget from "@/models/Budget";
import { redirect } from "next/navigation";

export default async function PatronMatronDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const totalMembers = await User.countDocuments();
  const pendingBudgets = await Budget.find({ status: 'committeeReview' });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Patron/Matron Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-fuchsia-50 p-6 rounded-lg shadow border border-fuchsia-200">
          <h2 className="text-lg font-semibold text-fuchsia-800">Total Members</h2>
          <p className="text-3xl font-bold text-fuchsia-600">{totalMembers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Pending Budget Approvals</h2>
          <p className="text-3xl font-bold">{pendingBudgets.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">View All</h3>
          <p className="text-sm text-gray-500">Full access to all records</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Approve</h3>
          <p className="text-sm text-gray-500">Review and approve budgets</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Attendance</h3>
          <p className="text-sm text-gray-500">Confirm member attendance</p>
        </div>
      </div>
    </div>
  );
}