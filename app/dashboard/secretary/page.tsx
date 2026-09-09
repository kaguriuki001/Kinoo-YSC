"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SecretaryDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (Array.isArray(data)) {
      setUsers(data.filter((u: any) => u.status === 'active'));
      setPending(data.filter((u: any) => u.status === 'pending'));
    }
  };

  const approveUser = async (id: string) => {
    const res = await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, role: 'member' }) });
    if (res.ok) { toast.success("Member approved!"); fetchUsers(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Secretary Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Pending Approvals ({pending.length})</h2>
        {pending.length === 0 ? <p className="text-gray-500">No pending approvals</p> : pending.map((u: any) => (
          <div key={u._id} className="flex justify-between items-center border-b dark:border-gray-700 py-3">
            <div><p className="font-medium">{u.fullName}</p><p className="text-sm text-gray-500">{u.phone}</p></div>
            <button onClick={() => approveUser(u._id)} className="bg-green-600 text-white px-4 py-2 rounded-lg">Approve</button>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Active Members ({users.length})</h2>
        {users.map((u: any) => (
          <div key={u._id} className="border-b dark:border-gray-700 py-3">
            <p className="font-medium">{u.fullName}</p>
            <p className="text-sm text-gray-500">{u.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}