"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function FeedbackPrompt() {
  const [pending, setPending] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [wentWell, setWentWell] = useState("");
  const [wentWrong, setWentWrong] = useState("");
  const [rating, setRating] = useState(5);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Wait a moment then check for pending feedback
    setTimeout(() => {
      const saved = localStorage.getItem('kinoo_user');
      if (!saved) return;
      try {
        const u = JSON.parse(saved);
        fetch(`/api/event-feedback?action=pending&userId=${u.id || u._id}&t=${Date.now()}`)
          .then(r => r.json())
          .then(d => {
            if (d?.pending?.length > 0) {
              setPending(d.pending);
              setCurrentEvent(d.pending[0]);
            }
          })
          .catch(() => {});
      } catch (e) {}
    }, 2000);
  }, []);

  const submitFeedback = async () => {
    if (!wentWell && !wentWrong) { toast.error("Please share at least one thing"); return; }
    setSubmitting(true);

    const saved = localStorage.getItem('kinoo_user');
    const u = saved ? JSON.parse(saved) : null;

    try {
      const res = await fetch("/api/event-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: currentEvent.eventId,
          userId: u.id || u._id,
          userName: u.name || 'Member',
          wentWell, wentWrong, rating, anonymous
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Thank you for your feedback!");
        const remaining = pending.slice(1);
        setPending(remaining);
        setCurrentEvent(remaining[0] || null);
        setWentWell("");
        setWentWrong("");
        setRating(5);
        setAnonymous(false);
      } else toast.error(data.error || "Failed to submit");
    } catch (e) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const skipForLater = () => {
    const remaining = pending.slice(1);
    setPending(remaining);
    setCurrentEvent(remaining[0] || null);
    setWentWell("");
    setWentWrong("");
    setRating(5);
    setAnonymous(false);
  };

  if (!currentEvent) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '48px', marginBottom: '10px' }}>🎯</p>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>How was the trip?</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>{currentEvent.eventTitle}</p>
          <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '8px', fontWeight: '600' }}>
            ⏰ {currentEvent.hoursLeft} hours left to give feedback
          </p>
        </div>

        <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>✅ What went well?</label>
        <textarea
          value={wentWell}
          onChange={(e) => setWentWell(e.target.value)}
          placeholder="Punctuality, good organization, spirit..."
          style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '15px', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />

        <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>❌ What went wrong?</label>
        <textarea
          value={wentWrong}
          onChange={(e) => setWentWrong(e.target.value)}
          placeholder="Delays, missing equipment, communication gaps..."
          style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '15px', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />

        <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>⭐ Overall Rating</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid', borderColor: rating >= n ? '#f59e0b' : '#e5e7eb', background: rating >= n ? '#fef3c7' : 'white', cursor: 'pointer', fontSize: '20px' }}>
              {rating >= n ? '⭐' : '☆'}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666', marginBottom: '20px', cursor: 'pointer' }}>
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
          Submit anonymously
        </label>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={skipForLater} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#666', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            Later
          </button>
          <button onClick={submitFeedback} disabled={submitting} style={{ flex: 2, padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Sending..." : "Submit Feedback"}
          </button>
        </div>

        {pending.length > 1 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '15px' }}>
            {pending.length - 1} more event{pending.length > 2 ? 's' : ''} waiting for feedback
          </p>
        )}
      </div>
    </div>
  );
}
