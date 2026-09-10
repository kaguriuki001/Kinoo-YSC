"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ViceSecretaryPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ members: 0, events: 0, transactions: 0, balance: 0, pending: 0 });
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetchData();
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px' };

  const fetchData = async () => {
    try {
      const [uRes, eRes, tRes] = await Promise.all([fetch("/api/users"), fetch("/api/events"), fetch("/api/transactions")]);
      const users = await uRes.json();
      const evts = await eRes.json();
      const txs = await tRes.json();
      if (Array.isArray(users)) { setMembers(users); setStats(p => ({ ...p, members: users.filter((u: any) => u.status === 'active').length, pending: users.filter((u: any) => u.status === 'pending').length })); }
      if (Array.isArray(evts)) { setEvents(evts); setStats(p => ({ ...p, events: evts.length })); }
      if (Array.isArray(txs)) {
        const income = txs.filter((t: any) => t.type !== 'expense' && t.verified).reduce((s: number, t: any) => s + t.amount, 0);
        const expenses = txs.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
        setStats(p => ({ ...p, transactions: txs.length, balance: income - expenses }));
      }
    } catch (e) {}
  };

  const askAI = () => {
    if (!aiQuery.trim()) return;
    const q = aiQuery.toLowerCase();
    let response = "";

    if (q.includes('inactive') || q.includes('attendance')) {
      response = `Based on current data: ${stats.members} active members. Consider reaching out to members who haven't contributed this month.`;
    } else if (q.includes('balance') || q.includes('money') || q.includes('finance')) {
      response = `Current balance: KES ${stats.balance.toLocaleString()}. ${stats.transactions} total transactions.`;
    } else if (q.includes('event') || q.includes('plan')) {
      response = `${stats.events} events scheduled. Suggest a planning meeting 3 weeks before each event.`;
    } else if (q.includes('growth') || q.includes('strategy')) {
      response = `Focus areas:\n1. Member retention (currently ${stats.members} active)\n2. Event engagement (${stats.events} planned)\n3. Financial transparency (KES ${stats.balance.toLocaleString()})`;
    } else {
      response = `Analysis:\n• ${stats.members} active members\n• ${stats.pending} pending approvals\n• ${stats.events} upcoming events\n• KES ${stats.balance.toLocaleString()} balance\n\nSuggestions:\n• Increase member engagement\n• Plan quarterly events\n• Review financial targets`;
    }
    setAiResponse(response);
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'ai', label: '🧠 AI Strategist' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🧠 Strategist Console</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.members}</p><p style={{ opacity: '0.7', fontSize: '13px' }}>Members</p></div>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.events}</p><p style={{ opacity: '0.7', fontSize: '13px' }}>Events</p></div>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>KES {stats.balance.toLocaleString()}</p><p style={{ opacity: '0.7', fontSize: '13px' }}>Balance</p></div>
        <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ fontSize: '28px', fontWeight: 'bold', color: '#7c3aed' }}>{stats.pending}</p><p style={{ opacity: '0.7', fontSize: '13px' }}>Pending</p></div>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#7c3aed' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>))}
      </div>

      {activeTab === 'overview' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Group Health Summary</h2>
          <p style={{ marginBottom: '10px' }}>📊 Active members: <strong>{stats.members}</strong></p>
          <p style={{ marginBottom: '10px' }}>⏳ Pending approvals: <strong>{stats.pending}</strong></p>
          <p style={{ marginBottom: '10px' }}>📅 Events planned: <strong>{stats.events}</strong></p>
          <p style={{ marginBottom: '10px' }}>💰 Financial balance: <strong>KES {stats.balance.toLocaleString()}</strong></p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Group Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#eff6ff', borderRadius: '8px' }}>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>Member Engagement</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.members > 0 ? Math.round((stats.members / (stats.members + stats.pending)) * 100) : 0}%</p>
            </div>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '8px' }}>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>Financial Health</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>KES {stats.balance.toLocaleString()}</p>
            </div>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fff7ed', borderRadius: '8px' }}>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>Event Activity</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.events}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>🧠 AI Strategist</h2>
          <textarea placeholder="Ask: 'How many members are active?' or 'Financial health?' or 'Growth strategy?'" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} />
          <button onClick={askAI} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginBottom: '15px' }}>🤖 Ask AI</button>
          {aiResponse && (
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#faf5ff', borderRadius: '8px', whiteSpace: 'pre-line', lineHeight: '1.7' }}>
              {aiResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
}