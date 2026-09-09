"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const ROLE_ICONS: Record<string, string> = {
  father: "👑",
  moderator: "🛡️",
  secretary: "📋",
  treasurer: "💰",
  organizing_secretary: "🚌",
  vice_secretary: "🧠",
  liturgist: "✝️",
  vice_moderator: "⚖️",
  patron_matron: "👵",
  member: "👤",
  settings: "⚙️",
};

const ROLE_COLORS: Record<string, string> = {
  father: "#dc2626",
  moderator: "#0891b2",
  secretary: "#1d4ed8",
  treasurer: "#16a34a",
  organizing_secretary: "#ea580c",
  vice_secretary: "#7c3aed",
  liturgist: "#e11d48",
  vice_moderator: "#d97706",
  patron_matron: "#c026d3",
  member: "#2563eb",
  settings: "#64748b",
};

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

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const roles = user.roles && user.roles.length > 0 ? user.roles : ['member'];
  const allItems = [...roles, 'settings'];

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: '20px', borderRadius: '12px 12px 0 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>Kinoo YSC</h1>
        <p style={{ opacity: '0.8', fontSize: '14px' }}>Welcome, {user.name}</p>
      </div>

      <div style={{ background: 'white', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        {allItems.map((role: string, index: number) => (
          <Link key={role} href={`/dashboard/${role}`} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px',
              borderBottom: index < allItems.length - 1 ? '1px solid #f0f0f0' : 'none',
              cursor: 'pointer',
            }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: ROLE_COLORS[role] || '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {ROLE_ICONS[role] || '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '16px', textTransform: 'capitalize' }}>
                  {role.replace(/_/g, ' ')}
                </p>
                <p style={{ color: '#666', fontSize: '13px' }}>
                  {getRoleDescription(role)}
                </p>
              </div>
              <span style={{ color: '#aaa', fontSize: '20px' }}>›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    father: "Supreme Admin - Full Control",
    moderator: "Group Leader - All Oversight",
    secretary: "Registrations & Minutes",
    treasurer: "Finances & Budgets",
    organizing_secretary: "Events & Logistics",
    vice_secretary: "Strategy & Analytics",
    liturgist: "Spiritual Matters",
    vice_moderator: "Subcommittees",
    patron_matron: "Oversight & Approvals",
    member: "Member Access",
    settings: "App Settings & Management",
  };
  return descriptions[role] || "Console Access";
}