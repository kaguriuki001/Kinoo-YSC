"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ViceSecretaryPage() {
  const [stats, setStats] = useState({ members: 0, events: 0, transactions: 0 });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(p => ({ ...p, members: d.filter((u: any) => u.status === 'active').length })); });
    fetch("/api/events").then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(p => ({ ...p, events: d.length })); });
    fetch("/api/transactions").then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(p => ({ ...p, transactions: d.length })); });
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor };

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🧠 Strategist Console</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.members}</p><p style={{ opacity: '0.7' }}>Members</p></div>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.events}</p><p style={{ opacity: '0.7' }}>Events</p></div>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.transactions}</p><p style={{ opacity: '0.7' }}>Transactions</p></div>
      </div>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>AI Strategy</h2>
        <textarea placeholder="Ask AI: 'Which members are inactive?'" style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: `1px solid ${darkMode ? '#334155' : '#ddd'}`, background: darkMode ? '#334155' : 'white', color: textColor }} />
        <button onClick={() => toast.success("AI analysis coming soon!")} style={{ marginTop: '10px', background: '#7c3aed', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Ask AI</button>
      </div>
    </div>
  );
}