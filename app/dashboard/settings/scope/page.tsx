"use client";
import { useEffect, useState } from "react";

const COUNCIL_ROLES = ["Father","Moderator","Secretary","Treasurer","Organising Secretary","Vice Moderator","Vice Secretary","Liturgist","Patron","Matron"];

export default function ScopePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [h, setH] = useState<any>(null);
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newOut, setNewOut] = useState("");
  const [draft, setDraft] = useState({ role: "Moderator", name: "", outstation: "" });

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    Promise.all([
      fetch("/api/scope", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/users?t=" + Date.now()).then(r => r.json()).catch(() => [])
    ]).then(([s, u]: any[]) => {
      if (s && s.hierarchy) setH(s.hierarchy);
      if (Array.isArray(u)) {
        const c: any = {};
        u.filter((x: any) => x.status === "active").forEach((x: any) => {
          const o = x.outstation || "Unassigned";
          c[o] = (c[o] || 0) + 1;
        });
        setCounts(c);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const card = darkMode ? "#1e293b" : "white";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const input: React.CSSProperties = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid " + border, background: darkMode ? "#0f172a" : "white", color: text, marginBottom: "10px", boxSizing: "border-box" };

  const save = async () => {
    if (!h) return;
    setSaving(true);
    try {
      const res = await fetch("/api/scope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hierarchy: h }) });
      setMsg(res.ok ? "✅ Saved" : "❌ Save failed");
    } catch { setMsg("❌ Network error"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  };

  if (loading || !h) return <div style={{ padding: 40, textAlign: "center", color: text }}>Loading...</div>;

  const totalMembers = Object.values(counts).reduce((s: number, n: any) => s + n, 0) as number;

  return (
    <div style={{ color: text, paddingBottom: "100px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>🗂️ Structure</h1>
      <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "20px" }}>Diocese → Deanery → Parish → Outstations</p>

      <div style={{ background: card, padding: "20px", borderRadius: "12px", border: "1px solid " + border, marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "15px", fontSize: "16px" }}>Hierarchy</h2>
        <label style={{ fontSize: "13px", opacity: 0.7 }}>Diocese</label>
        <input value={h.diocese} onChange={(e) => setH({ ...h, diocese: e.target.value })} style={input} />
        <label style={{ fontSize: "13px", opacity: 0.7 }}>Deanery</label>
        <input value={h.deanery} onChange={(e) => setH({ ...h, deanery: e.target.value })} style={input} />
        <label style={{ fontSize: "13px", opacity: 0.7 }}>Parish</label>
        <input value={h.parish} onChange={(e) => setH({ ...h, parish: e.target.value })} style={input} />
      </div>

      <div style={{ background: card, padding: "20px", borderRadius: "12px", border: "1px solid " + border, marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "15px", fontSize: "16px" }}>Outstations ({h.outstations.length})</h2>
        {h.outstations.map((o: string) => (
          <div key={o} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + border }}>
            <div>
              <p style={{ fontWeight: 600 }}>{o}</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>{counts[o] || 0} active member{counts[o] === 1 ? "" : "s"}</p>
            </div>
            <button onClick={() => { if (confirm("Remove " + o + "?")) setH({ ...h, outstations: h.outstations.filter((x: string) => x !== o) }); }} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Remove</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: "8px", marginTop: "15px" }}>
          <input value={newOut} onChange={(e) => setNewOut(e.target.value)} placeholder="New outstation" style={{ ...input, marginBottom: 0, flex: 1 }} />
          <button onClick={() => { const v = newOut.trim(); if (!v || h.outstations.includes(v)) return; setH({ ...h, outstations: [...h.outstations, v] }); setNewOut(""); }} style={{ background: "#3b82f6", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Add</button>
        </div>
      </div>

      <div style={{ background: card, padding: "20px", borderRadius: "12px", border: "1px solid " + border, marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "4px", fontSize: "16px" }}>🏛️ Parish Church Council</h2>
        <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "15px" }}>{h.parish} · elected leaders serving the whole parish</p>

        {(h.council || []).length === 0 && <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "15px" }}>No council members added yet.</p>}

        {(h.council || []).map((m: any, i: number) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + border, gap: "10px", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontWeight: 600 }}>{m.role}</p>
              <p style={{ fontSize: "13px" }}>{m.name}</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>from {m.outstation || "—"}</p>
            </div>
            <button onClick={() => setH({ ...h, council: h.council.filter((_: any, x: number) => x !== i) })} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Remove</button>
          </div>
        ))}

        <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid " + border }}>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Add council member</p>
          <label style={{ fontSize: "12px", opacity: 0.7 }}>Role</label>
          <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} style={input}>
            {COUNCIL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <label style={{ fontSize: "12px", opacity: 0.7 }}>Name</label>
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" style={input} />
          <label style={{ fontSize: "12px", opacity: 0.7 }}>Home outstation</label>
          <select value={draft.outstation} onChange={(e) => setDraft({ ...draft, outstation: e.target.value })} style={input}>
            <option value="">— Select —</option>
            {h.outstations.map((o: string) => <option key={o} value={o}>{o}</option>)}
          </select>
          <button onClick={() => { if (!draft.name.trim()) return alert("Enter a name"); setH({ ...h, council: [...(h.council || []), { ...draft, name: draft.name.trim() }] }); setDraft({ role: "Moderator", name: "", outstation: "" }); }} style={{ background: "#3b82f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>+ Add to Council</button>
        </div>
      </div>

      <div style={{ background: card, padding: "20px", borderRadius: "12px", border: "1px solid " + border }}>
        <h2 style={{ marginBottom: "15px", fontSize: "16px" }}>Parish Overview</h2>
        <p style={{ fontSize: "14px", marginBottom: "8px" }}><strong>{h.parish}</strong> · {totalMembers} active members · {h.outstations.length} outstations · {(h.council || []).length} council members</p>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>{h.deanery} · {h.diocese}</p>
      </div>

      <div style={{ position: "fixed", bottom: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px", background: card, padding: "12px 16px", borderRadius: "12px", border: "1px solid " + border, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
          {msg && <span style={{ fontSize: "13px" }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
