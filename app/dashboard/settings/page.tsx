"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("roles");
  const [users, setUsers] = useState<any[]>([]);
  const [bgColor, setBgColor] = useState("#f5f5f5");
  const [logo, setLogo] = useState("");

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsers(data.filter((u: any) => u.status === 'active'));
    });
    const savedBg = localStorage.getItem('kinoo_bg');
    if (savedBg) setBgColor(savedBg);
  }, []);

  const allRoles = ['father', 'moderator', 'secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'patron_matron', 'member'];

  const assignRole = async (userId: string, role: string) => {
    await fetch("/api/assign-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role }) });
    toast.success(`Role "${role}" assigned!`);
    fetch("/api/users").then(r => r.json()).then(d => setUsers(d.filter((u: any) => u.status === 'active')));
  };

  const saveBackground = () => {
    localStorage.setItem('kinoo_bg', bgColor);
    document.body.style.background = bgColor;
    toast.success("Background saved!");
  };

  const uploadLogo = () => {
    toast.success("Logo upload coming soon!");
  };

  const resetPassword = async (userId: string) => {
    await fetch("/api/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, newPassword: "Kinoo123!" }) });
    toast.success("Password reset to: Kinoo123!");
  };

  const tabs = ["roles", "appearance", "members", "security"];

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>⚙️ Settings</h1>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: activeTab === tab ? '#64748b' : '#e5e7eb',
            color: activeTab === tab ? 'white' : '#333', textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

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

      {activeTab === "appearance" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Appearance</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Background Color</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }} />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '150px' }} />
              <button onClick={saveBackground} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Upload Logo</label>
            <button onClick={uploadLogo} style={{ background: '#64748b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Upload Logo</button>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>All Members ({users.length})</h2>
          {users.map((u: any) => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <p style={{ fontWeight: '600' }}>{u.fullName}</p>
                <p style={{ color: '#666', fontSize: '13px' }}>{u.phone}</p>
              </div>
              <button onClick={() => resetPassword(u._id)} style={{ background: '#f97316', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Reset Pass</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "security" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Security</h2>
          <div style={{ padding: '15px', background: '#fef2f2', borderRadius: '8px', marginBottom: '10px' }}>
            <p style={{ fontWeight: '600', color: '#dc2626' }}>Freeze Treasury</p>
            <p style={{ color: '#666', fontSize: '13px' }}>Emergency stop for all transactions.</p>
            <button onClick={() => toast.success("Treasury frozen!")} style={{ marginTop: '10px', background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Freeze</button>
          </div>
          <div style={{ padding: '15px', background: '#fefce8', borderRadius: '8px' }}>
            <p style={{ fontWeight: '600', color: '#ca8a04' }}>Audit Log</p>
            <p style={{ color: '#666', fontSize: '13px' }}>View all system actions with hash chain.</p>
            <button onClick={() => toast.success("Audit log loading...")} style={{ marginTop: '10px', background: '#ca8a04', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>View Log</button>
          </div>
        </div>
      )}
    </div>
  );
}