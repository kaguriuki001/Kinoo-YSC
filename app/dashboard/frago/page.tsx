"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function FRAGOPage() {
  const [fragos, setFragos] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [selectedFrago, setSelectedFrago] = useState<any>(null);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    const saved = localStorage.getItem('kinoo_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUserRoles(u.roles || []);
      } catch (e) {}
    }
    loadAll();
  }, []);

  const canCurate = userRoles.includes('moderator') || userRoles.includes('father');

  const loadAll = () => {
    fetch("/api/frago?t=" + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setFragos(d); })
      .catch(() => {});
    fetch("/api/events?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setEvents(d); }).catch(() => {});
    fetch("/api/users?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setMembers(d.filter((u: any) => u.status === 'active')); }).catch(() => {});
  };

  const toggleFeedbackInclusion = async (feedbackId: string, eventId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    // Optimistic update
    setFragos(prev => prev.map(f => ({
      ...f,
      memberFeedback: f.memberFeedback?.map((fb: any) =>
        fb._id === feedbackId ? { ...fb, includeInFrago: newValue } : fb
      )
    })));
    if (selectedFrago) {
      setSelectedFrago((prev: any) => ({
        ...prev,
        memberFeedback: prev.memberFeedback?.map((fb: any) =>
          fb._id === feedbackId ? { ...fb, includeInFrago: newValue } : fb
        )
      }));
    }

    const res = await fetch("/api/event-feedback-curate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackId, eventId, includeInFrago: newValue })
    });
    if (res.ok) {
      toast.success(newValue ? "Feedback added to FRAGO" : "Feedback hidden");
    } else {
      toast.error("Failed to update");
      loadAll();
    }
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor };

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🎯 FRAGO System</h1>

      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>All FRAGOs ({fragos.length})</h2>
        {fragos.length === 0 ? <p style={{ opacity: '0.7' }}>No FRAGOs yet.</p> : fragos.map((f: any) => {
          const feedbackCount = f.memberFeedback?.length || 0;
          const shownCount = f.memberFeedback?.filter((fb: any) => fb.includeInFrago !== false).length || 0;
          return (
            <div key={f._id} style={{ padding: '15px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontWeight: '600', marginBottom: '5px' }}>{f.opName}</h3>
                  <p style={{ fontSize: '13px', opacity: '0.7' }}>Created: {new Date(f.createdAt).toLocaleDateString()}</p>
                  <p style={{ fontSize: '13px', opacity: '0.7' }}>Attendees: {f.attendees?.length || 0}</p>
                  {feedbackCount > 0 && (
                    <p style={{ fontSize: '13px', color: '#8b5cf6', marginTop: '5px', fontWeight: '600' }}>
                      💬 {feedbackCount} feedback ({shownCount} shown in FRAGO)
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedFrago(f)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    👁️ View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedFrago && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }} onClick={() => setSelectedFrago(null)}>
          <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '25px', borderRadius: '16px', maxWidth: '700px', width: '100%', color: textColor, marginTop: '20px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{selectedFrago.opName}</h2>
              <button onClick={() => setSelectedFrago(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: textColor }}>✕</button>
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '10px', fontSize: '14px', lineHeight: '1.7' }}>
              <p><strong>Situation:</strong> {selectedFrago.situation || 'N/A'}</p>
              <p><strong>Mission:</strong> {selectedFrago.missionStmt || 'N/A'}</p>
              <p><strong>Attendees:</strong> {selectedFrago.attendees?.length || 0}</p>
              <p><strong>Verdict:</strong> {selectedFrago.verdict || 'Pending'}</p>
            </div>

            {/* Member Feedback Section */}
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                💬 Member Feedback ({selectedFrago.memberFeedback?.length || 0})
              </h3>

              {!selectedFrago.memberFeedback || selectedFrago.memberFeedback.length === 0 ? (
                <p style={{ opacity: '0.7', fontSize: '14px' }}>No member feedback yet. Attendees have 24 hours after the trip to submit.</p>
              ) : (
                <div>
                  {canCurate && (
                    <div style={{ marginBottom: '15px', padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
                      👑 As Moderator, toggle which feedback stays in the FRAGO
                    </div>
                  )}

                  {selectedFrago.memberFeedback.map((fb: any) => (
                    <div key={fb._id} style={{ padding: '15px', borderRadius: '10px', marginBottom: '12px', background: fb.includeInFrago !== false ? (darkMode ? '#065f46' : '#f0fdf4') : (darkMode ? '#1f2937' : '#f3f4f6'), border: `1px solid ${fb.includeInFrago !== false ? '#10b981' : '#d1d5db'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '14px' }}>{fb.userName}</p>
                          <p style={{ fontSize: '11px', opacity: '0.6' }}>{new Date(fb.submittedAt).toLocaleString()}</p>
                          <p style={{ fontSize: '13px', color: '#f59e0b', marginTop: '3px' }}>{'⭐'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</p>
                        </div>
                        {canCurate && (
                          <button
                            onClick={() => toggleFeedbackInclusion(fb._id, selectedFrago.eventId, fb.includeInFrago !== false)}
                            style={{ background: fb.includeInFrago !== false ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            {fb.includeInFrago !== false ? '✓ Shown in FRAGO' : '✗ Hidden'}
                          </button>
                        )}
                      </div>

                      {fb.wentWell && (
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>✅ What went well:</p>
                          <p style={{ fontSize: '13px', opacity: '0.9', marginTop: '3px' }}>{fb.wentWell}</p>
                        </div>
                      )}
                      {fb.wentWrong && (
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>❌ What went wrong:</p>
                          <p style={{ fontSize: '13px', opacity: '0.9', marginTop: '3px' }}>{fb.wentWrong}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setSelectedFrago(null)} style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
