"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function FatherPage() {
  const [stats, setStats] = useState({ members: 0 });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setStats({ members: d.length }); });
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>👑 Father In-Charge</h1>
      <div style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', padding: '25px', borderRadius: '16px', color: 'white', marginBottom: '20px' }}>
        <p style={{ opacity: '0.9' }}>Total Members</p>
        <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.members}</p>
      </div>
      <div style={{ background: bgColor, padding: '20px', borderRadius: '12px', display: 'grid', gap: '10px' }}>
        <button onClick={() => toast.success("Treasury frozen!")} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>🔒 Freeze Treasury</button>
        <button onClick={() => toast.success("Member dismissed!")} style={{ background: '#991b1b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>❌ Dismiss Member</button>
        <button onClick={() => toast.success("Subcommittee dissolved!")} style={{ background: '#7f1d1d', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>⚖️ Dissolve Subcommittee</button>
      </div>
    </div>
  );
}