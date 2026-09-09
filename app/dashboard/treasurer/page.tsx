"use client";
export default function TreasurerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Treasurer Dashboard</h1>
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 mb-6">
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-400">Current Balance</h2>
        <p className="text-3xl font-bold text-green-600 dark:text-green-300">KES 0</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Transactions</h2>
        <p className="text-gray-500">No transactions yet.</p>
      </div>
    </div>
  );
}