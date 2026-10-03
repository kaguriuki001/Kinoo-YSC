"use client";
import { useEffect, useState } from "react";

type CouncilMember = { role: string; name: string; outstation: string };
type Hierarchy = {
  diocese: string;
  deanery: string;
  parish: string;
  outstations: string[];
  council: CouncilMember[];
};

type Counts = { [outstation: string]: number };

const COUNCIL_ROLES = ["Father", "Moderator", "Secretary", "Treasurer", "Organising Secretary", "Vice Moderator", "Vice Secretary", "Liturgist"];

export default function ScopePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newOutstation, setNewOutstation] = useState("");
  const [draft, setDraft] = useState<CouncilMember>({ role: "Moderator", name: "", outstation: "" });

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    Promise.all([
      fetch("/api/scope", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/users?t=" + Date.now()).then(r => r.json()).catch(() => [])
    ])
      .then(([s, u]) => {
        if (s?.hierarchy) {
          setHierarchy({ ...s.hierarchy, council: s.hierarchy.council || [] });
        }
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
    if (!confirm("Remove " + name + "?")) return;
    setHierarchy({ ...hierarchy, outstations: hierarchy.outstations.filter(o => o !== name) });
  };

  const addCouncil = () => {
    if (!hierarchy) return;
    if (!draft.name.trim()) return alert("Enter a name");
    setHierarchy({ ...hierarchy, council: [...hierarchy.council, { ...draft, name: draft.name.trim() }] });
    setDraft({ role: "Moderator", name: "", outstation: "" });
  };

  const removeCouncil = (i: number) => {
    if (!hierarchy) return;
    setHierarchy({ ...hierarchy, council: hierarchy.council.filter((_, idx) => idx !== i) });
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
        <h2 style={{ marginBottom: "4px", fontSize: "16px" }}>🏛️ Parish Church Council</h2>
        <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "15px" }}>
          {hierarchy.parish} · elected leaders serving the whole parish
        </p>

        {hierarchy.council.length === 0 && (
          <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "15px" }}>No council members added yet.</p>
        )}

        {hierarchy.council.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${border}`, gap: "10px", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontWeight: 600 }}>{m.role}</p>
              <p style={{ fontSize: "13px" }}>{m.name}</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>from {m.outstation || "—"}</p>
            </div>
            <button onClick={() => removeCouncil(i)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Remove</button>
          </div>
        ))}

        <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: `1px solid ${border}` }}>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Add council member</p>
          <label style={{ fontSize: "12px", opacity: 0.7 }}>Role</label>
          <select value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })} style={{ ...input, marginBottom: "10px" }}>
            {COUNCIL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <label style={{ fontSize: "12px", opacity: 0.7 }}>Name</label>
          <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g., Kaguru Kariuki" style={{ ...input, marginBottom: "10px" }} />
          <label style={{ fontSize: "12px", opacity: 0.7 }}>Home outstation</label>
          <select value={draft.outstation} onChange={e => setDraft({ ...draft, outstation: e.target.value })} style={{ ...input, marginBottom: "12px" }}>
            <option value="">— Select —</option>
            {hierarchy.outstations.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <button onClick={addCouncil} style={{ background: "#3b82f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>+ Add to Council</button>
        </div>
      </div>

      <div style={{ background: card, padding: "20px", borderRadius: "12px", border: `1px solid ${border}`, marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "15px", fontSize: "16px" }}>Parish Overview</h2>
        <p style={{ fontSize: "14px", marginBottom: "8px" }}>
          <strong>{hierarchy.parish}</strong> · {totalMembers} active members · {hierarchy.outstations.length} outstations · {hierarchy.council.length} council members
        </p>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          {hierarchy.deanery} · {hierarchy.diocese}
        </p>
      </div>

      <div style={{ position: "fixed", bottom: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px", background: card, padding: "12px 16px", borderRadius: "12px", border: `1px solid ${border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
          {msg && <span style={{ fontSize: "13px" }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
