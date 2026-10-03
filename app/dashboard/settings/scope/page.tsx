"use client";
import { useEffect, useState } from "react";

type Hierarchy = {
  diocese: string;
  deanery: string;
  parish: string;
  outstations: string[];
};

type Counts = { [outstation: string]: number };

export default function ScopePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newOutstation, setNewOutstation] = useState("");

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    Promise.all([
      fetch("/api/scope", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/users?t=" + Date.now()).then(r => r.json()).catch(() => [])
    ])
      .then(([s, u]) => {
        if (s?.hierarchy) setHierarchy(s.hierarchy);
        if (Array.isArray(u)) {
          const c: Counts = {};
          u.filter((x: any) => x.status === "active").forEach((x: any) => {
            const o = x.outstation || "Unassigned";
            c[o] = (c[o] || 0) + 1;
          });
          setCounts(c);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const card = darkMode ? "#1e293b" : "white";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const input = { width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${border}`, background: darkMode ? "#0f172a" : "white", color: text, marginBottom: "12px", boxSizing: "border-box" as const };

  const save = async () => {
    if (!hierarchy) return;
    setSaving(true);
    try {
      const res = await fetch("/api/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hierarchy })
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

  const addOutstation = () => {
    const v = newOutstation.trim();
    if (!v || !hierarchy) return;
    if (hierarchy.outstations.includes(v)) return;
    setHierarchy({ ...hierarchy, outstations: [...hierarchy.outstations, v] });
    setNewOutstation("");
  };

  const removeOutstation = (name: string) => {
    if (!hierarchy) return;
    if (!confirm("Remove " + name + "? Members already assigned keep the label.")) return;
    setHierarchy({ ...hierarchy, outstations: hierarchy.outstations.filter(o => o !== name) });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: text }}>Loading...</div>;
  if (!hierarchy) return <div style={{ padding: 40, textAlign: "center", color: text }}>No hierarchy data</div>;

  const totalMembers = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div style={{ color: text, padding: "10px", paddingBottom: "100px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>🗂️ Structure</h1>
      <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "20px" }}>
        Diocese → Deanery → Parish → Outstations
      </p>

      <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}`, marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "15px", fontSize: "16px" }}>Hierarchy</h2>
        <label style={{ fontSize: "13px", opacity: 0.7 }}>Diocese</label>
        <input value={hierarchy.diocese} onChange={e => setHierarchy({ ...hierarchy, diocese: e.target.value })} style={input} />
        <label style={{ fontSize: "13px", opacity: 0.7 }}>Deanery</label>
        <input value={hierarchy.deanery} onChange={e => setHierarchy({ ...hierarchy, deanery: e.target.value })} style={input} />
        <label style={{ fontSize: "13px", opacity: 0.7 }}>Parish</label>
        <input value={hierarchy.parish} onChange={e => setHierarchy({ ...hierarchy, parish: e.target.value })} style={input} />
      </div>

      <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}`, marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "15px", fontSize: "16px" }}>Outstations ({hierarchy.outstations.length})</h2>
        {hierarchy.outstations.map(o => (
          <div key={o} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${border}` }}>
            <div>
              <p style={{ fontWeight: 600 }}>{o}</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>{counts[o] || 0} active member{counts[o] === 1 ? "" : "s"}</p>
            </div>
            <button onClick={() => removeOutstation(o)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Remove</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: "8px", marginTop: "15px" }}>
          <input value={newOutstation} onChange={e => setNewOutstation(e.target.value)} placeholder="New outstation name" style={{ ...input, marginBottom: 0, flex: 1 }} />
          <button onClick={addOutstation} style={{ background: "#3b82f6", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Add</button>
        </div>
      </div>

      <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}`, marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "15px", fontSize: "16px" }}>Parish Overview</h2>
        <p style={{ fontSize: "14px", marginBottom: "8px" }}>
          <strong>{hierarchy.parish}</strong> · {totalMembers} active members
        </p>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          {hierarchy.deanery} · {hierarchy.diocese}
        </p>
      </div>

      <div style={{ position: "fixed", bottom: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px", background: card, padding: "12px 16px", borderRadius: "12px", border: `1px solid ${border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
          {msg && <span style={{ fontSize: "13px" }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save Hierarchy"}
          </button>
        </div>
      </div>
    </div>
  );
}
