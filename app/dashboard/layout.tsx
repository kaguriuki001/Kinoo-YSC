"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (!data?.user) router.push("/");
        else setSession(data);
      });
  }, []);

  if (!session?.user) return <div style={{ padding: '20px' }}>Loading...</div>;

  const roles = session.user.roles || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <aside style={{ width: '250px', background: '#1a1a2e', color: 'white', padding: '20px', minHeight: '100vh' }}>
        <h2 style={{ marginBottom: '20px' }}>Kinoo YSC</h2>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>{session.user.name}</p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {roles.map((role: string) => (
            <Link key={role} href={`/dashboard/${role}`} style={{ padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '5px', background: '#16213e' }}>
              {role.replace(/_/g, ' ')}
            </Link>
          ))}
        </nav>
        <button onClick={async () => {
          await fetch("/api/auth/signout", { method: "POST" });
          window.location.href = "/";
        }} style={{ width: '100%', padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </aside>
      <main style={{ flex: 1, padding: '20px' }}>{children}</main>
    </div>
  );
}