import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { redirect } from "next/navigation";

export default async function TreasurerDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const transactions = await Transaction.find()
    .populate('fromUser', 'fullName phone')
    .sort({ date: -1 })
    .limit(50);

  const totalIncome = await Transaction.aggregate([
    { $match: { verified: true } },
    { $group: { _id: null, sum: { $sum: "$amount" } } }
  ]);

  const balance = totalIncome[0]?.sum || 0;
  const verifiedCount = transactions.filter(t => t.verified).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Treasurer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-600 text-white p-6 rounded-lg shadow">
          <h2 className="text-lg">Current Balance</h2>
          <p className="text-3xl font-bold">KES {balance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg">Total Transactions</h2>
          <p className="text-3xl font-bold">{transactions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg">Verified Payments</h2>
          <p className="text-3xl font-bold">{verifiedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <h2 className="text-lg font-semibold p-4 border-b">Recent Transactions</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Member</th>
              <th className="p-3 text-left">Purpose</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t: any) => (
              <tr key={t._id} className="border-b">
                <td className="p-3">{t.fromUser?.fullName || 'Unknown'}</td>
                <td className="p-3">{t.purpose}</td>
                <td className="p-3">KES {t.amount}</td>
                <td className="p-3">
                  <span className={t.verified ? "text-green-600" : "text-yellow-600"}>
                    {t.verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}