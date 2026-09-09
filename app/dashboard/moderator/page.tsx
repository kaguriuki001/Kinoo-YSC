"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

async function resetPassword(id: string) {
  const res = await fetch("/api/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id, newPassword: "Kinoo123!" })
  });
  const data = await res.json();
  if (res.ok) toast.success(`Password reset to: Kinoo123!`);
  else toast.error(data.error || "Failed");
}

async function assignRole(id: string, role: string) {
  const res = await fetch("/api/assign-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id, role })
  });
  const data = await res.json();
  if (res.ok) toast.success(`Role added: ${role}`);
  else toast.error(data.error || "Failed");
}

export default function ModeratorDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(data => {
      setUsers(data.filter((u: any) => u.status === 'active'));
      setPending(data.filter((u: any) => u.status === 'pending'));
    });
  }, []);

  const allRoles = ['secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'moderator', 'patron_matron'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Pending Approvals ({pending.length})</h2>
        {pending.map((u: any) => (
          <div key={u._id} className="flex justify-between items-center border-b py-3">
            <div>
              <p className="font-medium">{u.fullName}</p>
              <p className="text-sm text-gray-500">{u.phone}</p>
            </div>
            <button onClick={() => assignRole(u._id, 'member')} className="bg-green-600 text-white px-4 py-2 rounded-lg">Approve</button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Active Members ({users.length})</h2>
        {users.map((u: any) => (
          <div key={u._id} className="border-b py-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{u.fullName}</p>
                <p className="text-sm text-gray-500">{u.phone}</p>
                <p className="text-xs text-gray-400">Roles: {u.roles?.join(', ')}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => resetPassword(u._id)} className="bg-orange-500 text-white px-3 py-1 rounded text-sm">Reset Password</button>
                {allRoles.filter((r: string) => !u.roles?.includes(r)).map((r: string) => (
                  <button key={r} onClick={() => assignRole(u._id, r)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">+ {r}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}