"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const cached = localStorage.getItem('kinoo_user');
    if (cached) { try { const u = JSON.parse(cached); setUser(u); fetchNotifs(u); } catch (e) {} }

    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d?.user) { setUser(d.user); localStorage.setItem('kinoo_user', JSON.stringify(d.user)); fetchNotifs(d.user); }
        setReady(true);
      })
      .catch(() => setReady(true));

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchNotifs = (u: any) => {
    const uid = u?.id || u?._id;
    if (!uid) return;
    fetch('/api/notifications?userId=' + uid + '&t=' + Date.now())
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setNotifCount(d.filter((n: any) => !n.read).length); })
      .catch(() => {});
  };

  useEffect(() => {
    document.body.style.background = darkMode ? '#0f172a' : '#f1f5f9';
    document.body.style.color = darkMode ? '#e2e8f0' : '#1e293b';
    localStorage.setItem('kinoo_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  const roles: string[] = (user?.roles || ['member']).map((r: string) => String(r).toLowerCase());
  const isAdmin = roles.some((r: string) => ['father','moderator','secretary','treasurer','organizing','organising','vice','liturgist','patron'].some(k => r.includes(k)));

  const items: any[] = [
    { section: 'MAIN', show: true },
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', show: true },
    { href: '/dashboard/check-in', label: 'Check-in', icon: '✅', show: true },
    { href: '/dashboard/documents', label: 'Documents', icon: '📄', show: true },
    { href: '/dashboard/events', label: 'Events', icon: '📅', show: true },
    { href: '/dashboard/messages', label: 'Messages', icon: '💬', show: true },
    { href: '/dashboard/notifications', label: 'Alerts', icon: '🔔', show: true, badge: notifCount },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤', show: true },

    { section: 'ADMIN CONSOLES', show: isAdmin },
    { href: '/dashboard/father', label: 'Father', icon: '👑', show: isAdmin },
    { href: '/dashboard/father/documents', label: 'Doc Approvals', icon: '✅', show: isAdmin },
    { href: '/dashboard/frago', label: 'FRAGO', icon: '🎯', show: isAdmin },
    { href: '/dashboard/liturgist', label: 'Liturgist', icon: '✝️', show: isAdmin },
    { href: '/minutes.html', label: 'Minutes', icon: '📝', show: isAdmin, external: true },
    { href: '/dashboard/moderator', label: 'Moderator', icon: '🛡️', show: isAdmin },
    { href: '/dashboard/organizing-secretary', label: 'Organising Sec', icon: '🚌', show: isAdmin },
    { href: '/dashboard/pairs', label: 'Pairs', icon: '🤝', show: isAdmin },
    { href: '/dashboard/patron-matron', label: 'Patron/Matron', icon: '👵', show: isAdmin },
    { href: '/dashboard/secretary', label: 'Secretary', icon: '📋', show: isAdmin },
    { href: '/dashboard/treasurer', label: 'Treasurer', icon: '💰', show: isAdmin },
    { href: '/dashboard/vice-moderator', label: 'Vice Moderator', icon: '⚖️', show: isAdmin },
    { href: '/dashboard/vice-secretary', label: 'Vice Secretary', icon: '🧠', show: isAdmin },

    { section: 'SETTINGS', show: isAdmin },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', show: isAdmin },
    { href: '/dashboard/settings/scope', label: 'Structure', icon: '🗂️', show: isAdmin },
    { href: '/dashboard/settings/doc-requirements', label: 'Required Docs', icon: '📄', show: isAdmin },
  ];

  const visible = items.filter((i: any) => i.show);

  if (!ready) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  const sidebarStyle: React.CSSProperties = {
    width: '260px', background: bgColor, color: textColor,
    borderRight: '1px solid ' + borderColor, height: '100vh', overflowY: 'auto',
    position: isMobile ? 'fixed' : 'sticky', top: 0, left: 0, zIndex: 100,
    transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
    transition: 'transform 0.25s', display: 'flex', flexDirection: 'column', padding: '16px 12px',
    boxShadow: isMobile && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: darkMode ? '#0f172a' : '#f1f5f9' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
      )}

      <aside style={sidebarStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Kinoo YSC</h2>
          {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textColor }}>✕</button>}
        </div>

        {user && (
          <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid ' + borderColor }}>
            <p style={{ fontSize: '13px', fontWeight: 600 }}>{user.name || 'User'}</p>
            <p style={{ fontSize: '11px', opacity: 0.6 }}>{roles.join(', ')}</p>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          {visible.map((item: any, idx: number) => {
            if (item.section) {
              return <p key={'s' + idx} style={{ fontSize: '10px', fontWeight: 700, opacity: 0.5, marginTop: '14px', marginBottom: '6px', letterSpacing: '0.5px', paddingLeft: '10px' }}>{item.section}</p>;
            }
            const active = pathname === item.href;
            const s: React.CSSProperties = {
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px', color: active ? 'white' : textColor,
              background: active ? '#3b82f6' : 'transparent'
            };
            if (item.external) {
              return <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" style={s}><span>{item.icon}</span><span>{item.label} ↗</span></a>;
            }
            return (
              <Link key={item.href} href={item.href} style={s} onClick={() => isMobile && setSidebarOpen(false)}>
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge ? <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid ' + borderColor }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ width: '100%', padding: '10px', background: darkMode ? '#334155' : '#e2e8f0', color: textColor, border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', fontSize: '14px' }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={async () => { await fetch('/api/auth/signout', { method: 'POST' }); localStorage.removeItem('kinoo_user'); window.location.href = '/'; }} style={{ width: '100%', padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            Sign Out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {isMobile && (
          <header style={{ position: 'sticky', top: 0, zIndex: 50, background: bgColor, borderBottom: '1px solid ' + borderColor, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: textColor }}>☰</button>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: textColor }}>Kinoo YSC</h1>
          </header>
        )}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
