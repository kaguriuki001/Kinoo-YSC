"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ModeratorPage() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetchUsers();
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };

  const fetchUsers = async () => {
    const res = await fetch("/api/users", { credentials: "include" });
    const data = await res.json();
    if (Array.isArray(data)) {
      setUsers(data.filter((u: any) => u.status === 'active'));
      setPending(data.filter((u: any) => u.status === 'pending'));
    }
  };

  const approve = async (id: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, role: 'member' }) });
    toast.success("Approved!");
    fetchUsers();
  };

  const resetPass = async (id: string) => {
    await fetch("/api/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, newPassword: "Kinoo123!" }) });
    toast.success("Password reset to: Kinoo123!");
  };

  const assignRole = async (id: string, role: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, role }) });
    toast.success(`Added: ${role}`);
    fetchUsers();
  };

  const allRoles = ['secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'moderator', 'patron_matron'];

  const tabs = [
    { id: 'approvals', label: '✅ Approvals' },
    { id: 'members', label: '👥 Members' },
    { id: 'roles', label: '🔑 Roles' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🛡️ Moderator Console</h1>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#0891b2' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'approvals' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Pending ({pending.length})</h2>
          {pending.map((u: any) => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: `1px solid ${borderColor}` }}>
              <div><p style={{ fontWeight: '600' }}>{u.fullName}</p><p style={{ opacity: '0.7', fontSize: '14px' }}>{u.phone}</p></div>
              <button onClick={() => approve(u._id)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>All Members ({users.length})</h2>
          {users.map((u: any) => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: `1px solid ${borderColor}` }}>
              <div>
                <p style={{ fontWeight: '600' }}>{u.fullName}</p>
                <p style={{ opacity: '0.7', fontSize: '14px' }}>{u.phone}</p>
                <p style={{ opacity: '0.5', fontSize: '12px' }}>Roles: {u.roles?.join(', ')}</p>
              </div>
              <button onClick={() => resetPass(u._id)} style={{ background: '#f97316', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Reset Pass</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'roles' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Assign Roles</h2>
          {users.map((u: any) => (
            <div key={u._id} style={{ padding: '15px', borderBottom: `1px solid ${borderColor}` }}>
              <p style={{ fontWeight: '600' }}>{u.fullName}</p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                {allRoles.filter((r: string) => !u.roles?.includes(r)).map((r: string) => (
                  <button key={r} onClick={() => assignRole(u._id, r)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ {r.replace('_',' ')}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}