"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setUsers(d.filter((u: any) => u.status === 'active'));
    });
    fetch("/api/reports").then(r => r.json()).then(setReports);
    fetch("/api/notifications").then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifications(d); });
    fetch("/api/audit").then(r => r.json()).then(d => { if (Array.isArray(d)) setAuditLogs(d); });
  }, []);

  const allRoles = ['father', 'moderator', 'secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'patron_matron', 'member'];

  const assignRole = async (userId: string, role: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role }) });
    toast.success(`Role assigned: ${role}`);
    await logAudit("assign_role", userId, role);
    refreshUsers();
  };

  const bulkApprove = async () => {
    if (selectedUsers.length === 0) { toast.error("Select members first"); return; }
    await fetch("/api/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: 'approve', userIds: selectedUsers }) });
    toast.success("Bulk approval done!");
    setSelectedUsers([]);
    refreshUsers();
  };

  const exportCSV = () => {
    window.open("/api/export", "_blank");
  };

  const logAudit = async (action: string, targetUser?: string, reason?: string) => {
    await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, performedBy: "admin", targetUser, reason }) });
  };

  const refreshUsers = () => {
    fetch("/api/users").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setUsers(d.filter((u: any) => u.status === 'active'));
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const tabs = ["overview", "roles", "bulk", "reports", "notifications", "audit"];

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>⚙️ Settings Console</h1>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: activeTab === tab ? '#64748b' : '#e5e7eb',
            color: activeTab === tab ? 'white' : '#333', textTransform: 'capitalize', whiteSpace: 'nowrap'
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>System Overview</h2>
          {reports && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '15px', background: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>{reports.activeMembers}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>Active Members</p>
              </div>
              <div style={{ padding: '15px', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>KES {reports.totalIncome}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>Total Income</p>
              </div>
              <div style={{ padding: '15px', background: '#fff7ed', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>{reports.totalEvents}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>Events</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "roles" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Assign Roles</h2>
          {users.map((u: any) => (
            <div key={u._id} style={{ padding: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <p style={{ fontWeight: '600' }}>{u.fullName}</p>
              <p style={{ color: '#666', fontSize: '13px' }}>Current: {u.roles?.join(', ')}</p>
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

      {activeTab === "bulk" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Bulk Actions</h2>
          <p style={{ color: '#666', marginBottom: '10px' }}>Selected: {selectedUsers.length} members</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button onClick={bulkApprove} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Approve Selected</button>
            <button onClick={exportCSV} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Export CSV</button>
          </div>
          {users.map((u: any) => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
              <input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={() => toggleSelect(u._id)} />
              <div>
                <p style={{ fontWeight: '500' }}>{u.fullName}</p>
                <p style={{ color: '#666', fontSize: '13px' }}>{u.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reports" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Reports</h2>
          <button onClick={() => fetch("/api/reports").then(r => r.json()).then(d => { setReports(d); toast.success("Report refreshed!"); })} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
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

      {activeTab === "notifications" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Notifications ({notifications.length})</h2>
          {notifications.length === 0 ? <p style={{ color: '#666' }}>No notifications yet.</p> : notifications.map((n: any) => (
            <div key={n.id} style={{ padding: '15px', border: '1px solid #f0f0f0', borderRadius: '8px', marginBottom: '10px' }}>
              <p style={{ fontWeight: '600' }}>{n.title}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>{n.message}</p>
              <p style={{ color: '#999', fontSize: '12px' }}>{new Date(n.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "audit" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Audit Log ({auditLogs.length})</h2>
          {auditLogs.length === 0 ? <p style={{ color: '#666' }}>No audit entries.</p> : auditLogs.map((a: any, i: number) => (
            <div key={i} style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <p><strong>{a.action}</strong> - {new Date(a.timestamp).toLocaleString()}</p>
              <p style={{ color: '#999' }}>Hash: {a.hash?.substring(0, 20)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}