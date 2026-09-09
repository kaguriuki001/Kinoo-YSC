"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/users", { credentials: "include" }).then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d.filter((u: any) => u.status === 'active')); });
    fetch("/api/reports").then(r => r.json()).then(setReports).catch(() => {});
    fetch("/api/audit").then(r => r.json()).then(d => { if (Array.isArray(d)) setAuditLogs(d); }).catch(() => {});
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };

  const allRoles = ['father', 'moderator', 'secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'patron_matron', 'member'];

  const assignRole = async (userId: string, role: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role }) });
    toast.success(`Role assigned: ${role}`);
    await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "assign_role", performedBy: "admin", targetUser: userId, reason: role }) });
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d.filter((u: any) => u.status === 'active')); });
  };

  const resetPass = async (userId: string) => {
    await fetch("/api/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, newPassword: "Kinoo123!" }) });
    toast.success("Password reset to: Kinoo123!");
  };

  const bulkApprove = async () => {
    if (selectedUsers.length === 0) { toast.error("Select members first"); return; }
    await fetch("/api/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: 'approve', userIds: selectedUsers }) });
    toast.success("Bulk approval done!");
    setSelectedUsers([]);
  };

  const exportCSV = () => window.open("/api/export", "_blank");

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'roles', label: '👥 Roles' },
    { id: 'bulk', label: '📦 Bulk Actions' },
    { id: 'reports', label: '📈 Reports' },
    { id: 'audit', label: '🔒 Audit Log' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>⚙️ Settings Console</h1>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: activeTab === t.id ? '#64748b' : darkMode ? '#334155' : '#e5e7eb',
            color: activeTab === t.id ? 'white' : textColor, fontSize: '14px',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>System Overview</h2>
          {reports ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '15px', background: darkMode ? '#334155' : '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{reports.activeMembers}</p>
                <p style={{ fontSize: '13px', opacity: '0.7' }}>Active Members</p>
              </div>
              <div style={{ padding: '15px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>KES {reports.totalIncome}</p>
                <p style={{ fontSize: '13px', opacity: '0.7' }}>Income</p>
              </div>
              <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fff7ed', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{reports.totalEvents}</p>
                <p style={{ fontSize: '13px', opacity: '0.7' }}>Events</p>
              </div>
            </div>
          ) : <p style={{ opacity: '0.7' }}>Loading reports...</p>}
        </div>
      )}

      {activeTab === 'roles' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Assign Roles ({users.length} members)</h2>
          {users.map((u: any) => (
            <div key={u._id} style={{ padding: '15px', borderBottom: `1px solid ${borderColor}` }}>
              <p style={{ fontWeight: '600' }}>{u.fullName}</p>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>Current: {u.roles?.join(', ')}</p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
                {allRoles.filter((r: string) => !u.roles?.includes(r)).map((r: string) => (
                  <button key={r} onClick={() => assignRole(u._id, r)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                    + {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bulk' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Bulk Actions</h2>
          <p style={{ marginBottom: '10px', opacity: '0.7' }}>Selected: {selectedUsers.length} members</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button onClick={bulkApprove} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Approve Selected</button>
            <button onClick={exportCSV} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Export CSV</button>
          </div>
          {users.map((u: any) => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderBottom: `1px solid ${borderColor}` }}>
              <input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={() => toggleSelect(u._id)} />
              <div>
                <p style={{ fontWeight: '500' }}>{u.fullName}</p>
                <p style={{ fontSize: '13px', opacity: '0.7' }}>{u.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Reports</h2>
          <button onClick={() => fetch("/api/reports").then(r => r.json()).then(d => { setReports(d); toast.success("Report refreshed!"); })} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Generate Report
          </button>
          {reports && (
            <div style={{ marginTop: '15px' }}>
              <p>Members: {reports.totalMembers} (Active: {reports.activeMembers})</p>
              <p>Transactions: {reports.totalTransactions} (Verified: {reports.verifiedTransactions})</p>
              <p>Events: {reports.totalEvents}</p>
              <p>Income: KES {reports.totalIncome}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Audit Log ({auditLogs.length})</h2>
          {auditLogs.length === 0 ? <p style={{ opacity: '0.7' }}>No audit entries.</p> : auditLogs.map((a: any, i: number) => (
            <div key={i} style={{ padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <p><strong>{a.action}</strong> - {new Date(a.timestamp).toLocaleString()}</p>
              <p style={{ opacity: '0.6' }}>Hash: {a.hash?.substring(0, 20)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}