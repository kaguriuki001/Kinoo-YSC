"use client";
export default function FatherDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Father In-Charge Dashboard</h1>
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Supreme Admin</h2>
        <p className="text-red-600 dark:text-red-300">Full control over all systems.</p>
      </div>
    </div>
  );
}