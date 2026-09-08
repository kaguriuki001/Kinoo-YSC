import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { redirect } from "next/navigation";

export default async function TreasurerDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const transactions = await Transaction.find().populate('fromUser', 'fullName phone').sort({ date: -1 }).limit(50);
  const totalIncome = await Transaction.aggregate([{ $match: { verified: true } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]);
  const balance = totalIncome[0]?.sum || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Treasurer Dashboard</h1>
      <div className="bg-green-600 text-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg">Current Balance</h2>
        <p className="text-3xl font-bold">KES {balance.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded shadow">
        <h2 className="text-lg font-semibold p-4 border-b">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="p-4 text-gray-500">No transactions yet</p>
        ) : (
          transactions.map((t: any) => (
            <div key={t._id} className="p-4 border-b flex justify-between">
              <div>
                <p className="font-medium">{t.fromUser?.fullName || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{t.purpose}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">KES {t.amount}</p>
                <p className={t.verified ? "text-green-600 text-sm" : "text-yellow-600 text-sm"}>{t.verified ? 'Verified' : 'Pending'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}