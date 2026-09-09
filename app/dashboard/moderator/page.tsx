"use client";
import { useState, useEffect } from "react";

export default function ModeratorPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setUsers(data.filter((u: any) => u.status === 'active'));
        setPending(data.filter((u: any) => u.status === 'pending'));
      }
    });
  }, []);

  const approve = async (id: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, role: 'member' }) });
    window.location.reload();
  };

  const resetPass = async (id: string) => {
    await fetch("/api/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, newPassword: "Kinoo123!" }) });
    alert("Password reset to: Kinoo123!");
  };

  const allRoles = ['secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'moderator', 'patron_matron'];

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Moderator Console</h1>
      <div style={{ padding: '20px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a', marginBottom: '20px' }}>
        <h2>Pending Approvals ({pending.length})</h2>
        {pending.map((u: any) => (
          <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
            <div><p><strong>{u.fullName}</strong></p><p style={{ color: '#666' }}>{u.phone}</p></div>
            <button onClick={() => approve(u._id)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>Approve</button>
          </div>
        ))}
      </div>
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2>Active Members ({users.length})</h2>
        {users.map((u: any) => (
          <div key={u._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <p><strong>{u.fullName}</strong> - {u.phone}</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Roles: {u.roles?.join(', ')}</p>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
              <button onClick={() => resetPass(u._id)} style={{ background: '#f97316', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>Reset Password</button>
              {allRoles.filter((r: string) => !u.roles?.includes(r)).map((r: string) => (
                <button key={r} onClick={async () => { await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u._id, role: r }) }); window.location.reload(); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>+ {r.replace('_',' ')}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}