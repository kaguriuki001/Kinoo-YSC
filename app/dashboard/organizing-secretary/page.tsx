"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function OrganisingSecPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", date: "", venue: "", ticketPrice: "" });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetchEvents();
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px' };

  const fetchEvents = () => {
    fetch("/api/events", { credentials: "include" }).then(r => r.json()).then(d => { if (Array.isArray(d)) setEvents(d); });
  };

  const createEvent = async () => {
    if (!form.title || !form.date || !form.venue) { toast.error("Fill all fields"); return; }
    const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) { toast.success("Event created!"); setForm({ title: "", date: "", venue: "", ticketPrice: "" }); fetchEvents(); }
    else toast.error(data.error || "Failed");
  };

  const tabs = [
    { id: 'events', label: '📅 Events' },
    { id: 'create', label: '➕ Create' },
    { id: 'logistics', label: '🚌 Logistics' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🚌 Organising Secretary</h1>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#ea580c' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'events' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>All Events ({events.length})</h2>
          {events.length === 0 ? <p style={{ opacity: '0.7' }}>No events yet.</p> : events.map((e: any) => (
            <div key={e._id} style={{ padding: '15px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '10px' }}>
              <h3 style={{ fontWeight: '600' }}>{e.title}</h3>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>{new Date(e.date).toDateString()} - {e.venue}</p>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>Ticket: KES {e.ticketPrice || 'Free'}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'create' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Create Event</h2>
          <div style={{ maxWidth: '400px' }}>
            <input placeholder="Event Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} style={inputStyle} />
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} style={inputStyle} />
            <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({...form, venue: e.target.value})} style={inputStyle} />
            <input type="number" placeholder="Ticket Price (KES)" value={form.ticketPrice} onChange={(e) => setForm({...form, ticketPrice: e.target.value})} style={inputStyle} />
            <button onClick={createEvent} style={{ background: '#ea580c', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Create Event</button>
          </div>
        </div>
      )}

      {activeTab === 'logistics' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Logistics Management</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fff7ed', borderRadius: '8px' }}>🚗 Transport</div>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fef2f2', borderRadius: '8px' }}>🍽️ Catering</div>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#eff6ff', borderRadius: '8px' }}>🎤 Equipment</div>
            <div style={{ padding: '15px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '8px' }}>👥 Volunteers</div>
          </div>
        </div>
      )}
    </div>
  );
}