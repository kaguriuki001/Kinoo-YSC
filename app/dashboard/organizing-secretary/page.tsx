"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function OrganisingSecretaryPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", venue: "", ticketPrice: "", description: "" });
  const [logistics, setLogistics] = useState({ transport: "", catering: "", equipment: "", volunteers: "" });

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetchEvents();
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px' };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data);
    } catch (e) {}
  };

  const createEvent = async () => {
    if (!form.title || !form.date || !form.venue) { toast.error("Fill title, date, venue"); return; }
    
    // Check 2-week rule
    const eventDate = new Date(form.date);
    const today = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 14) { toast.error(`Event must be at least 14 days away. Currently ${diffDays} days.`); return; }

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ticketPrice: Number(form.ticketPrice) || 0, logistics })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Event created!");
      setForm({ title: "", date: "", time: "", venue: "", ticketPrice: "", description: "" });
      fetchEvents();
    } else toast.error(data.error || "Failed");
  };

  const tabs = [
    { id: 'events', label: '📅 Events' },
    { id: 'create', label: '➕ Create Event' },
    { id: 'logistics', label: '🚌 Logistics' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🚌 Organising Secretary</h1>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#ea580c' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>))}
      </div>

      {activeTab === 'events' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>All Events ({events.length})</h2>
          {events.length === 0 ? <p style={{ opacity: '0.7' }}>No events yet.</p> : events.map((e: any) => {
            const daysLeft = Math.ceil((new Date(e.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={e._id} style={{ padding: '15px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '5px' }}>{e.title}</h3>
                    <p style={{ fontSize: '14px', opacity: '0.7' }}>📅 {new Date(e.date).toDateString()}</p>
                    <p style={{ fontSize: '14px', opacity: '0.7' }}>📍 {e.venue}</p>
                    <p style={{ fontSize: '14px', opacity: '0.7' }}>🎟️ KES {e.ticketPrice || 'Free'}</p>
                    {daysLeft > 0 && <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '5px' }}>⏳ {daysLeft} days away</p>}
                  </div>
                  <span style={{ background: daysLeft > 0 ? '#10b981' : '#6b7280', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{daysLeft > 0 ? 'Upcoming' : 'Past'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'create' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Create Event (2-week rule enforced)</h2>
          <div style={{ maxWidth: '500px' }}>
            <input placeholder="Event Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} style={inputStyle} />
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} style={inputStyle} />
            <input type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} style={inputStyle} />
            <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({...form, venue: e.target.value})} style={inputStyle} />
            <input type="number" placeholder="Ticket Price (KES)" value={form.ticketPrice} onChange={(e) => setForm({...form, ticketPrice: e.target.value})} style={inputStyle} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} style={{ ...inputStyle, minHeight: '80px' }} />
            <button onClick={createEvent} style={{ background: '#ea580c', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>🎉 Create Event</button>
          </div>
        </div>
      )}

      {activeTab === 'logistics' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Logistics Planning</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fff7ed', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '10px' }}>🚗 Transport</h3>
              <textarea placeholder="Routes, buses, pickup points..." value={logistics.transport} onChange={(e) => setLogistics({...logistics, transport: e.target.value})} style={{ ...inputStyle, minHeight: '80px' }} />
            </div>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fef2f2', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '10px' }}>🍽️ Catering</h3>
              <textarea placeholder="Menu, headcount, dietary needs..." value={logistics.catering} onChange={(e) => setLogistics({...logistics, catering: e.target.value})} style={{ ...inputStyle, minHeight: '80px' }} />
            </div>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#eff6ff', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '10px' }}>🎤 Equipment</h3>
              <textarea placeholder="Sound, tents, chairs..." value={logistics.equipment} onChange={(e) => setLogistics({...logistics, equipment: e.target.value})} style={{ ...inputStyle, minHeight: '80px' }} />
            </div>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '10px' }}>👥 Volunteers</h3>
              <textarea placeholder="Roles, names, shifts..." value={logistics.volunteers} onChange={(e) => setLogistics({...logistics, volunteers: e.target.value})} style={{ ...inputStyle, minHeight: '80px' }} />
            </div>
          </div>
          <button onClick={() => { localStorage.setItem('kinoo_logistics', JSON.stringify(logistics)); toast.success("Logistics saved!"); }} style={{ marginTop: '15px', background: '#ea580c', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Save Logistics Plan</button>
        </div>
      )}
    </div>
  );
}