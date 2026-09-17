"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CheckInPage() {
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    const saved = localStorage.getItem('kinoo_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) {}
    }
    loadStatus();
  }, []);

  const loadStatus = () => {
    const saved = localStorage.getItem('kinoo_user');
    const u = saved ? JSON.parse(saved) : null;
    if (!u) { setLoading(false); return; }
    fetch(`/api/check-in?userId=${u.id || u._id}&t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { setStatus(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const doCheckIn = async () => {
    const saved = localStorage.getItem('kinoo_user');
    const u = saved ? JSON.parse(saved) : null;
    if (!u) { toast.error("Please log in"); return; }

    const res = await fetch("/api/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id || u._id })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || "Checked in!");
      loadStatus();
    } else toast.error(data.error || "Failed");
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '25px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const week = status?.week;
  const checkedIn = status?.checkedInThisWeek;
  const partner = status?.partnerStatus;

  return (
    <div style={{ color: textColor, maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>✅ Weekly Check-in</h1>

      <div style={{ ...cardStyle, marginBottom: '20px', textAlign: 'center' }}>
        {week && (
          <>
            <p style={{ fontSize: '14px', opacity: '0.7', marginBottom: '5px' }}>This Week</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
              {new Date(week.opensAt).toLocaleDateString()} — {new Date(week.closesAt).toLocaleDateString()}
            </p>
            <p style={{ fontSize: '13px', marginBottom: '20px', color: week.isOpen ? '#10b981' : '#ef4444' }}>
              {week.isOpen ? '🟢 Check-in is OPEN' : '🔴 Check-in is CLOSED'}
            </p>
          </>
        )}

        {checkedIn ? (
          <div style={{ padding: '20px', background: '#10b981', color: 'white', borderRadius: '12px' }}>
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>✅</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>You have checked in!</p>
          </div>
        ) : (
          <button onClick={doCheckIn} disabled={!week?.isOpen} style={{ background: week?.isOpen ? '#10b981' : '#64748b', color: 'white', border: 'none', padding: '20px 40px', borderRadius: '12px', cursor: week?.isOpen ? 'pointer' : 'not-allowed', fontSize: '18px', fontWeight: 'bold', width: '100%' }}>
            {week?.isOpen ? '✅ Check In Now' : 'Check-in Closed'}
          </button>
        )}
      </div>

      {partner && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '10px' }}>Your Pair Partner</h3>
          <div style={{ padding: '15px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: '600' }}>{partner.name}</p>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>{partner.checkedIn ? '✅ Checked in this week' : '⏳ Not yet checked in'}</p>
            </div>
            <span style={{ fontSize: '32px' }}>{partner.checkedIn ? '✅' : '⏳'}</span>
          </div>
        </div>
      )}

      {!partner && (
        <div style={cardStyle}>
          <p style={{ opacity: '0.7', textAlign: 'center' }}>You are not in a pair yet. Contact your Moderator.</p>
        </div>
      )}
    </div>
  );
}
