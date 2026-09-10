"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function FatherPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [members, setMembers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetchMembers();
    fetchAuditLogs();
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data.filter((u: any) => u.status === 'active'));
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      if (Array.isArray(data)) setAuditLogs(data);
    } catch (e) {}
  };

  const logAction = async (action: string, targetUser?: string, reason?: string) => {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, performedBy: "father", targetUser, reason })
    });
    fetchAuditLogs();
  };

  const dismissMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to dismiss ${name}?`)) return;
    const res = await fetch("/api/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: 'delete', userIds: [id] })
    });
    if (res.ok) {
      toast.success(`${name} dismissed`);
      await logAction("dismiss_member", id, `Dismissed ${name}`);
      fetchMembers();
    } else toast.error("Failed to dismiss");
  };

  const freezeTreasury = async () => {
    if (!confirm("Freeze all transactions? This is an emergency action.")) return;
    await logAction("freeze_treasury", undefined, "Treasury frozen");
    toast.success("Treasury frozen - all transactions halted");
  };

  const resetPassword = async (id: string, name: string) => {
    await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, newPassword: "Kinoo123!" })
    });
    toast.success(`${name}'s password reset to: Kinoo123!`);
    await logAction("reset_password", id, `Reset for ${name}`);
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'members', label: '👥 Members' },
    { id: 'audit', label: '🔒 Audit Log' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>👑 Father In-Charge Console</h1>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#dc2626' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', padding: '25px', borderRadius: '16px', color: 'white', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', opacity: '0.9', marginBottom: '5px' }}>Supreme Admin</h2>
            <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{members.length} Members</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ ...cardStyle, padding: '20px' }}>
              <h3 style={{ marginBottom: '10px', color: '#dc2626' }}>🔒 Emergency Controls</h3>
              <button onClick={freezeTreasury} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '600' }}>
                ❄️ Freeze Treasury
              </button>
            </div>
            <div style={{ ...cardStyle, padding: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>📋 Quick Stats</h3>
              <p>Total Members: <strong>{members.length}</strong></p>
              <p>Audit Entries: <strong>{auditLogs.length}</strong></p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>All Members ({members.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Roles</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Actions</th>
            </tr></thead>
            <tbody>
              {members.map((u: any) => (
                <tr key={u._id}>
                  <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>{u.fullName}</td>
                  <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>{u.phone}</td>
                  <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}`, fontSize: '12px' }}>{u.roles?.join(', ')}</td>
                  <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button onClick={() => resetPassword(u._id, u.fullName)} style={{ background: '#f97316', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>Reset</button>
                      <button onClick={() => dismissMember(u._id, u.fullName)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>Dismiss</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'audit' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Audit Log ({auditLogs.length})</h2>
          {auditLogs.length === 0 ? <p style={{ opacity: '0.7' }}>No audit entries yet.</p> : auditLogs.slice().reverse().map((a: any, i: number) => (
            <div key={i} style={{ padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <p><strong>{a.action}</strong> - {new Date(a.timestamp).toLocaleString()}</p>
              {a.reason && <p style={{ opacity: '0.7' }}>{a.reason}</p>}
              <p style={{ opacity: '0.5', fontSize: '11px', fontFamily: 'monospace' }}>Hash: {a.hash?.substring(0, 24)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}