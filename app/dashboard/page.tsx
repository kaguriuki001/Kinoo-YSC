"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ members: 0, events: 0, transactions: 0, balance: 0 });
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Tithe");
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/auth/session").then(r => r.json()).then(d => {
      if (d?.user) setUser(d.user);
      else window.location.href = "/";
    });
    fetch("/api/users").then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const active = d.filter((u: any) => u.status === 'active');
        setMembers(active);
        setFilteredMembers(active);
        setStats(prev => ({ ...prev, members: active.length }));
      }
    });
    fetch("/api/events").then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setEvents(d);
        setStats(prev => ({ ...prev, events: d.length }));
      }
    });
    fetch("/api/transactions").then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const total = d.filter((t: any) => t.verified).reduce((s: number, t: any) => s + t.amount, 0);
        setStats(prev => ({ ...prev, transactions: d.length, balance: total }));
      }
    });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(members.filter((m: any) => 
        m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone?.includes(searchTerm)
      ));
    }
  }, [searchTerm, members]);

  const contribute = async () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), purpose })
    });
    const data = await res.json();
    if (res.ok) { toast.success("M-Pesa prompt sent!"); setAmount(""); }
    else toast.error(data.error || "Failed");
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'events', label: '📅 Events' },
    { id: 'giving', label: '💸 Giving' },
    { id: 'members', label: '👥 Members' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: darkMode ? 'linear-gradient(135deg, #1e293b, #334155)' : 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: '25px', borderRadius: '16px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '5px' }}>Welcome, {user.name}!</h1>
        <p style={{ opacity: '0.8' }}>Kinoo Youth Sports Club</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        {[
          { label: 'Members', value: stats.members, color: '#3b82f6', icon: '👥' },
          { label: 'Events', value: stats.events, color: '#f59e0b', icon: '📅' },
          { label: 'Transactions', value: stats.transactions, color: '#10b981', icon: '💰' },
          { label: 'Balance', value: `KES ${stats.balance.toLocaleString()}`, color: '#8b5cf6', icon: '💎' },
        ].map((card) => (
          <div key={card.label} style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` }}>
            <p style={{ fontSize: '30px', marginBottom: '5px' }}>{card.icon}</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: card.color }}>{card.value}</p>
            <p style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '13px' }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: activeTab === tab.id ? '#3b82f6' : darkMode ? '#334155' : '#e5e7eb',
            color: activeTab === tab.id ? 'white' : darkMode ? '#e2e8f0' : '#333',
            fontSize: '14px',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` }}>
          <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <button onClick={() => setActiveTab('events')} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>📅 View Events</button>
            <button onClick={() => setActiveTab('giving')} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>💸 Contribute</button>
            <button onClick={() => setActiveTab('members')} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>👥 Members List</button>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` }}>
          <h3 style={{ marginBottom: '15px' }}>Upcoming Events ({events.length})</h3>
          {events.length === 0 ? <p style={{ color: '#666' }}>No events.</p> : events.map((e: any) => (
            <div key={e._id} style={{ padding: '15px', border: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, borderRadius: '8px', marginBottom: '10px' }}>
              <h4 style={{ marginBottom: '5px' }}>{e.title}</h4>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>{new Date(e.date).toDateString()} - {e.venue}</p>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>Ticket: KES {e.ticketPrice || 'Free'}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'giving' && (
        <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` }}>
          <h3 style={{ marginBottom: '15px' }}>Contribute</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: darkMode ? '#334155' : 'white', color: darkMode ? '#e2e8f0' : '#333' }}>
              <option>Tithe</option>
              <option>Offering</option>
              <option>Event Fee</option>
              <option>Welfare</option>
            </select>
            <input type="number" placeholder="Amount (KES)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: darkMode ? '#334155' : 'white', color: darkMode ? '#e2e8f0' : '#333' }} />
            <button onClick={contribute} style={{ padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Send M-Pesa Prompt
            </button>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` }}>
          <h3 style={{ marginBottom: '15px' }}>Members ({filteredMembers.length})</h3>
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px', background: darkMode ? '#334155' : 'white', color: darkMode ? '#e2e8f0' : '#333' }}
          />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m: any) => (
                <tr key={m._id}>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, fontSize: '14px' }}>{m.fullName}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, fontSize: '14px' }}>{m.phone}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`, fontSize: '14px' }}>
                    <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}