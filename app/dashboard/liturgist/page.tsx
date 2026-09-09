"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function LiturgistPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>✝️ Liturgist Console</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '10px' }}>📖 Liturgy Calendar</h3>
          <p style={{ opacity: '0.7' }}>Next Sunday: Reader - Assigned</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '10px' }}>🙏 Prayer Wall</h3>
          <p style={{ opacity: '0.7' }}>2 new prayer requests</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '10px' }}>📝 Homilies</h3>
          <button onClick={() => toast.success("Homily notes opened!")} style={{ background: '#e11d48', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Write Homily</button>
        </div>
      </div>
    </div>
  );
}