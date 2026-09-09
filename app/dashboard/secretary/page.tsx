"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SecretaryPage() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [minutes, setMinutes] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (Array.isArray(data)) {
      setUsers(data.filter((u: any) => u.status === 'active'));
      setPending(data.filter((u: any) => u.status === 'pending'));
    }
  };

  const approve = async (id: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, role: 'member' }) });
    toast.success("Member approved!");
    fetchUsers();
  };

  const reject = async (id: string) => {
    await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    toast.success("Member rejected");
    fetchUsers();
  };

  const tabs = ["approvals", "members", "minutes", "communications"];

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Secretary Console</h1>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: activeTab === tab ? '#1d4ed8' : '#e5e7eb',
            color: activeTab === tab ? 'white' : '#333', textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === "approvals" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Pending Approvals ({pending.length})</h2>
          {pending.length === 0 ? <p style={{ color: '#666' }}>No pending approvals</p> : pending.map((u: any) => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <p style={{ fontWeight: '600' }}>{u.fullName}</p>
                <p style={{ color: '#666', fontSize: '14px' }}>{u.phone}</p>
                <p style={{ color: '#999', fontSize: '12px' }}>ID: {u.idNumber || 'N/A'}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => approve(u._id)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
                <button onClick={() => reject(u._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "members" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Active Members ({users.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Roles</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>{u.fullName}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>{u.phone}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>{u.roles?.join(', ')}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "minutes" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Meeting Minutes</h2>
          <textarea value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Enter minutes here..." style={{ width: '100%', minHeight: '150px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <button onClick={() => toast.success("Minutes saved!")} style={{ marginTop: '10px', background: '#1d4ed8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Save Minutes</button>
        </div>
      )}

      {activeTab === "communications" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Send Communication</h2>
          <textarea placeholder="Type message to all members..." style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <button onClick={() => toast.success("Message sent!")} style={{ marginTop: '10px', background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Send to All</button>
        </div>
      )}
    </div>
  );
}