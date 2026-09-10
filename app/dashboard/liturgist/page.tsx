"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function LiturgistPage() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [prayers, setPrayers] = useState<any[]>([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor };

  const addPrayer = () => {
    if (!newPrayer.trim()) return;
    setPrayers([...prayers, { id: Date.now(), text: newPrayer, date: new Date() }]);
    setNewPrayer("");
    toast.success("Prayer request added");
  };

  const tabs = [
    { id: 'calendar', label: '📖 Liturgy' },
    { id: 'prayer', label: '🙏 Prayer Wall' },
    { id: 'homily', label: '📝 Homilies' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>✝️ Liturgist Console</h1>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#e11d48' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>))}
      </div>

      {activeTab === 'calendar' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>📖 Liturgy Calendar</h2>
          <p style={{ marginBottom: '10px' }}>Next Sunday: <strong>Reader - Assigned</strong></p>
          <p style={{ marginBottom: '10px' }}>Intercessor: <strong>To be assigned</strong></p>
          <p style={{ marginBottom: '10px' }}>Choir: <strong>Youth Praise Team</strong></p>
        </div>
      )}

      {activeTab === 'prayer' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>🙏 Prayer Wall</h2>
          <input placeholder="Add prayer request..." value={newPrayer} onChange={(e) => setNewPrayer(e.target.value)} style={inputStyle} />
          <button onClick={addPrayer} style={{ marginTop: '10px', background: '#e11d48', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add Request</button>
          <div style={{ marginTop: '20px' }}>
            {prayers.length === 0 ? <p style={{ opacity: '0.7' }}>No prayer requests yet.</p> : prayers.map((p: any) => (
              <div key={p.id} style={{ padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '8px' }}>
                <p>{p.text}</p>
                <p style={{ fontSize: '12px', opacity: '0.6' }}>{new Date(p.date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'homily' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>📝 Homily Notes</h2>
          <textarea placeholder="Write homily notes..." style={{ ...inputStyle, minHeight: '200px' }} />
          <button onClick={() => toast.success("Homily saved!")} style={{ marginTop: '10px', background: '#e11d48', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Save Homily</button>
        </div>
      )}
    </div>
  );
}