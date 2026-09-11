"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({ members: 0, events: 0, transactions: 0, balance: 0 });
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [purpose, setPurpose] = useState("Tithe");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/users", { cache: "no-store" }).then(r => r.json()).then(d => { if (Array.isArray(d)) { const active = d.filter((u: any) => u.status === 'active'); setMembers(active); setFilteredMembers(active); setStats(p => ({ ...p, members: active.length })); } }).catch(() => {});
    fetch("/api/events", { cache: "no-store" }).then(r => r.json()).then(d => { if (Array.isArray(d)) { setEvents(d); setStats(p => ({ ...p, events: d.length })); } }).catch(() => {});
    fetch("/api/transactions", { cache: "no-store" }).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const income = d.filter((t: any) => t.type !== 'expense' && t.verified).reduce((s: number, t: any) => s + (t.amount || 0), 0);
        const expenses = d.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + (t.amount || 0), 0);
        setStats(p => ({ ...p, transactions: d.length, balance: income - expenses }));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setFilteredMembers(searchTerm.trim() === '' ? members : members.filter((m: any) => m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone?.includes(searchTerm)));
  }, [searchTerm, members]);

  const contribute = async () => {
    if (!userPhone) { toast.error("Enter your M-Pesa phone number"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("Enter valid amount"); return; }

    toast.loading("Sending M-Pesa prompt...");
    try {
      const res = await fetch("/api/mpesa-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userPhone, amount: Number(amount), purpose })
      });
      const data = await res.json();
      toast.dismiss();

      if (res.ok) {
        toast.success("Check your phone for M-Pesa prompt!");
        setAmount("");
      } else {
        toast.error(data.error || "M-Pesa failed");
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error("Network error. Try again.");
    }
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${darkMode ? '#475569' : '#ddd'}`, marginBottom: '10px', background: darkMode ? '#334155' : 'white', color: textColor, boxSizing: 'border-box' as const };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'events', label: '📅 Events' },
    { id: 'attendance', label: '✅ Attendance' },
    { id: 'giving', label: '💸 Giving' },
    { id: 'members', label: '👥 Members' },
  ];

  return (
    <div style={{ color: textColor }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: '25px', borderRadius: '16px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '5px' }}>Welcome to Kinoo YSC!</h1>
        <p style={{ opacity: '0.8' }}>kINOO YSC</p>
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
        {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#3b82f6' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>)}
      </div>

      {activeTab === 'overview' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <button onClick={() => setActiveTab('events')} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: textColor }}>📅 Events</button>
            <button onClick={() => setActiveTab('giving')} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: textColor }}>💸 Contribute</button>
            <button onClick={() => setActiveTab('members')} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: textColor }}>👥 Members</button>
            <button onClick={() => setActiveTab('attendance')} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: textColor }}>✅ Attendance</button>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Events ({events.length})</h3>
          {events.length === 0 ? <p style={{ opacity: '0.7' }}>No events.</p> : events.map((e: any) => (
            <div key={e._id} style={{ padding: '15px', border: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, borderRadius: '8px', marginBottom: '10px' }}>
              <h4>{e.title}</h4>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>{new Date(e.date).toDateString()} - {e.venue}</p>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>Ticket: KES {e.ticketPrice || 'Free'}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Attendance</h3>
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
          <h3 style={{ marginBottom: '15px' }}>💸 Contribute via M-Pesa</h3>
          <div style={{ maxWidth: '350px' }}>
            <input type="tel" placeholder="Your M-Pesa Phone (e.g., 0712345678)" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} style={inputStyle} />
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={inputStyle}>
              <option>Tithe</option>
              <option>Offering</option>
              <option>Event Fee</option>
              <option>Welfare</option>
              <option>Building Fund</option>
              <option>Other</option>
            </select>
            <input type="number" placeholder="Amount (KES)" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
            <button onClick={contribute} style={{ padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', fontSize: '15px' }}>
              📱 Send M-Pesa Prompt
            </button>
            <p style={{ fontSize: '12px', opacity: '0.6', marginTop: '12px', lineHeight: '1.5' }}>
              You'll receive a prompt on your phone. Enter your M-Pesa PIN to complete the contribution.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '15px' }}>Members ({filteredMembers.length})</h3>
          <button onClick={() => window.open("/api/export", "_blank")} style={{ marginBottom: '15px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>📥 Export CSV</button>
          <input type="text" placeholder="🔍 Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputStyle} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead><tr>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Status</th>
              </tr></thead>
              <tbody>
                {filteredMembers.map((m: any) => (
                  <tr key={m._id}>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}` }}>{m.fullName}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}` }}>{m.phone}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}` }}>
                      <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}