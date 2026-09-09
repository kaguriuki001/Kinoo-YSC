"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ModeratorDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

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
    const data = await res.json();
    if (res.ok) { toast.success("Member approved!"); fetchUsers(); }
    else toast.error(data.error || "Failed");
  };

  const resetPassword = async (id: string) => {
    const res = await fetch("/api/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, newPassword: "Kinoo123!" }) });
    const data = await res.json();
    if (res.ok) toast.success("Password reset to: Kinoo123!");
    else toast.error(data.error || "Failed");
  };

  const allRoles = ['secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'moderator', 'patron_matron'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Pending Approvals ({pending.length})</h2>
        {pending.length === 0 ? <p className="text-gray-500">No pending approvals</p> : pending.map((u: any) => (
          <div key={u._id} className="flex justify-between items-center border-b dark:border-gray-700 py-3">
            <div>
              <p className="font-medium">{u.fullName}</p>
              <p className="text-sm text-gray-500">{u.phone}</p>
            </div>
            <button onClick={() => approveUser(u._id)} className="bg-green-600 text-white px-4 py-2 rounded-lg">Approve</button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Active Members ({users.length})</h2>
        {users.map((u: any) => (
          <div key={u._id} className="border-b dark:border-gray-700 py-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <p className="font-medium">{u.fullName}</p>
                <p className="text-sm text-gray-500">{u.phone}</p>
                <p className="text-xs text-gray-400">Roles: {u.roles?.join(', ')}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => resetPassword(u._id)} className="bg-orange-500 text-white px-3 py-1 rounded text-sm">Reset Password</button>
                {allRoles.filter((r: string) => !u.roles?.includes(r)).map((r: string) => (
                  <button key={r} onClick={async () => {
                    const res = await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u._id, role: r }) });
                    if (res.ok) { toast.success(`Added ${r}`); fetchUsers(); }
                  }} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">+ {r.replace('_',' ')}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}