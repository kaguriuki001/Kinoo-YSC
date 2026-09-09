"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ members: 0, events: 0, transactions: 0, balance: 0 });

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(d => {
      if (d?.user) setUser(d.user);
      else window.location.href = "/";
    });
    fetch("/api/users").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setStats(prev => ({ ...prev, members: d.filter((u: any) => u.status === 'active').length }));
    });
    fetch("/api/transactions").then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const total = d.filter((t: any) => t.verified).reduce((s: number, t: any) => s + t.amount, 0);
        setStats(prev => ({ ...prev, transactions: d.length, balance: total }));
      }
    });
  }, []);

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const roles = user.roles && user.roles.length > 0 ? user.roles : ['member'];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>Welcome, {user.name}</h1>
        <p style={{ opacity: '0.8' }}>Kinoo Youth Sports Club</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1d4ed8' }}>{stats.members}</p>
          <p style={{ color: '#666', fontSize: '13px' }}>Members</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ea580c' }}>{stats.events}</p>
          <p style={{ color: '#666', fontSize: '13px' }}>Events</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{stats.transactions}</p>
          <p style={{ color: '#666', fontSize: '13px' }}>Transactions</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#7c3aed' }}>KES {stats.balance.toLocaleString()}</p>
          <p style={{ color: '#666', fontSize: '13px' }}>Balance</p>
        </div>
      </div>

      {/* Quick Access - Horizontal scroll (swipe right to left) */}
      <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Quick Access</h2>
      <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '5px 0', WebkitOverflowScrolling: 'touch' }}>
        {roles.map((role: string) => (
          <Link key={role} href={`/dashboard/${role}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ background: 'white', padding: '15px 20px', borderRadius: '10px', textAlign: 'center', minWidth: '100px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '24px', marginBottom: '5px' }}>
                {role === 'father' ? '👑' : role === 'moderator' ? '🛡️' : role === 'secretary' ? '📋' : role === 'treasurer' ? '💰' : role === 'organizing_secretary' ? '🚌' : role === 'vice_secretary' ? '🧠' : role === 'liturgist' ? '✝️' : role === 'vice_moderator' ? '⚖️' : role === 'patron_matron' ? '👵' : '👤'}
              </p>
              <p style={{ fontSize: '12px', color: '#333', textTransform: 'capitalize' }}>{role.replace(/_/g, ' ')}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}