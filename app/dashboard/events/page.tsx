"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sort, setSort] = useState("newest");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/events-view?sort=${sort}&t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setEvents(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort]);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return '#64748b';
    if (status === 'upcoming') return '#3b82f6';
    if (status === 'ongoing') return '#10b981';
    if (status === 'cancelled') return '#ef4444';
    return '#6b7280';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading events...</div>;

  return (
    <div style={{ color: textColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px' }}>📅 Events ({events.length})</h1>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, background: darkMode ? '#1e293b' : 'white', color: textColor, cursor: 'pointer' }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {events.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ opacity: '0.7', textAlign: 'center' }}>No events yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {events.map((e: any) => (
            <div key={e._id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{e.title}</h3>
                  <p style={{ fontSize: '14px', opacity: '0.7', marginBottom: '4px' }}>📅 {new Date(e.date).toDateString()}{e.time ? ` · ${e.time}` : ''}</p>
                  <p style={{ fontSize: '14px', opacity: '0.7', marginBottom: '4px' }}>📍 {e.venue}</p>
                  {e.ticketPrice > 0 && <p style={{ fontSize: '14px', opacity: '0.7' }}>🎟️ KES {e.ticketPrice}</p>}
                  {e.description && <p style={{ fontSize: '13px', opacity: '0.6', marginTop: '8px' }}>{e.description}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <span style={{ background: getStatusColor(e.status), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>{e.status}</span>
                  {e.hasFrago && <span style={{ background: '#8b5cf6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>🎯 FRAGO: {e.fragoStatus}</span>}
                  {e.hasBudget && <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>💰 Budget: KES {e.budgetTotal.toLocaleString()}</span>}
                  {e.expenditure > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>💸 Spent: KES {e.expenditure.toLocaleString()}</span>}
                </div>
              </div>

              <div style={{ marginTop: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {e.hasFrago && (
                  <button onClick={() => setSelectedEvent({ ...e, view: 'frago' })} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    🎯 View FRAGO
                  </button>
                )}
                {e.hasBudget && (
                  <button onClick={() => setSelectedEvent({ ...e, view: 'budget' })} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    💰 View Budget
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedEvent(null)}>
          <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '25px', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', color: textColor }} onClick={(ev) => ev.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {selectedEvent.view === 'frago' ? '🎯 FRAGO' : '💰 Budget'} — {selectedEvent.title}
              </h2>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: textColor }}>✕</button>
            </div>
            <p style={{ opacity: '0.7', fontSize: '14px', lineHeight: '1.6' }}>
              {selectedEvent.view === 'frago'
                ? 'Full FRAGO details will appear here. Members can view but not edit.'
                : 'Full budget breakdown will appear here. Members can view but not edit.'}
            </p>
            <div style={{ marginTop: '20px', padding: '15px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '10px' }}>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>🔒 Read-only view. Contact Organising Secretary for changes.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
