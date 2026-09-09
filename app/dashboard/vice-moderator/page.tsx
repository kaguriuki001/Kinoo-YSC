"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function ViceModeratorPage() {
  const [darkMode, setDarkMode] = useState(false);

  useState(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
  });

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>⚖️ Vice Moderator Console</h1>
      <div style={{ background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` }}>
        <h2 style={{ marginBottom: '15px' }}>Subcommittees</h2>
        <button onClick={() => toast.success("Subcommittee creation coming soon!")} style={{ background: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>+ Create Subcommittee</button>
      </div>
    </div>
  );
}