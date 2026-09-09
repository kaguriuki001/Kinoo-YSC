"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ViceModeratorPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [subcommittees, setSubcommittees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", chairId: "", secretaryId: "", memberIds: [] as string[] });

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setMembers(d.filter((u: any) => u.status === 'active')); });
    fetch("/api/subcommittee").then(r => r.json()).then(d => { if (Array.isArray(d)) setSubcommittees(d); }).catch(() => {});
  }, []);

  const createSubcommittee = async () => {
    if (!form.name || !form.chairId || !form.secretaryId) { toast.error("Fill all fields"); return; }
    const res = await fetch("/api/subcommittee", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      toast.success("Subcommittee created!");
      setShowForm(false);
      setForm({ name: "", chairId: "", secretaryId: "", memberIds: [] });
      fetch("/api/subcommittee").then(r => r.json()).then(d => { if (Array.isArray(d)) setSubcommittees(d); }).catch(() => {});
    } else {
      toast.error("Failed");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>⚖️ Vice Moderator Console</h1>
      <button onClick={() => setShowForm(!showForm)} style={{ background: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginBottom: '20px' }}>
        {showForm ? '✕ Close' : '+ Create Subcommittee'}
      </button>

      {showForm && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <input placeholder="Committee Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }} />
          <select value={form.chairId} onChange={(e) => setForm({...form, chairId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}>
            <option value="">Select Chair</option>
            {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
          </select>
          <select value={form.secretaryId} onChange={(e) => setForm({...form, secretaryId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}>
            <option value="">Select Secretary</option>
            {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
          </select>
          <button onClick={createSubcommittee} style={{ background: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Create</button>
        </div>
      )}

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
        <h2 style={{ marginBottom: '15px' }}>Subcommittees ({subcommittees.length})</h2>
        {subcommittees.length === 0 ? <p style={{ opacity: '0.7' }}>No subcommittees.</p> : subcommittees.map((s: any) => (
          <div key={s._id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
            <h3 style={{ fontWeight: '600' }}>{s.name}</h3>
            <p style={{ fontSize: '13px', opacity: '0.7' }}>Members: {s.members?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}