"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function PatronMatronPage() {
  const [stats, setStats] = useState({ members: 0, events: 0 });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(p => ({ ...p, members: d.length })); });
    fetch("/api/events").then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(p => ({ ...p, events: d.length })); });
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>👵 Patron/Matron Console</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: bgColor, padding: '20px', borderRadius: '12px', textAlign: 'center' }}><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#c026d3' }}>{stats.members}</p><p style={{ opacity: '0.7' }}>Members</p></div>
        <div style={{ background: bgColor, padding: '20px', borderRadius: '12px', textAlign: 'center' }}><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.events}</p><p style={{ opacity: '0.7' }}>Events</p></div>
      </div>
      <div style={{ background: bgColor, padding: '20px', borderRadius: '12px' }}>
        <h2 style={{ marginBottom: '15px' }}>Oversight</h2>
        <button onClick={() => toast.success("Attendance confirmed!")} style={{ background: '#c026d3', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Confirm Attendance</button>
      </div>
    </div>
  );
}