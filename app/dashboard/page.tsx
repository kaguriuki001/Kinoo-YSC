"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({ members: 0, events: 0, transactions: 0, balance: 0 });
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Tithe");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/auth/session").then(r => r.json()).then(d => { if (d?.user) setUser(d.user); else window.location.href = "/"; });
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) { const active = d.filter((u: any) => u.status === 'active'); setMembers(active); setFilteredMembers(active); setStats(p => ({ ...p, members: active.length })); } });
    fetch("/api/events").then(r => r.json()).then(d => { if (Array.isArray(d)) { setEvents(d); setStats(p => ({ ...p, events: d.length })); } });
    fetch("/api/transactions").then(r => r.json()).then(d => { if (Array.isArray(d)) { const total = d.filter((t: any) => t.verified).reduce((s: number, t: any) => s + t.amount, 0); setStats(p => ({ ...p, transactions: d.length, balance: total })); } });
  }, []);

  useEffect(() => {
    setFilteredMembers(searchTerm.trim() === '' ? members : members.filter((m: any) => m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone?.includes(searchTerm)));
  }, [searchTerm, members]);

  const contribute = async () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter valid amount"); return; }
    const res = await fetch("/api/contributions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), purpose }) });
    const data = await res.json();
    if (res.ok) { toast.success("M-Pesa prompt sent!"); setAmount(""); } else toast.error(data.error || "Failed");
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'events', label: '📅 Events' },
    { id: 'attendance', label: '✅ Attendance' },
    { id: 'giving', label: '💸 Giving' },
    { id: 'members', label: '👥 Members' },
  ];

  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', background: darkMode ? '#334155' : 'white', color: darkMode ? '#e2e8f0' : '#333' };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: '25px', borderRadius: '16px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '5px' }}>Welcome, {user.name}!</h1>
        <p style={{ opacity: '0.8' }}>Kinoo Youth Sports Club</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        {[{ label: 'Members', value: stats.members, color: '#3b82f6', icon: '👥' }, { label: 'Events', value: stats.events, color: '#f59e0b', icon: '📅' }, { label: 'Transactions', value: stats.transactions, color: '#10b981', icon: '💰' }, { label: 'Balance', value: `KES ${stats.balance.toLocaleString()}`, color: '#8b5cf6', icon: '💎' }].map(c => (
          <div key={c.label} style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ fontSize: '30px', marginBottom: '5px' }}>{c.icon}</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: c.color }}>{c.value}</p>
            <p style={{ opacity: '0.7', fontSize: '13px' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#3b82f6' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : darkMode ? '#e2e8f0' : '#333', fontSize: '14px' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {[{ tab: 'events', label: '📅 View Events' }, { tab: 'giving', label: '💸 Contribute' }, { tab: 'members', label: '👥 Members List' }, { tab: 'attendance', label: '✅ Attendance' }].map(a => (
              <button key={a.tab} onClick={() => setActiveTab(a.tab)} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>{a.label}</button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Upcoming Events ({events.length})</h3>
          {events.length === 0 ? <p style={{ opacity: '0.7' }}>No events.</p> : events.map((e: any) => (
            <div key={e._id} style={{ padding: '15px', border: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, borderRadius: '8px', marginBottom: '10px' }}>
              <h4 style={{ marginBottom: '5px' }}>{e.title}</h4>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>{new Date(e.date).toDateString()} - {e.venue}</p>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>Ticket: KES {e.ticketPrice || 'Free'}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Attendance Tracking</h3>
          <select style={inputStyle}><option>Select Event</option>{events.map((e: any) => <option key={e._id} value={e._id}>{e.title}</option>)}</select>
          <select style={inputStyle}><option>Select Member</option>{members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}</select>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => toast.success("Marked Present!")} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✅ Present</button>
            <button onClick={() => toast.success("Marked Absent!")} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>❌ Absent</button>
          </div>
        </div>
      )}

      {activeTab === 'giving' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Contribute</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={inputStyle}><option>Tithe</option><option>Offering</option><option>Event Fee</option><option>Welfare</option></select>
            <input type="number" placeholder="Amount (KES)" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
            <button onClick={contribute} style={{ padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Send M-Pesa Prompt</button>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Members ({filteredMembers.length})</h3>
          <button onClick={() => window.open("/api/export", "_blank")} style={{ marginBottom: '15px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>📥 Export CSV</button>
          <input type="text" placeholder="🔍 Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputStyle} />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Status</th>
            </tr></thead>
            <tbody>
              {filteredMembers.map((m: any) => (
                <tr key={m._id}>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, fontSize: '14px' }}>{m.fullName}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, fontSize: '14px' }}>{m.phone}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, fontSize: '14px' }}><span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}