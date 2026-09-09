"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!session?.user) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  const roles = session.user.roles || [];
  const name = session.user.name || "User";

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Welcome, {name}!</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Select a console:</p>
      <div style={{ display: 'grid', gap: '10px' }}>
        {roles.map((role: string) => (
          <Link key={role} href={`/dashboard/${role}`} style={{ textDecoration: 'none' }}>
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
              {role.replace(/_/g, ' ')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}