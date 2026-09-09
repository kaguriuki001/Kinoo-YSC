"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>({ name: 'User', roles: ['moderator', 'father', 'secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'patron_matron', 'member'] });
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
  }, []);

  useEffect(() => {
    document.body.style.background = darkMode ? '#0f172a' : '#f1f5f9';
    document.body.style.color = darkMode ? '#e2e8f0' : '#1e293b';
    localStorage.setItem('kinoo_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  const roles = user.roles || ['member'];
  const isAdmin = roles.includes('father') || roles.includes('moderator');

  const allConsoles = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', alwaysShow: true },
    { href: '/dashboard/father', label: 'Father', icon: '👑', role: 'father' },
    { href: '/dashboard/moderator', label: 'Moderator', icon: '🛡️', role: 'moderator' },
    { href: '/dashboard/secretary', label: 'Secretary', icon: '📋', role: 'secretary' },
    { href: '/dashboard/treasurer', label: 'Treasurer', icon: '💰', role: 'treasurer' },
    { href: '/dashboard/organizing-secretary', label: 'Organising Sec', icon: '🚌', role: 'organizing_secretary' },
    { href: '/dashboard/vice-secretary', label: 'Vice Secretary', icon: '🧠', role: 'vice_secretary' },
    { href: '/dashboard/liturgist', label: 'Liturgist', icon: '✝️', role: 'liturgist' },
    { href: '/dashboard/vice-moderator', label: 'Vice Moderator', icon: '⚖️', role: 'vice_moderator' },
    { href: '/dashboard/patron-matron', label: 'Patron/Matron', icon: '👵', role: 'patron_matron' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', role: 'settings' },
  ];

  const visibleConsoles = allConsoles.filter(c => 
    c.alwaysShow || isAdmin || (c.role && roles.includes(c.role))
  );

  const currentIndex = visibleConsoles.findIndex(c => pathname === c.href);
  const goBack = () => { if (currentIndex > 0) router.push(visibleConsoles[currentIndex - 1].href); };
  const goForward = () => { if (currentIndex >= 0 && currentIndex < visibleConsoles.length - 1) router.push(visibleConsoles[currentIndex + 1].href); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: darkMode ? '#0f172a' : '#f1f5f9' }}>
      <aside className="sidebar" style={{
        width: sidebarOpen ? '230px' : '60px', background: bgColor, color: textColor,
        padding: '15px', transition: 'width 0.3s', position: 'sticky', top: 0,
        height: '100vh', overflowY: 'auto', borderRight: `1px solid ${borderColor}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          {sidebarOpen && <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Kinoo YSC</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textColor }}>{sidebarOpen ? '◀' : '▶'}</button>
        </div>
        {sidebarOpen && <p style={{ opacity: '0.7', fontSize: '13px', marginBottom: '20px' }}>{user.name || 'User'}</p>}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          {visibleConsoles.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link" style={{
              color: pathname === item.href ? '#fff' : textColor,
              background: pathname === item.href ? '#3b82f6' : 'transparent',
            }}>
              <span>{item.icon}</span>{sidebarOpen && <span>{item.label}</span>}
            </Link>
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
          <button onClick={goForward} disabled={currentIndex >= visibleConsoles.length - 1} style={{ padding: '10px 20px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, cursor: currentIndex >= visibleConsoles.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex >= visibleConsoles.length - 1 ? 0.4 : 1, fontSize: '16px' }}>Forward →</button>
          <span style={{ fontSize: '13px', opacity: '0.6', marginLeft: '10px' }}>{currentIndex + 1} / {visibleConsoles.length}</span>
        </div>
        {children}
      </main>
    </div>
  );
}