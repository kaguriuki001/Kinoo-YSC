"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ready, setReady] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');

    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d?.user) {
          setUser(d.user);
          localStorage.setItem('kinoo_user', JSON.stringify(d.user));
          const uid = d.user.id || d.user._id;
          fetch(`/api/notifications?userId=${uid}&t=${Date.now()}`)
            .then(r => r.json())
            .then(notifs => {
              if (Array.isArray(notifs)) setUnreadCount(notifs.filter((n: any) => !n.read).length);
            })
            .catch(() => {});
        } else {
          const cached = localStorage.getItem('kinoo_user');
          if (cached) { try { setUser(JSON.parse(cached)); } catch (e) {} }
        }
        setReady(true);
      })
      .catch(() => {
        const cached = localStorage.getItem('kinoo_user');
        if (cached) { try { setUser(JSON.parse(cached)); } catch (e) {} }
        setReady(true);
      });
  }, []);

  useEffect(() => {
    document.body.style.background = darkMode ? '#0f172a' : '#f1f5f9';
    document.body.style.color = darkMode ? '#e2e8f0' : '#1e293b';
    localStorage.setItem('kinoo_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  const roles: string[] = user?.roles || ['member'];
  const roleStr = roles.join(',').toLowerCase();
  const adminKeywords = ['father', 'moderator', 'secretary', 'treasurer', 'organizing', 'vice', 'liturgist', 'patron'];
  const isAdmin = adminKeywords.some(k => roleStr.includes(k));

  const allConsoles = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', show: true },
    { href: '/dashboard/check-in', label: 'Check-in', icon: '✅', show: true },
    { href: '/dashboard/events', label: 'Events', icon: '📅', show: true },
    { href: '/dashboard/messages', label: 'Messages', icon: '💬', show: true },
    { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔', show: true, badge: unreadCount },
    { href: '/dashboard/pairs', label: 'Pairs', icon: '🤝', show: isAdmin },
    { href: '/dashboard/father', label: 'Father', icon: '👑', show: isAdmin },
    { href: '/dashboard/moderator', label: 'Moderator', icon: '🛡️', show: isAdmin },
    { href: '/dashboard/secretary', label: 'Secretary', icon: '📋', show: isAdmin },
    { href: '/dashboard/treasurer', label: 'Treasurer', icon: '💰', show: isAdmin },
    { href: '/dashboard/organizing-secretary', label: 'Organising Sec', icon: '🚌', show: isAdmin },
    { href: '/dashboard/vice-secretary', label: 'Vice Secretary', icon: '🧠', show: isAdmin },
    { href: '/dashboard/liturgist', label: 'Liturgist', icon: '✝️', show: isAdmin },
    { href: '/dashboard/vice-moderator', label: 'Vice Moderator', icon: '⚖️', show: isAdmin },
    { href: '/dashboard/patron-matron', label: 'Patron/Matron', icon: '👵', show: isAdmin },
    { href: '/dashboard/frago', label: 'FRAGO', icon: '🎯', show: isAdmin },
    { href: '/minutes.html', label: 'Minutes', icon: '📝', show: isAdmin, external: true },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', show: isAdmin },
  ];

  const visibleConsoles = allConsoles.filter((c: any) => c.show);
  const internalConsoles = visibleConsoles.filter((c: any) => !c.external);
  const currentIndex = internalConsoles.findIndex((c: any) => pathname === c.href);
  const goBack = () => { if (currentIndex > 0) router.push(internalConsoles[currentIndex - 1].href); };
  const goForward = () => { if (currentIndex >= 0 && currentIndex < internalConsoles.length - 1) router.push(internalConsoles[currentIndex + 1].href); };

  if (!ready) return <div style={{ padding: '40px', textAlign: 'center', fontSize: '16px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: darkMode ? '#0f172a' : '#f1f5f9' }}>
      <FeedbackPrompt />
      <aside className="sidebar" style={{ width: sidebarOpen ? '230px' : '60px', background: bgColor, color: textColor, padding: '15px', transition: 'width 0.3s', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          {sidebarOpen && <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Kinoo YSC</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textColor }}>{sidebarOpen ? '◀' : '▶'}</button>
        </div>
        {sidebarOpen && user && <p style={{ opacity: '0.7', fontSize: '13px', marginBottom: '5px' }}>{user.name || 'User'}</p>}
        {sidebarOpen && <p style={{ opacity: '0.5', fontSize: '11px', marginBottom: '20px' }}>{roles.join(', ')}</p>}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          {visibleConsoles.map((item: any) => (
            item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="sidebar-link" style={{ color: textColor, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>
                <span>{item.icon}</span>{sidebarOpen && <span>{item.label} ↗</span>}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="sidebar-link" style={{ color: pathname === item.href ? '#fff' : textColor, background: pathname === item.href ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', position: 'relative' }}>
                <span>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {item.badge > 0 && (
                  <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', marginLeft: 'auto' }}>{item.badge}</span>
                )}
              </Link>
            )
          ))}
        </nav>
        <div style={{ paddingTop: '20px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ width: '100%', padding: '10px', background: darkMode ? '#334155' : '#e2e8f0', color: textColor, border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '14px' }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={async () => { await fetch("/api/auth/signout", { method: "POST" }); localStorage.removeItem('kinoo_user'); window.location.href = "/"; }} style={{ width: '100%', padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            {sidebarOpen ? 'Sign Out' : '🚪'}
          </button>
        </div>
      </aside>
      <main className="main-content" style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
          <button onClick={goBack} disabled={currentIndex <= 0} style={{ padding: '10px 20px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer', opacity: currentIndex <= 0 ? 0.4 : 1, fontSize: '16px' }}>← Back</button>
          <button onClick={goForward} disabled={currentIndex >= internalConsoles.length - 1} style={{ padding: '10px 20px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, cursor: currentIndex >= internalConsoles.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex >= internalConsoles.length - 1 ? 0.4 : 1, fontSize: '16px' }}>Forward →</button>
          <span style={{ fontSize: '13px', opacity: '0.6', marginLeft: '10px' }}>{currentIndex + 1} / {internalConsoles.length}</span>
        </div>
        {children}
      </main>
    </div>
  );
}
