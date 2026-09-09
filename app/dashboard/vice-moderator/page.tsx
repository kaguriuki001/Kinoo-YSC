"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ViceModeratorPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [subcommittees, setSubcommittees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", chairId: "", secretaryId: "", memberIds: [] as string[] });

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setMembers(d.filter((u: any) => u.status === 'active')); });
    fetch("/api/subcommittee").then(r => r.json()).then(d => { if (Array.isArray(d)) setSubcommittees(d); }).catch(() => {});
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px' };

  const createSubcommittee = async () => {
    if (!form.name || !form.chairId || !form.secretaryId) { toast.error("Fill name, chair, and secretary"); return; }
    const res = await fetch("/api/subcommittee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Subcommittee created!");
      setShowForm(false);
      setForm({ name: "", chairId: "", secretaryId: "", memberIds: [] });
      fetch("/api/subcommittee").then(r => r.json()).then(d => { if (Array.isArray(d)) setSubcommittees(d); }).catch(() => {});
    } else {
      toast.error(data.error || "Failed");
    }
  };

  const toggleMember = (id: string) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id) ? prev.memberIds.filter(x => x !== id) : [...prev.memberIds, id]
    }));
  };

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>⚖️ Vice Moderator Console</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          {showForm ? '✕ Close' : '+ Create Subcommittee'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '15px' }}>New Subcommittee</h2>
          <input placeholder="Committee Name (e.g., Risk & Audit)" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} style={inputStyle} />
          
          <label style={{ fontSize: '13px', opacity: '0.7' }}>Chair</label>
          <select value={form.chairId} onChange={(e) => setForm({...form, chairId: e.target.value})} style={inputStyle}>
            <option value="">Select Chair</option>
            {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
          </select>

          <label style={{ fontSize: '13px', opacity: '0.7' }}>Secretary</label>
          <select value={form.secretaryId} onChange={(e) => setForm({...form, secretaryId: e.target.value})} style={inputStyle}>
            <option value="">Select Secretary</option>
            {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
          </select>

          <label style={{ fontSize: '13px', opacity: '0.7' }}>Members</label>
          <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
            {members.map((m: any) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
                <input type="checkbox" checked={form.memberIds.includes(m._id)} onChange={() => toggleMember(m._id)} />
                <span>{m.fullName}</span>
              </div>
            ))}
          </div>

          <button onClick={createSubcommittee} style={{ background: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Create Subcommittee
          </button>
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>Existing Subcommittees ({subcommittees.length})</h2>
        {subcommittees.length === 0 ? <p style={{ opacity: '0.7' }}>No subcommittees yet.</p> : subcommittees.map((s: any) => (
          <div key={s._id} style={{ padding: '15px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '10px' }}>
            <h3 style={{ fontWeight: '600' }}>{s.name}</h3>
            <p style={{ fontSize: '13px', opacity: '0.7' }}>Chair: {s.chairUserId?.fullName || 'N/A'}</p>
            <p style={{ fontSize: '13px', opacity: '0.7' }}>Secretary: {s.secretaryUserId?.fullName || 'N/A'}</p>
            <p style={{ fontSize: '13px', opacity: '0.7' }}>Members: {s.members?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}