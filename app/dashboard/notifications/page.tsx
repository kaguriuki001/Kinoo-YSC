"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const saved = localStorage.getItem('kinoo_user');
    const u = saved ? JSON.parse(saved) : null;
    if (!u) { setLoading(false); return; }
    const uid = u.id || u._id;
    fetch(`/api/notifications?userId=${uid}&t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setNotifs(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id })
    });
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.read);
    for (const n of unread) await markRead(n.id);
    toast.success("All marked as read");
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor };

  const unreadCount = notifs.filter(n => !n.read).length;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ color: textColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px' }}>🔔 Notifications {unreadCount > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '14px', marginLeft: '8px' }}>{unreadCount}</span>}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={load} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>🔄 Refresh</button>
          {unreadCount > 0 && <button onClick={markAllRead} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>✓ Mark All Read</button>}
        </div>
      </div>

      {notifs.length === 0 ? (
        <div style={cardStyle}><p style={{ textAlign: 'center', opacity: '0.7' }}>No notifications yet.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {notifs.map((n: any) => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{ ...cardStyle, padding: '15px', cursor: n.read ? 'default' : 'pointer', borderLeft: `4px solid ${n.read ? '#e5e7eb' : '#3b82f6'}`, opacity: n.read ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '5px' }}>{n.title}</p>
                  <p style={{ fontSize: '14px', opacity: '0.85', lineHeight: '1.5' }}>{n.message}</p>
                  <p style={{ fontSize: '11px', opacity: '0.5', marginTop: '6px' }}>{new Date(n.timestamp).toLocaleString()}</p>
                </div>
                {!n.read && <span style={{ background: '#3b82f6', color: 'white', width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '5px' }}></span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
