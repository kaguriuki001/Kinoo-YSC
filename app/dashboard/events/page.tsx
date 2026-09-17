"use client";
import { useState, useEffect } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sort, setSort] = useState("newest");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    const saved = localStorage.getItem('kinoo_user');
    if (saved) {
      try { const u = JSON.parse(saved); setUserRoles(u.roles || []); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/events-view?sort=${sort}&t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setEvents(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sort]);

  const loadFeedback = async (eventId: string) => {
    try {
      const res = await fetch(`/api/event-feedback?eventId=${eventId}&t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) setFeedback(data.filter((f: any) => f.includeInFrago !== false));
    } catch (e) {}
  };

  const canCurate = userRoles.includes('moderator') || userRoles.includes('father');

  const toggleFeedback = async (feedbackId: string, eventId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setFeedback(prev => prev.map(f => f._id === feedbackId ? { ...f, includeInFrago: newValue } : f));
    const res = await fetch("/api/event-feedback-curate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackId, eventId, includeInFrago: newValue })
    });
    if (!res.ok) loadFeedback(eventId);
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor };

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

      {events.length === 0 ? <div style={cardStyle}><p style={{ opacity: '0.7', textAlign: 'center' }}>No events yet.</p></div> : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {events.map((e: any) => (
            <div key={e._id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{e.title}</h3>
                  <p style={{ fontSize: '14px', opacity: '0.7', marginBottom: '4px' }}>📅 {new Date(e.date).toDateString()}</p>
                  <p style={{ fontSize: '14px', opacity: '0.7', marginBottom: '4px' }}>📍 {e.venue}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <span style={{ background: e.status === 'completed' ? '#64748b' : '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', textTransform: 'uppercase' }}>{e.status}</span>
                  {e.hasFrago && <span style={{ background: '#8b5cf6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>🎯 FRAGO</span>}
                  {e.hasBudget && <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>💰 KES {e.budgetTotal?.toLocaleString()}</span>}
                </div>
              </div>
              <button onClick={() => { setSelectedEvent(e); loadFeedback(e._id); }} style={{ marginTop: '15px', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                👁️ View Details & Feedback
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }} onClick={() => setSelectedEvent(null)}>
          <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '25px', borderRadius: '16px', maxWidth: '700px', width: '100%', color: textColor, marginTop: '20px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{selectedEvent.title}</h2>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: textColor }}>✕</button>
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '10px', fontSize: '14px', lineHeight: '1.7' }}>
              <p><strong>📅 Date:</strong> {new Date(selectedEvent.date).toDateString()}</p>
              <p><strong>📍 Venue:</strong> {selectedEvent.venue}</p>
              <p><strong>🎟️ Ticket:</strong> {selectedEvent.ticketPrice ? 'KES ' + selectedEvent.ticketPrice : 'Free'}</p>
            </div>

            {/* Member Feedback */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                💬 Member Feedback ({feedback.length})
              </h3>
              {feedback.length === 0 ? (
                <p style={{ opacity: '0.7', fontSize: '14px' }}>No feedback yet. Attendees have 24 hours to submit after the event.</p>
              ) : (
                <div>
                  {canCurate && <div style={{ marginBottom: '12px', padding: '10px', background: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>👑 Moderator: toggle feedback to keep in FRAGO</div>}
                  {feedback.map((fb: any) => (
                    <div key={fb._id} style={{ padding: '12px', borderRadius: '8px', marginBottom: '10px', background: darkMode ? '#334155' : '#f8fafc', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <p style={{ fontWeight: '600', fontSize: '13px' }}>{fb.userName}</p>
                        {canCurate && (
                          <button onClick={() => toggleFeedback(fb._id, selectedEvent._id, fb.includeInFrago !== false)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
                            Toggle
                          </button>
                        )}
                      </div>
                      {fb.wentWell && <p style={{ fontSize: '12px', color: '#10b981', marginTop: '5px' }}>✅ {fb.wentWell}</p>}
                      {fb.wentWrong && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>❌ {fb.wentWrong}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
