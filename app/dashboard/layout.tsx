"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>({ name: 'User', roles: ['member'] });
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');

    // Try localStorage first (instant render)
    const savedUser = localStorage.getItem('kinoo_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.roles) setUser(parsed);
      } catch (e) {}
    }

    // Then fetch FRESH session from API (authoritative)
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d?.user?.roles) {
          setUser(d.user);
          localStorage.setItem('kinoo_user', JSON.stringify(d.user));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.style.background = darkMode ? '#0f172a' : '#f1f5f9';
    document.body.style.color = darkMode ? '#e2e8f0' : '#1e293b';
    localStorage.setItem('kinoo_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  const roles: string[] = user.roles || ['member'];

  // ADMIN CHECK — any of these roles = sees all tabs
  const adminRoles = ['father', 'moderator', 'secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'patron_matron'];
  const isAdmin = roles.some(r => adminRoles.includes(r));

  const canSeeMinutes = isAdmin || roles.includes('secretary') || roles.includes('moderator');
  const canSeeFrago = isAdmin || roles.includes('organizing_secretary');
  const canSeePairs = isAdmin;

  const allConsoles = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', show: true },
    { href: '/dashboard/check-in', label: 'Check-in', icon: '✅', show: true },
    { href: '/dashboard/pairs', label: 'Pairs', icon: '🤝', show: canSeePairs },
    { href: '/dashboard/father', label: 'Father', icon: '👑', show: isAdmin },
    { href: '/dashboard/moderator', label: 'Moderator', icon: '🛡️', show: isAdmin },
    { href: '/dashboard/secretary', label: 'Secretary', icon: '📋', show: isAdmin },
    { href: '/dashboard/treasurer', label: 'Treasurer', icon: '💰', show: isAdmin },
    { href: '/dashboard/organizing-secretary', label: 'Organising Sec', icon: '🚌', show: isAdmin },
    { href: '/dashboard/vice-secretary', label: 'Vice Secretary', icon: '🧠', show: isAdmin },
    { href: '/dashboard/liturgist', label: 'Liturgist', icon: '✝️', show: isAdmin },
    { href: '/dashboard/vice-moderator', label: 'Vice Moderator', icon: '⚖️', show: isAdmin },
    { href: '/dashboard/patron-matron', label: 'Patron/Matron', icon: '👵', show: isAdmin },
    { href: '/dashboard/frago', label: 'FRAGO', icon: '🎯', show: canSeeFrago },
    { href: '/minutes.html', label: 'Minutes', icon: '📝', show: canSeeMinutes, external: true },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', show: isAdmin || roles.includes('father') || roles.includes('moderator') },
  ];

  const visibleConsoles = allConsoles.filter((c: any) => c.show);
  const internalConsoles = visibleConsoles.filter((c: any) => !c.external);
  const currentIndex = internalConsoles.findIndex((c: any) => pathname === c.href);
  const goBack = () => { if (currentIndex > 0) router.push(internalConsoles[currentIndex - 1].href); };
  const goForward = () => { if (currentIndex >= 0 && currentIndex < internalConsoles.length - 1) router.push(internalConsoles[currentIndex + 1].href); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: darkMode ? '#0f172a' : '#f1f5f9' }}>
      <aside className="sidebar" style={{ width: sidebarOpen ? '230px' : '60px', background: bgColor, color: textColor, padding: '15px', transition: 'width 0.3s', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          {sidebarOpen && <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Kinoo YSC</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textColor }}>{sidebarOpen ? '◀' : '▶'}</button>
        </div>
        {sidebarOpen && <p style={{ opacity: '0.7', fontSize: '13px', marginBottom: '5px' }}>{user.name || 'User'}</p>}
        {sidebarOpen && <p style={{ opacity: '0.5', fontSize: '11px', marginBottom: '20px' }}>{roles.join(', ')}</p>}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          {visibleConsoles.map((item: any) => (
            item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="sidebar-link" style={{ color: textColor, background: 'transparent', cursor: 'pointer' }}>
                <span>{item.icon}</span>{sidebarOpen && <span>{item.label} ↗</span>}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="sidebar-link" style={{ color: pathname === item.href ? '#fff' : textColor, background: pathname === item.href ? '#3b82f6' : 'transparent' }}>
                <span>{item.icon}</span>{sidebarOpen && <span>{item.label}</span>}
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
