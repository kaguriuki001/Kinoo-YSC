"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type TabKey = "profile" | "documents" | "alerts" | "appearance" | "members" | "requirements" | "audit";

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("profile");
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = (r: string[]) => {
    const kws = ["father","moderator","secretary","treasurer","organizing","vice","liturgist","patron"];
    return kws.some(k => r.join(",").toLowerCase().includes(k));
  };

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    const cached = localStorage.getItem("kinoo_user");
    if (cached) {
      try {
        const u = JSON.parse(cached);
        setUser(u);
        const r = u.roles || ["member"];
        setRoles(r);
        setIsAdmin(checkAdmin(r));
      } catch (e) {}
    }
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d?.user) {
          setUser(d.user);
          localStorage.setItem("kinoo_user", JSON.stringify(d.user));
          const r = d.user.roles || ["member"];
          setRoles(r);
          setIsAdmin(checkAdmin(r));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "members" && isAdmin) {
      fetch("/api/users?t=" + Date.now())
        .then(r => r.json())
        .then(d => { if (Array.isArray(d)) setUsers(d.filter((u: any) => u.status === "active")); })
        .catch(() => {});
    }
  }, [tab, isAdmin]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("kinoo_theme", next ? "dark" : "light");
    document.body.style.background = next ? "#0f172a" : "#f1f5f9";
    document.body.style.color = next ? "#e2e8f0" : "#1e293b";
  };

  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const card = darkMode ? "#1e293b" : "white";
  const border = darkMode ? "#334155" : "#e5e7eb";

  const tabs: { key: TabKey; label: string; icon: string; show: boolean }[] = [
    { key: "profile", label: "Profile", icon: "👤", show: true },
    { key: "documents", label: "Documents", icon: "📋", show: true },
    { key: "alerts", label: "Alerts", icon: "🔔", show: true },
    { key: "appearance", label: "Appearance", icon: "🎨", show: true },
    { key: "members", label: "Members & Roles", icon: "👥", show: isAdmin },
    { key: "requirements", label: "Doc Requirements", icon: "📝", show: isAdmin },
    { key: "audit", label: "Audit Log", icon: "🔍", show: isAdmin },
  ];
  const visibleTabs = tabs.filter(t => t.show);

  const deleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    setUsers(prev => prev.filter(u => u._id !== userId));
    toast.success(`${name} removed`);
    fetch(`/api/delete-user?userId=${userId}`, { method: "DELETE" })
      .then(r => r.json())
      .then(d => { if (!d.message) toast.error("Delete failed on server"); })
      .catch(() => toast.error("Network error"));
  };

  const saveProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: user.fullName, phone: user.phone })
      });
      if (res.ok) toast.success("Profile saved");
      else toast.error("Save failed");
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: text }}>Loading...</div>;

  const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${border}`, background: darkMode ? "#0f172a" : "white", color: text, marginBottom: "12px", boxSizing: "border-box" as const };
  const btn = { background: "#3b82f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 as const };

  return (
    <div style={{ color: text, padding: "10px", paddingBottom: "80px" }}>
      <h1 style={{ fontSize: "26px", marginBottom: "20px" }}>⚙️ Settings</h1>

      <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginBottom: "20px", paddingBottom: "5px" }}>
        {visibleTabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", background: tab === t.key ? "#3b82f6" : (darkMode ? "#334155" : "#e2e8f0"), color: tab === t.key ? "white" : text }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}` }}>
          <h2 style={{ marginBottom: "15px" }}>👤 My Profile</h2>
          <label style={{ fontSize: "13px", opacity: 0.7 }}>Full Name</label>
          <input value={user?.fullName || ""} onChange={e => setUser({ ...user, fullName: e.target.value })} style={inputStyle} />
          <label style={{ fontSize: "13px", opacity: 0.7 }}>Phone</label>
          <input value={user?.phone || ""} onChange={e => setUser({ ...user, phone: e.target.value })} style={inputStyle} />
          <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "15px" }}>Roles: {roles.join(", ")}</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={saveProfile} style={btn}>Save</button>
            <a href="/dashboard/profile" style={{ background: "transparent", color: "#3b82f6", border: `1px solid ${border}`, padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>Full Profile →</a>
          </div>
        </div>
      )}

      {tab === "documents" && (
        <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}` }}>
          <h2 style={{ marginBottom: "15px" }}>📋 My Documents</h2>
          <p style={{ opacity: 0.8, marginBottom: "20px" }}>Upload and manage your ID, baptism card, and other required documents.</p>
          <a href="/dashboard/documents" style={{ display: "inline-block", ...btn, textDecoration: "none" }}>Open Documents →</a>
        </div>
      )}

      {tab === "alerts" && (
        <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}` }}>
          <h2 style={{ marginBottom: "15px" }}>🔔 Alerts</h2>
          <p style={{ opacity: 0.8, marginBottom: "20px" }}>Your notifications and event reminders.</p>
          <a href="/dashboard/notifications" style={{ display: "inline-block", ...btn, textDecoration: "none" }}>Open Alerts →</a>
        </div>
      )}

      {tab === "appearance" && (
        <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}` }}>
          <h2 style={{ marginBottom: "15px" }}>🎨 Appearance</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <div>
              <p style={{ fontWeight: 600 }}>Dark Mode</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>Use dark background and light text</p>
            </div>
            <button onClick={toggleDark} style={{ background: darkMode ? "#3b82f6" : "#e2e8f0", color: darkMode ? "white" : "#1e293b", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
              {darkMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      )}

      {tab === "members" && isAdmin && (
        <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2>👥 Members ({users.length})</h2>
            <button onClick={() => { setUsers([]); fetch("/api/users?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d.filter((u: any) => u.status === "active")); }); }} style={btn}>🔄 Reload</button>
          </div>
          {users.length === 0 ? <p style={{ opacity: 0.7 }}>Loading members...</p> : (
            users.map((u: any) => (
              <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: `1px solid ${border}`, gap: "10px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <p style={{ fontWeight: 600 }}>{u.fullName}</p>
                  <p style={{ fontSize: "13px", opacity: 0.7 }}>{u.phone} · {u.roles?.join(", ")}</p>
                </div>
                <button onClick={() => deleteUser(u._id, u.fullName)} style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>🗑️ Delete</button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "requirements" && isAdmin && (
        <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}` }}>
          <h2 style={{ marginBottom: "15px" }}>📝 Document Requirements</h2>
          <p style={{ opacity: 0.8, marginBottom: "20px" }}>Configure which documents new members must submit.</p>
          <a href="/dashboard/settings/doc-requirements" style={{ display: "inline-block", ...btn, textDecoration: "none" }}>Configure →</a>
        </div>
      )}

      {tab === "audit" && isAdmin && (
        <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}` }}>
          <h2 style={{ marginBottom: "15px" }}>🔍 Audit Log</h2>
          <p style={{ opacity: 0.8, marginBottom: "20px" }}>View recent admin actions and system events.</p>
          <a href="/dashboard/audit-log" style={{ display: "inline-block", ...btn, textDecoration: "none" }}>Open Audit Log →</a>
        </div>
      )}
    </div>
  );
}
