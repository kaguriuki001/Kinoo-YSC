"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => {
        if (data?.user) setUser(data.user);
        else window.location.href = "/";
      });
  }, []);

  if (!user) return <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>;

  const roles = user.roles && user.roles.length > 0 ? user.roles : ['member'];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px' }}>Welcome, {user.name}!</h1>
      <p style={{ color: '#666' }}>Your roles: {roles.join(', ')}</p>
      <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
        {roles.map((role: string) => (
          <Link key={role} href={`/dashboard/${role}`} style={{ textDecoration: 'none' }}>
            <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
              <p style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{role.replace(/_/g, ' ')} Console</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}