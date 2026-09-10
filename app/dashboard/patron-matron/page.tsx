"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function PatronMatronPage() {
  const [stats, setStats] = useState({ members: 0, events: 0, pending: 0 });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(p => ({ ...p, members: d.filter((u: any) => u.status === 'active').length, pending: d.filter((u: any) => u.status === 'pending').length })); });
    fetch("/api/events").then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(p => ({ ...p, events: d.length })); });
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>👵 Patron/Matron Console</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '28px', fontWeight: 'bold', color: '#c026d3' }}>{stats.members}</p><p style={{ opacity: '0.7', fontSize: '13px' }}>Active Members</p></div>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.events}</p><p style={{ opacity: '0.7', fontSize: '13px' }}>Events</p></div>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{stats.pending}</p><p style={{ opacity: '0.7', fontSize: '13px' }}>Pending</p></div>
      </div>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>Oversight</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => toast.success("Attendance confirmed!")} style={{ background: '#c026d3', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✅ Confirm Attendance</button>
          <button onClick={() => toast.success("Budget approved!")} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💰 Approve Budget</button>
        </div>
      </div>
    </div>
  );
}