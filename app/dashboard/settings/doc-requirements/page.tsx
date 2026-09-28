"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Mode = "required" | "optional" | "hidden";
type Req = { key: string; label: string; icon: string; mode: Mode };

export default function DocRequirementsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    fetch("/api/doc-requirements", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.requirements)) setReqs(d.requirements); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const card = { background: darkMode ? "#1e293b" : "white", padding: "16px", borderRadius: "12px", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, color: text, marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" as const };

  const setMode = (key: string, mode: Mode) => {
    setReqs(prev => prev.map(r => r.key === key ? { ...r, mode } : r));
    setMsg("");
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/doc-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: reqs })
      });
      if (res.ok) setMsg("✅ Saved");
      else setMsg("❌ Save failed");
    } catch {
      setMsg("❌ Network error");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const modeColor = (m: Mode) => m === "required" ? "#10b981" : m === "optional" ? "#f59e0b" : "#64748b";

  return (
    <div style={{ color: text, paddingBottom: "80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>📋 Required Documents</h1>
          <p style={{ fontSize: "13px", opacity: 0.7 }}>Choose what new members must submit when registering.</p>
        </div>
        <Link href="/dashboard/settings" style={{ fontSize: "13px", color: "#3b82f6", textDecoration: "none" }}>← Settings</Link>
      </div>

      {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}

      {!loading && reqs.map(r => (
        <div key={r.key} style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "180px" }}>
            <span style={{ fontSize: "22px" }}>{r.icon}</span>
            <div>
              <p style={{ fontWeight: 600 }}>{r.label}</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>Currently: <span style={{ color: modeColor(r.mode), fontWeight: 600 }}>{r.mode}</span></p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["required", "optional", "hidden"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(r.key, m)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: r.mode === m ? modeColor(m) : (darkMode ? "#334155" : "#e2e8f0"),
                  color: r.mode === m ? "white" : text
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!loading && (
        <div style={{ position: "fixed", bottom: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px", background: darkMode ? "#1e293b" : "white", padding: "12px 16px", borderRadius: "12px", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
            {msg && <span style={{ fontSize: "13px" }}>{msg}</span>}
            <button onClick={save} disabled={saving} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
