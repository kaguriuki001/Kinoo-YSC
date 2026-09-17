"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ members: 0, events: 0, transactions: 0, balance: 0 });
  const [checkInStatus, setCheckInStatus] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');

    const saved = localStorage.getItem('kinoo_user');
    if (saved) { try { setUser(JSON.parse(saved)); } catch (e) {} }

    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d?.user) {
          setUser(d.user);
          localStorage.setItem('kinoo_user', JSON.stringify(d.user));
          fetch(`/api/check-in?userId=${d.user.id}&t=${Date.now()}`)
            .then(r => r.json())
            .then(ci => setCheckInStatus(ci))
            .catch(() => {});
        }
      })
      .catch(() => {});

    fetch("/api/users?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(p => ({ ...p, members: d.filter((u: any) => u.status === 'active').length })); }).catch(() => {});
    fetch("/api/events?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) { setEvents(d.slice(0, 3)); setStats(p => ({ ...p, events: d.length })); } }).catch(() => {});
    fetch("/api/transactions?t=" + Date.now()).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const income = d.filter((t: any) => t.type !== 'expense' && t.verified).reduce((s: number, t: any) => s + (t.amount || 0), 0);
        const expenses = d.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + (t.amount || 0), 0);
        setStats(p => ({ ...p, transactions: d.length, balance: income - expenses }));
      }
    }).catch(() => {});
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor, marginBottom: '15px' };

  return (
    <div style={{ color: textColor }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: '25px', borderRadius: '16px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>Karibu, {user?.name || 'Member'}!</h1>
        <p style={{ opacity: '0.8', fontSize: '14px' }}>Forge Youth Uthiru-Kagondo-Kinoo</p>
        {user?.outstation && <p style={{ opacity: '0.7', fontSize: '12px', marginTop: '5px' }}>Outstation: {user.outstation}</p>}
      </div>

      {checkInStatus && (
        <Link href="/dashboard/check-in" style={{ textDecoration: 'none' }}>
          <div style={{ background: checkInStatus.checkedInThisWeek ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', opacity: '0.9' }}>Weekly Check-in</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {checkInStatus.checkedInThisWeek ? '✅ Done this week!' : '⏳ Pending'}
                </p>
                {checkInStatus.partnerStatus && (
                  <p style={{ fontSize: '12px', opacity: '0.9', marginTop: '5px' }}>
                    Partner {checkInStatus.partnerStatus.name}: {checkInStatus.partnerStatus.checkedIn ? '✅' : '⏳'}
                  </p>
                )}
              </div>
              <span style={{ fontSize: '40px' }}>→</span>
            </div>
          </div>
        </Link>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
        {[
          { label: 'Members', value: stats.members, color: '#3b82f6', icon: '👥' },
          { label: 'Events', value: stats.events, color: '#f59e0b', icon: '📅' },
          { label: 'Transactions', value: stats.transactions, color: '#10b981', icon: '💰' },
        ].map(c => (
          <div key={c.label} style={{ ...cardStyle, marginBottom: 0, textAlign: 'center', padding: '15px' }}>
            <p style={{ fontSize: '24px', marginBottom: '3px' }}>{c.icon}</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: c.color }}>{c.value}</p>
            <p style={{ fontSize: '12px', opacity: '0.7' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }}>
        <p style={{ fontSize: '14px', opacity: '0.9' }}>Group Reserve</p>
        <p style={{ fontSize: '32px', fontWeight: 'bold' }}>KES {stats.balance.toLocaleString()}</p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px' }}>Upcoming Events</h3>
          <Link href="/dashboard/events" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>View all →</Link>
        </div>
        {events.length === 0 ? (
          <p style={{ opacity: '0.6', fontSize: '14px' }}>No upcoming events.</p>
        ) : (
          events.map((e: any) => (
            <div key={e._id} style={{ padding: '10px 0', borderBottom: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}` }}>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>{e.title}</p>
              <p style={{ fontSize: '12px', opacity: '0.7' }}>{new Date(e.date).toDateString()} · {e.venue}</p>
            </div>
          ))
        )}
        <Link href="/dashboard/events" style={{ display: 'block', marginTop: '12px', textAlign: 'center', background: '#3b82f6', color: 'white', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          See All Events →
        </Link>
      </div>
    </div>
  );
}
