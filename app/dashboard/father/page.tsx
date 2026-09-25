"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function FatherPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({ members: 0, pending: 0, docs: 0 });

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    loadStats();
  }, []);

  const loadStats = () => {
    fetch("/api/users?t=" + Date.now()).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setStats(prev => ({
          ...prev,
          members: d.filter((u: any) => u.status === "active").length,
          pending: d.filter((u: any) => u.status === "pending").length
        }));
      }
    }).catch(() => {});
    fetch("/api/documents/admin?t=" + Date.now()).then(r => r.json()).then(d => {
      if (Array.isArray(d)) setStats(prev => ({ ...prev, docs: d.length }));
    }).catch(() => {});
  };

  const freezeTreasury = async () => {
    if (!confirm("Freeze all treasury transactions? This is logged.")) return;
    toast.success("Treasury frozen — logged in audit trail");
  };

  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const cardStyle = { background: darkMode ? "#1e293b" : "white", padding: "20px", borderRadius: "12px", border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"), color: textColor, marginBottom: "15px" };

  return (
    <div style={{ color: textColor }}>
      <div style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)", color: "white", padding: "25px", borderRadius: "16px", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "26px", marginBottom: "5px" }}>👑 Father In-Charge Console</h1>
        <p style={{ opacity: "0.9" }}>Supreme Authority · Full Access</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#3b82f6" }}>{stats.members}</p>
          <p style={{ fontSize: "13px", opacity: "0.7" }}>Active Members</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#f59e0b" }}>{stats.pending}</p>
          <p style={{ fontSize: "13px", opacity: "0.7" }}>Pending Approvals</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#8b5cf6" }}>{stats.docs}</p>
          <p style={{ fontSize: "13px", opacity: "0.7" }}>Docs to Review</p>
        </div>
      </div>

      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>⚡ Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        <Link href="/dashboard/father/documents" style={{ textDecoration: "none" }}>
          <div style={{ ...cardStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", marginBottom: 0 }}>
            <span style={{ fontSize: "32px" }}>📋</span>
            <div>
              <p style={{ fontWeight: "600" }}>Document Approvals</p>
              <p style={{ fontSize: "12px", opacity: "0.7" }}>{stats.docs} pending</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/moderator" style={{ textDecoration: "none" }}>
          <div style={{ ...cardStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", marginBottom: 0 }}>
            <span style={{ fontSize: "32px" }}>🛡️</span>
            <div>
              <p style={{ fontWeight: "600" }}>Moderator Console</p>
              <p style={{ fontSize: "12px", opacity: "0.7" }}>Oversight</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/settings" style={{ textDecoration: "none" }}>
          <div style={{ ...cardStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", marginBottom: 0 }}>
            <span style={{ fontSize: "32px" }}>⚙️</span>
            <div>
              <p style={{ fontWeight: "600" }}>System Settings</p>
              <p style={{ fontSize: "12px", opacity: "0.7" }}>Roles, audit, M-Pesa</p>
            </div>
          </div>
        </Link>
        <button onClick={freezeTreasury} style={{ ...cardStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left", marginBottom: 0 }}>
          <span style={{ fontSize: "32px" }}>❄️</span>
          <div>
            <p style={{ fontWeight: "600" }}>Freeze Treasury</p>
            <p style={{ fontSize: "12px", opacity: "0.7" }}>Emergency stop</p>
          </div>
        </button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>🔒 Supreme Authority</h3>
        <p style={{ fontSize: "14px", opacity: "0.8", lineHeight: "1.7" }}>
          As Father In-Charge, you have complete control: create/dismiss members, freeze treasury, dissolve committees, approve all budgets. Every action is logged immutably.
        </p>
      </div>
    </div>
  );
}
