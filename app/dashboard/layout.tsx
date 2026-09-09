"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => {
        if (!data?.user) router.push("/");
        else setSession(data);
      });
    const savedTheme = localStorage.getItem('kinoo_theme');
    if (savedTheme) setDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.style.background = '#0f172a';
      document.body.style.color = '#e2e8f0';
    } else {
      document.body.style.background = '#f1f5f9';
      document.body.style.color = '#1e293b';
    }
    localStorage.setItem('kinoo_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (!session?.user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const roles = session.user.roles || [];
  const adminRoles = roles.filter((r: string) => r !== 'member');
  const isAdmin = adminRoles.length > 0;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    ...adminRoles.map((role: string) => ({
      href: `/dashboard/${role}`,
      label: role.replace(/_/g, ' '),
      icon: getRoleIcon(role),
    })),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: darkMode ? '#0f172a' : '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '220px' : '60px',
        background: darkMode ? '#1e293b' : '#ffffff',
        color: darkMode ? '#e2e8f0' : '#1e293b',
        padding: '15px',
        transition: 'width 0.3s',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        borderRight: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          {sidebarOpen && <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Kinoo YSC</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: darkMode ? '#e2e8f0' : '#1e293b' }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {sidebarOpen && <p style={{ opacity: '0.7', fontSize: '13px', marginBottom: '20px' }}>{session.user.name}</p>}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{
              padding: '10px 12px',
              color: pathname === item.href ? '#fff' : darkMode ? '#e2e8f0' : '#1e293b',
              textDecoration: 'none',
              borderRadius: '8px',
              background: pathname === item.href ? '#3b82f6' : 'transparent',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}>
              <span>{item.icon}</span>
              {sidebarOpen && <span style={{ textTransform: 'capitalize' }}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          {/* Theme Toggle */}
          <button onClick={() => setDarkMode(!darkMode)} style={{
            width: '100%',
            padding: '10px',
            background: darkMode ? '#334155' : '#e2e8f0',
            color: darkMode ? '#e2e8f0' : '#1e293b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '10px',
            fontSize: '14px',
          }}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <button onClick={async () => { await fetch("/api/auth/signout", { method: "POST" }); window.location.href = "/"; }} style={{
            width: '100%',
            padding: '10px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}>
            {sidebarOpen ? 'Sign Out' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}

function getRoleIcon(role: string): string {
  const icons: Record<string, string> = {
    father: '👑',
    moderator: '🛡️',
    secretary: '📋',
    treasurer: '💰',
    organizing_secretary: '🚌',
    vice_secretary: '🧠',
    liturgist: '✝️',
    vice_moderator: '⚖️',
    patron_matron: '👵',
  };
  return icons[role] || '📌';
}