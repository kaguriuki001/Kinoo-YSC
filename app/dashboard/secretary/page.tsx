"use client";
import { useState, useEffect } from "react";

export default function SecretaryPage() {
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

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Secretary Console</h1>
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
        <h2>Pending Approvals ({pending.length})</h2>
        {pending.map((u: any) => (
          <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
            <div>
              <p><strong>{u.fullName}</strong></p>
              <p style={{ color: '#666' }}>{u.phone}</p>
            </div>
            <button onClick={() => approve(u._id)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>Approve</button>
          </div>
        ))}
        {pending.length === 0 && <p style={{ color: '#666' }}>No pending approvals</p>}
      </div>
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2>Active Members ({users.length})</h2>
        {users.map((u: any) => (
          <div key={u._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <p><strong>{u.fullName}</strong> - {u.phone}</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Roles: {u.roles?.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}