"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function OrganisingSecPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", date: "", venue: "", ticketPrice: "" });

  useEffect(() => {
    fetch("/api/events").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setEvents(data);
    });
  }, []);

  const createEvent = async () => {
    if (!form.title || !form.date || !form.venue) {
      toast.error("Fill all fields");
      return;
    }
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Event created!");
      setForm({ title: "", date: "", venue: "", ticketPrice: "" });
      fetch("/api/events").then(r => r.json()).then(d => setEvents(d));
    } else {
      toast.error(data.error || "Failed");
    }
  };

  const tabs = ["events", "create", "logistics"];

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Organising Secretary</h1>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: activeTab === tab ? '#ea580c' : '#e5e7eb',
            color: activeTab === tab ? 'white' : '#333', textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === "events" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>All Events ({events.length})</h2>
          {events.length === 0 ? <p style={{ color: '#666' }}>No events yet.</p> : events.map((e: any) => (
            <div key={e._id} style={{ padding: '15px', border: '1px solid #f0f0f0', borderRadius: '8px', marginBottom: '10px' }}>
              <h3 style={{ fontWeight: '600' }}>{e.title}</h3>
              <p>{new Date(e.date).toDateString()} - {e.venue}</p>
              <p>Ticket: KES {e.ticketPrice || 'Free'}</p>
              <p style={{ color: e.status === 'upcoming' ? '#ea580c' : '#16a34a' }}>{e.status}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "create" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Create Event</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <input placeholder="Event Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({...form, venue: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input type="number" placeholder="Ticket Price (KES)" value={form.ticketPrice} onChange={(e) => setForm({...form, ticketPrice: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <button onClick={createEvent} style={{ background: '#ea580c', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Create Event</button>
          </div>
        </div>
      )}

      {activeTab === "logistics" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Logistics</h2>
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            <div style={{ padding: '20px', background: '#fff7ed', borderRadius: '8px' }}>🚗 Transport</div>
            <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '8px' }}>🍽️ Catering</div>
            <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px' }}>🎤 Equipment</div>
            <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px' }}>👥 Volunteers</div>
          </div>
        </div>
      )}
    </div>
  );
}