"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => {
        if (!data?.user) router.push("/");
        else setSession(data);
      });
  }, []);

  if (!session?.user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const roles = session.user.roles || [];
  const isAdmin = roles.includes('father') || roles.includes('moderator');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Sidebar - visible on desktop, hidden on mobile */}
      <aside style={{ width: '200px', background: '#1a1a2e', color: 'white', padding: '15px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Kinoo YSC</h2>
        <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '20px' }}>{session.user.name}</p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          <Link href="/dashboard" style={{ padding: '10px', color: pathname === '/dashboard' ? '#fff' : '#aaa', textDecoration: 'none', borderRadius: '5px', background: pathname === '/dashboard' ? '#16213e' : 'transparent', fontSize: '14px' }}>
            🏠 Home
          </Link>
          {roles.map((role: string) => (
            <Link key={role} href={`/dashboard/${role}`} style={{ padding: '10px', color: pathname.startsWith(`/dashboard/${role}`) ? '#fff' : '#aaa', textDecoration: 'none', borderRadius: '5px', background: pathname.startsWith(`/dashboard/${role}`) ? '#16213e' : 'transparent', fontSize: '14px', textTransform: 'capitalize' }}>
              {role.replace(/_/g, ' ')}
            </Link>
          ))}
        </nav>
        {isAdmin && (
          <button onClick={() => setShowSettings(!showSettings)} style={{ padding: '10px', background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>
            ⚙️ Settings
          </button>
        )}
        <button onClick={async () => { await fetch("/api/auth/signout", { method: "POST" }); window.location.href = "/"; }} style={{ width: '100%', padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', marginTop: '10px', cursor: 'pointer', fontSize: '14px' }}>
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '15px', overflow: 'hidden' }}>
        {children}
      </main>

      {/* Settings panel - slides from left like TikTok */}
      {showSettings && isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', background: 'white', boxShadow: '2px 0 20px rgba(0,0,0,0.2)', zIndex: 1000, padding: '20px', overflowY: 'auto', animation: 'slideIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>⚙️ Settings</h3>
            <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>
          <Link href="/dashboard/settings" onClick={() => setShowSettings(false)} style={{ display: 'block', padding: '12px', color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
            🎨 Appearance
          </Link>
          <Link href="/dashboard/settings" onClick={() => setShowSettings(false)} style={{ display: 'block', padding: '12px', color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
            👥 Role Assignment
          </Link>
          <Link href="/dashboard/settings" onClick={() => setShowSettings(false)} style={{ display: 'block', padding: '12px', color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
            🔒 Security
          </Link>
          <Link href="/dashboard/settings" onClick={() => setShowSettings(false)} style={{ display: 'block', padding: '12px', color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
            📊 Audit Log
          </Link>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}