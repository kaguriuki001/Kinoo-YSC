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
  const [csvData, setCsvData] = useState("");
  const [mpesaSettings, setMpesaSettings] = useState({ paybill: "", tillNumber: "", accountNumber: "", accountName: "", organizationName: "Kinoo YSC" });
  const [photoUsers, setPhotoUsers] = useState<any[]>([]);
  const [resetScope, setResetScope] = useState("all");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    refreshUsers();
    fetch("/api/reports").then(r => r.json()).then(setReports).catch(() => {});
    fetch("/api/audit").then(r => r.json()).then(d => { if (Array.isArray(d)) setAuditLogs(d); }).catch(() => {});
    fetch("/api/settings").then(r => r.json()).then(d => { if (d) setMpesaSettings(d); }).catch(() => {});
  }, []);

  // Auto-refresh users every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUsers();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when returning to the tab
  useEffect(() => {
    const handleVisibility = () => { if (!document.hidden) refreshUsers(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px', fontSize: '13px', boxSizing: 'border-box' as const };

  const allRoles = ['father', 'moderator', 'secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'patron_matron', 'member'];

  const refreshUsers = () => {
    fetch("/api/users", { cache: "no-store", credentials: "include" }).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const active = d.filter((u: any) => u.status === 'active');
        setUsers(active);
        setPhotoUsers(active);
      }
    }).catch(() => {});
  };

  const assignRole = async (userId: string, role: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role }) });
    toast.success(`Role assigned: ${role}`);
    // Optimistic update
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, roles: [...(u.roles || []), role] } : u));
    refreshUsers();
  };

  const resetPass = async (userId: string) => {
    await fetch("/api/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, newPassword: "Kinoo123!" }) });
    toast.success("Password reset to: Kinoo123!");
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    // Optimistic removal - instantly removes from UI
    setUsers(prev => prev.filter(u => u._id !== userId));
    setPhotoUsers(prev => prev.filter(u => u._id !== userId));
    const res = await fetch(`/api/delete-user?userId=${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      refreshUsers();
    } else {
      toast.error(data.error || "Delete failed");
      refreshUsers();
    }
  };

  const bulkApprove = async () => {
    if (selectedUsers.length === 0) { toast.error("Select members first"); return; }
    await fetch("/api/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: 'approve', userIds: selectedUsers }) });
    toast.success("Bulk approval done!");
    setSelectedUsers([]);
    refreshUsers();
  };

  const importCSV = async () => {
    if (!csvData.trim()) { toast.error("Paste CSV data first"); return; }
    const res = await fetch("/api/import-csv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csvData }) });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); setCsvData(""); refreshUsers(); }
    else toast.error(data.error || "Import failed");
  };

  const exportCSV = () => window.open("/api/export", "_blank");

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveMpesaSettings = async () => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mpesaSettings)
    });
    if (res.ok) toast.success("M-Pesa settings saved!");
    else toast.error("Failed to save");
  };

  const uploadPhoto = (userId: string, file: File) => {
    if (file.size > 2000000) { toast.error("Photo too large (max 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const res = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, photoData: dataUrl })
      });
      if (res.ok) {
        toast.success("Photo uploaded!");
        setPhotoUsers(prev => prev.map(p => p._id === userId ? { ...p, photo: dataUrl } : p));
      } else toast.error("Upload failed");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async (userId: string) => {
    // Optimistic removal
    setPhotoUsers(prev => prev.map(p => p._id === userId ? { ...p, photo: undefined } : p));
    const res = await fetch(`/api/upload-photo?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) toast.success("Photo removed");
    else {
      toast.error("Failed to remove photo");
      refreshUsers();
    }
  };

  const resetSystem = async () => {
    if (resetConfirm !== "RESET") { toast.error("Type RESET to confirm"); return; }
    if (!confirm(`Reset ${resetScope}? This cannot be undone.`)) return;
    setResetLoading(true);

    // Optimistic UI clear
    if (resetScope === 'all') {
      setUsers([]);
      setPhotoUsers([]);
      setReports(null);
      setAuditLogs([]);
    } else if (resetScope === 'transactions') {
      setReports(null);
    } else if (resetScope === 'events') {
      setReports(null);
    }

    const res = await fetch("/api/reset-system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "RESET", scope: resetScope })
    });
    const data = await res.json();
    setResetLoading(false);
    if (res.ok) {
      toast.success("System reset complete!");
      setResetConfirm("");
      refreshUsers();
      fetch("/api/reports").then(r => r.json()).then(setReports).catch(() => {});
    } else {
      toast.error(data.error || "Reset failed");
      refreshUsers();
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'roles', label: '👥 Roles' },
    { id: 'bulk', label: '📦 Bulk & Import' },
    { id: 'mpesa', label: '💰 M-Pesa' },
    { id: 'photos', label: '📸 Photos' },
    { id: 'reports', label: '📈 Reports' },
    { id: 'audit', label: '🔒 Audit Log' },
    { id: 'data', label: '🗑️ Data Management' },
  ];

  return (
    <div style={{ color: textColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px' }}>⚙️ Settings Console</h1>
        <button onClick={() => { refreshUsers(); fetch("/api/reports").then(r => r.json()).then(setReports).catch(() => {}); toast.success("Refreshed!"); }} style={{ background: darkMode ? '#334155' : '#e5e7eb', color: textColor, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>🔄 Refresh</button>
      </div>

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
          ) : <p style={{ opacity: '0.7' }}>Loading...</p>}
        </div>
      )}

      {activeTab === 'roles' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Assign Roles ({users.length})</h2>
          {users.length === 0 ? <p style={{ opacity: '0.7' }}>No active members. Add some from Bulk & Import tab.</p> : users.map((u: any) => (
            <div key={u._id} style={{ padding: '15px', borderBottom: `1px solid ${borderColor}` }}>
              <p style={{ fontWeight: '600' }}>{u.fullName}</p>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>{u.phone} — Current: {u.roles?.join(', ')}</p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
                {allRoles.filter((r: string) => !u.roles?.includes(r)).map((r: string) => (
                  <button key={r} onClick={() => assignRole(u._id, r)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                    + {r.replace('_', ' ')}
                  </button>
                ))}
                <button onClick={() => resetPass(u._id)} style={{ background: '#f97316', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🔑 Reset Password</button>
                <button onClick={() => deleteUser(u._id, u.fullName)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bulk' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Bulk Actions & CSV Import</h2>

          <div style={{ marginBottom: '20px', padding: '15px', border: `1px solid ${borderColor}`, borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '15px' }}>📥 CSV Import Members</h3>
            <p style={{ fontSize: '13px', opacity: '0.7', marginBottom: '10px' }}>Format: <code>fullName,phone,idNumber</code> (one per line)</p>
            <textarea value={csvData} onChange={(e) => setCsvData(e.target.value)} placeholder={"John Doe,0712345678,12345678\nJane Smith,0723456789,87654321"} style={{ ...inputStyle, minHeight: '100px' }} />
            <button onClick={importCSV} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Import Members</button>
          </div>

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

      {activeTab === 'mpesa' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>💰 M-Pesa Configuration</h2>
          <p style={{ fontSize: '13px', opacity: '0.7', marginBottom: '20px' }}>Set the payment destination for member contributions.</p>

          <div style={{ maxWidth: '500px' }}>
            <label style={{ fontSize: '13px', opacity: '0.7' }}>Organization Name</label>
            <input value={mpesaSettings.organizationName} onChange={(e) => setMpesaSettings({...mpesaSettings, organizationName: e.target.value})} style={inputStyle} />

            <label style={{ fontSize: '13px', opacity: '0.7' }}>Paybill Number (optional)</label>
            <input value={mpesaSettings.paybill} onChange={(e) => setMpesaSettings({...mpesaSettings, paybill: e.target.value})} placeholder="e.g., 247247" style={inputStyle} />

            <label style={{ fontSize: '13px', opacity: '0.7' }}>Till Number / Buy Goods (optional)</label>
            <input value={mpesaSettings.tillNumber} onChange={(e) => setMpesaSettings({...mpesaSettings, tillNumber: e.target.value})} placeholder="e.g., 5123456" style={inputStyle} />

            <label style={{ fontSize: '13px', opacity: '0.7' }}>Account Number</label>
            <input value={mpesaSettings.accountNumber} onChange={(e) => setMpesaSettings({...mpesaSettings, accountNumber: e.target.value})} placeholder="e.g., KINOOYSC" style={inputStyle} />

            <label style={{ fontSize: '13px', opacity: '0.7' }}>Account Name</label>
            <input value={mpesaSettings.accountName} onChange={(e) => setMpesaSettings({...mpesaSettings, accountName: e.target.value})} placeholder="e.g., Kinoo Youth Group" style={inputStyle} />

            <button onClick={saveMpesaSettings} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', marginTop: '10px' }}>
              💾 Save M-Pesa Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>📸 Member Photos</h2>
          <p style={{ fontSize: '13px', opacity: '0.7', marginBottom: '20px' }}>Photos are optional. Tap to upload.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
            {photoUsers.map((u: any) => (
              <div key={u._id} style={{ padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: darkMode ? '#334155' : '#e5e7eb', margin: '0 auto 10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                  {u.photo ? <img src={u.photo} alt={u.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                </div>
                <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>{u.fullName}</p>
                <p style={{ fontSize: '11px', opacity: '0.6', marginBottom: '8px' }}>{u.phone}</p>
                <input type="file" accept="image/*" id={`photo-${u._id}`} style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(u._id, f); }} />
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                  <label htmlFor={`photo-${u._id}`} style={{ background: '#3b82f6', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
                    {u.photo ? 'Change' : 'Upload'}
                  </label>
                  {u.photo && <button onClick={() => removePhoto(u._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>Remove</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Reports</h2>
          <button onClick={() => fetch("/api/reports").then(r => r.json()).then(d => { setReports(d); toast.success("Refreshed!"); })} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
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
          {auditLogs.length === 0 ? <p style={{ opacity: '0.7' }}>No audit entries.</p> : auditLogs.slice().reverse().map((a: any, i: number) => (
            <div key={i} style={{ padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <p><strong>{a.action}</strong> - {new Date(a.timestamp).toLocaleString()}</p>
              {a.reason && <p style={{ opacity: '0.7' }}>{a.reason}</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'data' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>🗑️ Data Management</h2>

          <div style={{ padding: '20px', border: `2px solid #ef4444`, borderRadius: '10px', background: darkMode ? '#1e293b' : '#fef2f2' }}>
            <h3 style={{ marginBottom: '15px', color: '#ef4444' }}>⚠️ Danger Zone</h3>
            <p style={{ fontSize: '13px', opacity: '0.8', marginBottom: '20px', lineHeight: '1.6', color: textColor }}>
              Reset system data. This action <strong>CANNOT</strong> be undone. Your admin account(s) will be preserved.
            </p>

            <label style={{ fontSize: '13px', opacity: '0.7', display: 'block', marginBottom: '8px', color: textColor }}>What to reset:</label>
            <select value={resetScope} onChange={(e) => setResetScope(e.target.value)} style={inputStyle}>
              <option value="all">🌐 Everything (keep admins only)</option>
              <option value="transactions">💰 Transactions only</option>
              <option value="events">📅 Events only</option>
              <option value="fragos">🎯 FRAGOs only</option>
              <option value="notifications">🔔 Notifications only</option>
            </select>

            <label style={{ fontSize: '13px', opacity: '0.7', display: 'block', marginBottom: '8px', marginTop: '15px', color: textColor }}>Type RESET to confirm:</label>
            <input value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} placeholder="Type RESET" style={inputStyle} />

            <button onClick={resetSystem} disabled={resetLoading} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', marginTop: '15px', opacity: resetLoading ? 0.6 : 1 }}>
              {resetLoading ? "Resetting..." : "🚨 Reset Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}