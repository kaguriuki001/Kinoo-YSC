"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("roles");
  const [users, setUsers] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    fetch("/api/users?t=" + Date.now())
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setUsers(d.filter((u: any) => u.status === 'active'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    loadUsers();
  }, []);

  const deleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    
    // Instant remove
    setUsers(prev => prev.filter(u => u._id !== userId));
    toast.success(`${name} removed`);

    // Then call API
    fetch(`/api/delete-user?userId=${userId}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(d => {
        if (!d.message) toast.error("Delete failed on server");
      })
      .catch(() => toast.error("Network error"));
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : 'white';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: textColor }}>Loading...</div>;

  return (
    <div style={{ color: textColor, padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '26px' }}>⚙️ Settings</h1>
        <button onClick={loadUsers} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>🔄 Reload</button>
      </div>

      <div style={{ background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
        <h2 style={{ marginBottom: '15px' }}>Members ({users.length})</h2>
        {users.length === 0 ? <p style={{ opacity: '0.7' }}>No members.</p> : (
          <div>
            {users.map((u: any) => (
              <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: `1px solid ${borderColor}`, gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <p style={{ fontWeight: '600' }}>{u.fullName}</p>
                  <p style={{ fontSize: '13px', opacity: '0.7' }}>{u.phone}</p>
                </div>
                <button
                  onClick={() => deleteUser(u._id, u.fullName)}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}