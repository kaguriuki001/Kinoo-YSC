"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SecretaryPage() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [minutes, setMinutes] = useState<any[]>([]);
  const [newMinute, setNewMinute] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetchUsers();
    fetchMinutes();
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

  const fetchMinutes = async () => {
    const res = await fetch("/api/minutes");
    const data = await res.json();
    if (Array.isArray(data)) setMinutes(data);
  };

  const approve = async (id: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, role: 'member' }) });
    toast.success("Member approved!");
    fetchUsers();
  };

  const saveMinute = async () => {
    if (!newMinute.trim()) { toast.error("Enter minutes content"); return; }
    const res = await fetch("/api/minutes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: newMinute }) });
    if (res.ok) { toast.success("Minutes saved!"); setNewMinute(""); fetchMinutes(); }
  };

  const sendMessage = async () => {
    if (!message.trim()) { toast.error("Enter message"); return; }
    toast.success("Message sent to all members!");
    setMessage("");
  };

  const tabs = [
    { id: 'approvals', label: '✅ Approvals' },
    { id: 'members', label: '👥 Members' },
    { id: 'minutes', label: '📝 Minutes' },
    { id: 'comms', label: '📢 Communications' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>📋 Secretary Console</h1>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#1d4ed8' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'approvals' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Pending Approvals ({pending.length})</h2>
          {pending.length === 0 ? <p style={{ opacity: '0.7' }}>No pending approvals</p> : pending.map((u: any) => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: `1px solid ${borderColor}` }}>
              <div>
                <p style={{ fontWeight: '600' }}>{u.fullName}</p>
                <p style={{ fontSize: '14px', opacity: '0.7' }}>{u.phone}</p>
                <p style={{ fontSize: '12px', opacity: '0.5' }}>ID: {u.idNumber || 'N/A'}</p>
              </div>
              <button onClick={() => approve(u._id)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Active Members ({users.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Roles</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Joined</th>
            </tr></thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id}>
                  <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>{u.fullName}</td>
                  <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>{u.phone}</td>
                  <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>{u.roles?.join(', ')}</td>
                  <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'minutes' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Meeting Minutes</h2>
          <textarea value={newMinute} onChange={(e) => setNewMinute(e.target.value)} placeholder="Enter minutes..." style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px' }} />
          <button onClick={saveMinute} style={{ background: '#1d4ed8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Save Minutes</button>
          <h3 style={{ margin: '20px 0 10px' }}>Previous ({minutes.length})</h3>
          {minutes.map((m: any) => (
            <div key={m._id} style={{ padding: '12px', background: darkMode ? '#334155' : '#f9fafb', borderRadius: '8px', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', opacity: '0.6' }}>{new Date(m.date).toLocaleDateString()}</p>
              <p>{m.content}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'comms' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Send Communication</h2>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type message to all members..." style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px' }} />
          <button onClick={sendMessage} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Send to All</button>
        </div>
      )}
    </div>
  );
}