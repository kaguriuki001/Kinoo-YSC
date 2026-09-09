"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    
    // Just fetch session - don't rely on localStorage
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d?.user) {
          setUser(d.user);
          localStorage.setItem('kinoo_user', JSON.stringify(d.user));
        } else {
          // No session - redirect to login
          window.location.href = "/";
        }
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, []);

  useEffect(() => {
    document.body.style.background = darkMode ? '#0f172a' : '#f1f5f9';
    document.body.style.color = darkMode ? '#e2e8f0' : '#1e293b';
    localStorage.setItem('kinoo_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (!user) return <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>Loading...</div>;

  const roles = user.roles || ['member'];
  const adminRoles = roles.filter((r: string) => r !== 'member');
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    ...adminRoles.map((role: string) => ({ href: `/dashboard/${role}`, label: role.replace(/_/g, ' '), icon: '📌' })),
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: darkMode ? '#0f172a' : '#f1f5f9' }}>
      <aside style={{ width: sidebarOpen ? '220px' : '60px', background: bgColor, color: textColor, padding: '15px', transition: 'width 0.3s', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          {sidebarOpen && <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Kinoo YSC</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textColor }}>{sidebarOpen ? '◀' : '▶'}</button>
        </div>
        {sidebarOpen && <p style={{ opacity: '0.7', fontSize: '13px', marginBottom: '20px' }}>{user.name || 'User'}</p>}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ padding: '10px 12px', color: pathname === item.href ? '#fff' : textColor, textDecoration: 'none', borderRadius: '8px', background: pathname === item.href ? '#3b82f6' : 'transparent', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{item.icon}</span>{sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div style={{ paddingTop: '20px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ width: '100%', padding: '10px', background: darkMode ? '#334155' : '#e2e8f0', color: textColor, border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '14px' }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={async () => { await fetch("/api/auth/signout", { method: "POST" }); localStorage.removeItem('kinoo_user'); window.location.href = "/"; }} style={{ width: '100%', padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            Sign Out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>{children}</main>
    </div>
  );
}