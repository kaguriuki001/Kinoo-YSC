"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function PairsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [pairs, setPairs] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [pairName, setPairName] = useState("");

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    loadUsers();
    loadPairs();
  }, []);

  const loadUsers = () => {
    fetch("/api/users?t=" + Date.now())
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setUsers(d.filter((u: any) => u.status === 'active' && !u.pairId)); })
      .catch(() => {});
  };

  const loadPairs = () => {
    fetch("/api/pairs?t=" + Date.now())
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPairs(d); })
      .catch(() => {});
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) { toast.error("A pair has exactly 2 members"); return prev; }
      return [...prev, id];
    });
  };

  const createPair = async () => {
    if (selected.length !== 2) { toast.error("Select exactly 2 members"); return; }
    const name = pairName.trim() || `Jozi ${pairs.length + 1}`;
    const res = await fetch("/api/pairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, memberIds: selected })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Pair created!");
      setSelected([]);
      setPairName("");
      loadUsers();
      loadPairs();
    } else toast.error(data.error || "Failed");
  };

  const deletePair = async (pairId: string) => {
    if (!confirm("Break this pair?")) return;
    const res = await fetch(`/api/pairs?id=${pairId}`, { method: 'DELETE' });
    if (res.ok) { toast.success("Pair deleted"); loadUsers(); loadPairs(); }
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const cardStyle = { background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, color: textColor };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px' };

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🤝 Pair Formation (Jozi)</h1>

      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '15px' }}>Create a New Pair</h2>
        <input placeholder="Pair name (e.g., Jozi Uthiru 1)" value={pairName} onChange={(e) => setPairName(e.target.value)} style={inputStyle} />
        <p style={{ fontSize: '13px', opacity: '0.7', marginBottom: '10px' }}>Selected: {selected.length} / 2</p>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
          {users.length === 0 ? <p style={{ opacity: '0.7' }}>All members are already paired.</p> : users.map((u: any) => (
            <div key={u._id} onClick={() => toggleSelect(u._id)} style={{ padding: '10px', cursor: 'pointer', borderRadius: '6px', background: selected.includes(u._id) ? '#3b82f6' : 'transparent', color: selected.includes(u._id) ? 'white' : textColor, marginBottom: '5px' }}>
              <p style={{ fontWeight: '600' }}>{u.fullName}</p>
              <p style={{ fontSize: '12px', opacity: '0.7' }}>{u.phone} — {u.outstation || 'No outstation'}</p>
            </div>
          ))}
        </div>
        <button onClick={createPair} disabled={selected.length !== 2} style={{ background: selected.length === 2 ? '#10b981' : '#64748b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: selected.length === 2 ? 'pointer' : 'not-allowed', fontWeight: '600' }}>
          🤝 Create Pair
        </button>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>Existing Pairs ({pairs.length})</h2>
        {pairs.length === 0 ? <p style={{ opacity: '0.7' }}>No pairs yet.</p> : pairs.map((p: any) => (
          <div key={p._id} style={{ padding: '15px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontWeight: '600' }}>{p.name}</p>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>{p.members?.map((m: any) => m.fullName).join(' + ')}</p>
              <p style={{ fontSize: '12px', opacity: '0.6' }}>Outstation: {p.outstation || 'Mixed'}</p>
            </div>
            <button onClick={() => deletePair(p._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Break Pair</button>
          </div>
        ))}
      </div>
    </div>
  );
}
