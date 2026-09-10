"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function FRAGOPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [fragos, setFragos] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quarterlyReport, setQuarterlyReport] = useState<any>(null);
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());
  const [signatureModal, setSignatureModal] = useState<{ role: string } | null>(null);

  function getCurrentQuarter() {
    const now = new Date();
    return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
  }

  const [form, setForm] = useState({
    eventId: "", opName: "", situation: "", missionStmt: "",
    assemblyTime: "", departTime: "", arriveTime: "", redeployTime: "", returnTime: "",
    busCompany: "", busPhone: "", busDetails: "",
    oicContact: "", ncoic1Contact: "", ncoic2Contact: "", medicContact: "", comms: "",
    budget: [] as any[], attendees: [] as any[], checklist: [] as any[],
    strengths: "", weaknesses: "", recommendations: "", incidents: "",
    verdict: "", noShows: "", lateArrivals: "", reconciliation: [] as any[],
    signatures: {} as any
  });

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetchAll();
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '8px', fontSize: '13px' };
  const labelStyle = { fontSize: '12px', opacity: '0.7', display: 'block', marginBottom: '3px' };

  const fetchAll = async () => {
    try {
      const [fRes, eRes, mRes] = await Promise.all([fetch("/api/frago"), fetch("/api/events"), fetch("/api/users")]);
      const fData = await fRes.json();
      const eData = await eRes.json();
      const mData = await mRes.json();
      if (Array.isArray(fData)) setFragos(fData);
      if (Array.isArray(eData)) setEvents(eData);
      if (Array.isArray(mData)) setMembers(mData.filter((u: any) => u.status === 'active'));
    } catch (e) {}
  };

  const fetchQuarterlyReport = async () => {
    const res = await fetch(`/api/frago-quarterly?quarter=${selectedQuarter}`);
    const data = await res.json();
    if (res.ok) setQuarterlyReport(data);
    else toast.error(data.error || "Failed");
  };

  const addBudgetLine = () => setForm({ ...form, budget: [...form.budget, { name: "", amount: "" }] });
  const removeBudgetLine = (i: number) => setForm({ ...form, budget: form.budget.filter((_, idx) => idx !== i) });
  const updateBudgetLine = (i: number, f: string, v: string) => { const nb = [...form.budget]; nb[i][f] = v; setForm({ ...form, budget: nb }); };

  const addAttendee = (mid: string) => {
    const m = members.find((x: any) => x._id === mid);
    if (!m || form.attendees.find((a: any) => a.memberId === mid)) return;
    setForm({ ...form, attendees: [...form.attendees, { memberId: mid, name: m.fullName, role: m.roles?.[0] || 'Member' }] });
  };
  const removeAttendee = (mid: string) => setForm({ ...form, attendees: form.attendees.filter((a: any) => a.memberId !== mid) });

  const addChecklist = () => setForm({ ...form, checklist: [...form.checklist, { text: "", done: false }] });
  const removeChecklist = (i: number) => setForm({ ...form, checklist: form.checklist.filter((_, idx) => idx !== i) });
  const updateChecklist = (i: number, f: string, v: any) => { const nc = [...form.checklist]; nc[i][f] = v; setForm({ ...form, checklist: nc }); };

  const addReconciliation = () => {
    const newRec = form.budget.map((b: any) => {
      const existing = form.reconciliation.find((r: any) => r.name === b.name);
      return existing || { name: b.name, actual: "", note: "" };
    });
    setForm({ ...form, reconciliation: newRec });
    toast.success("Reconciliation rows added from budget");
  };
  const updateReconciliation = (i: number, f: string, v: string) => { const nr = [...form.reconciliation]; nr[i][f] = v; setForm({ ...form, reconciliation: nr }); };

  const saveSignature = (role: string, dataUrl: string) => {
    setForm({ ...form, signatures: { ...form.signatures, [role]: dataUrl } });
    setSignatureModal(null);
    toast.success(`${role} signature saved`);
  };

  const saveFRAGO = async (status: string) => {
    if (!form.opName) { toast.error("Operation name required"); return; }

    const signedCount = ['moderator', 'fic', 'treasurer'].filter(k => form.signatures?.[k]).length;
    if ((status === 'approved' || status === 'completed') && signedCount < 2) {
      toast.error("At least 2 signatures required (Moderator + FIC)");
      return;
    }

    const body: any = { ...form, status };
    if (editingId) body._id = editingId;

    const res = await fetch("/api/frago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`FRAGO ${editingId ? 'updated' : 'saved'}! Members notified.`);
      setEditingId(data.id || editingId);
      setActiveTab("list");
      fetchAll();
    } else toast.error(data.error || "Failed");
  };

  const editFRAGO = (f: any) => {
    setForm({
      eventId: f.eventId || "", opName: f.opName || "", situation: f.situation || "", missionStmt: f.missionStmt || "",
      assemblyTime: f.assemblyTime || "", departTime: f.departTime || "", arriveTime: f.arriveTime || "", redeployTime: f.redeployTime || "", returnTime: f.returnTime || "",
      busCompany: f.busCompany || "", busPhone: f.busPhone || "", busDetails: f.busDetails || "",
      oicContact: f.oicContact || "", ncoic1Contact: f.ncoic1Contact || "", ncoic2Contact: f.ncoic2Contact || "", medicContact: f.medicContact || "", comms: f.comms || "",
      budget: f.budget || [], attendees: f.attendees || [], checklist: f.checklist || [],
      strengths: f.strengths || "", weaknesses: f.weaknesses || "", recommendations: f.recommendations || "", incidents: f.incidents || "",
      verdict: f.verdict || "", noShows: f.noShows || "", lateArrivals: f.lateArrivals || "", reconciliation: f.reconciliation || [],
      signatures: f.signatures || {}
    });
    setEditingId(f._id);
    setActiveTab("edit");
  };

  const deleteFRAGO = async (id: string) => {
    if (!confirm("Delete this FRAGO?")) return;
    await fetch(`/api/frago?id=${id}`, { method: 'DELETE' });
    toast.success("Deleted");
    fetchAll();
  };

  const newFRAGO = () => {
    setForm({
      eventId: "", opName: "", situation: "", missionStmt: "", assemblyTime: "", departTime: "", arriveTime: "", redeployTime: "", returnTime: "",
      busCompany: "", busPhone: "", busDetails: "", oicContact: "", ncoic1Contact: "", ncoic2Contact: "", medicContact: "", comms: "",
      budget: [], attendees: [], checklist: [], strengths: "", weaknesses: "", recommendations: "", incidents: "", verdict: "",
      noShows: "", lateArrivals: "", reconciliation: [], signatures: {}
    });
    setEditingId(null);
    setActiveTab("edit");
  };

  const printFRAGO = (f: any) => {
    const w = window.open('', '_blank');
    if (!w) return;
    const totalBudget = (f.budget || []).reduce((s: number, i: any) => s + (parseFloat(i.amount) || 0), 0);
    const totalActual = (f.reconciliation || []).reduce((s: number, r: any) => s + (parseFloat(r.actual) || 0), 0);
    const sigs = f.signatures || {};
    const html = `
      <html><head><title>FRAGO - ${f.opName}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; color: #000; }
        h1 { text-align: center; border-bottom: 2px solid #1f3a5f; padding-bottom: 10px; }
        h2 { color: #1f3a5f; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .meta { text-align: center; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f0f4f8; }
        .sig-row { display: flex; justify-content: space-between; margin-top: 40px; }
        .sig-item { width: 30%; text-align: center; }
        .sig-item img { max-height: 60px; max-width: 100%; }
        .sig-line { border-top: 1px solid #000; padding-top: 5px; margin-top: 60px; }
      </style></head><body>
      <h1>FRAGO - ${f.opName}</h1>
      <div class="meta">Generated: ${new Date().toLocaleString()}</div>
      <h2>1. Operation</h2><p>${f.opName || 'N/A'}</p>
      <h2>2. Situation</h2><p>${f.situation || 'N/A'}</p>
      <h2>3. Mission</h2><p>${f.missionStmt || 'N/A'}</p>
      <h2>4. Timings</h2>
      <table><tr><th>Event</th><th>Time</th></tr>
        <tr><td>Assembly</td><td>${f.assemblyTime || '--'}</td></tr>
        <tr><td>Departure</td><td>${f.departTime || '--'}</td></tr>
        <tr><td>Arrival</td><td>${f.arriveTime || '--'}</td></tr>
        <tr><td>Redeploy</td><td>${f.redeployTime || '--'}</td></tr>
        <tr><td>Return</td><td>${f.returnTime || '--'}</td></tr>
      </table>
      <h2>5. Bus Contact</h2><p>${f.busCompany || '--'} / ${f.busPhone || '--'} / ${f.busDetails || '--'}</p>
      <h2>6. Budget (Total: KES ${totalBudget.toLocaleString()})</h2>
      <table><tr><th>Item</th><th>Amount</th></tr>
        ${(f.budget || []).map((i: any) => `<tr><td>${i.name}</td><td>KES ${parseFloat(i.amount || 0).toLocaleString()}</td></tr>`).join('')}
      </table>
      <h2>7. Attendees (${(f.attendees || []).length})</h2>
      <table><tr><th>#</th><th>Name</th><th>Role</th></tr>
        ${(f.attendees || []).map((a: any, i: number) => `<tr><td>${i + 1}</td><td>${a.name}</td><td>${a.role}</td></tr>`).join('')}
      </table>
      <h2>8. Checklist</h2>
      <ul>${(f.checklist || []).map((c: any) => `<li>${c.done ? '✓' : '☐'} ${c.text}</li>`).join('')}</ul>
      <h2>9. Command & Signal</h2>
      <p>OIC: ${f.oicContact || '--'}<br>NCOIC 1: ${f.ncoic1Contact || '--'}<br>NCOIC 2: ${f.ncoic2Contact || '--'}<br>Medic: ${f.medicContact || '--'}<br>Comms: ${f.comms || '--'}</p>
      <h2>10. Post-Event Analysis</h2>
      <p>No-Shows: ${f.noShows || '0'}<br>Late Arrivals: ${f.lateArrivals || '0'}<br>Total Budget: KES ${totalBudget.toLocaleString()}<br>Total Actual: KES ${totalActual.toLocaleString()}<br>Variance: KES ${(totalBudget - totalActual).toLocaleString()}</p>
      ${f.strengths ? `<h2>What Worked</h2><p>${f.strengths}</p>` : ''}
      ${f.weaknesses ? `<h2>What Didn't Work</h2><p>${f.weaknesses}</p>` : ''}
      ${f.recommendations ? `<h2>Recommendations</h2><p>${f.recommendations}</p>` : ''}
      ${f.incidents ? `<h2>Incidents</h2><p>${f.incidents}</p>` : ''}
      ${f.verdict ? `<h2>Verdict</h2><p>${f.verdict}</p>` : ''}
      <h2>Signatures</h2>
      <div class="sig-row">
        <div class="sig-item">${sigs.moderator ? `<img src="${sigs.moderator}" />` : ''}<div class="sig-line">Moderator</div></div>
        <div class="sig-item">${sigs.fic ? `<img src="${sigs.fic}" />` : ''}<div class="sig-line">Father In-Charge / OIC</div></div>
        <div class="sig-item">${sigs.treasurer ? `<img src="${sigs.treasurer}" />` : ''}<div class="sig-line">Treasurer</div></div>
      </div>
      </body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const printQuarterlyReport = () => {
    if (!quarterlyReport) { toast.error("Generate report first"); return; }
    const w = window.open('', '_blank');
    if (!w) return;
    const r = quarterlyReport;
    const html = `
      <html><head><title>Quarterly Report - ${r.quarter}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
        h1 { text-align: center; color: #1f3a5f; }
        h2 { color: #1f3a5f; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 25px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f0f4f8; }
        .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .stat-box { padding: 15px; background: #f0f4f8; border-radius: 8px; border-left: 4px solid #1f3a5f; }
        .stat-box p:first-child { font-size: 12px; color: #666; margin-bottom: 5px; }
        .stat-box p:last-child { font-size: 22px; font-weight: bold; color: #1f3a5f; margin: 0; }
      </style></head><body>
      <h1>Quarterly FRAGO Report</h1>
      <p style="text-align: center; color: #666;">Quarter: ${r.quarter} | Generated: ${new Date().toLocaleString()}</p>
      <h2>Summary</h2>
      <div class="stat-grid">
        <div class="stat-box"><p>Total Events</p><p>${r.totalEvents}</p></div>
        <div class="stat-box"><p>Total Attendees</p><p>${r.totalAttendees}</p></div>
        <div class="stat-box"><p>Total Budget</p><p>KES ${r.totalBudget.toLocaleString()}</p></div>
        <div class="stat-box"><p>Total Actual</p><p>KES ${r.totalActual.toLocaleString()}</p></div>
        <div class="stat-box"><p>Variance</p><p>KES ${r.totalVariance.toLocaleString()}</p></div>
        <div class="stat-box"><p>Successful</p><p>${r.verdicts.successful}</p></div>
      </div>
      <h2>Event Details</h2>
      <table>
        <tr><th>Operation</th><th>Date</th><th>Attendees</th><th>Budget</th><th>Actual</th><th>Verdict</th></tr>
        ${r.fragos.map((f: any) => `<tr><td>${f.opName}</td><td>${new Date(f.date).toLocaleDateString()}</td><td>${f.attendees}</td><td>KES ${f.budget.toLocaleString()}</td><td>KES ${f.actual.toLocaleString()}</td><td>${f.verdict}</td></tr>`).join('')}
      </table>
      </body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const tabs = [
    { id: 'list', label: '📋 All FRAGOs' },
    { id: 'edit', label: editingId ? '✏️ Edit' : '➕ New' },
    { id: 'quarterly', label: '📊 Quarterly' },
  ];

  return (
    <div style={{ color: textColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px' }}>🎯 FRAGO System</h1>
        <button onClick={newFRAGO} style={{ background: '#ea580c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>➕ New FRAGO</button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#ea580c' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>))}
      </div>

      {activeTab === 'list' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>All FRAGOs ({fragos.length})</h2>
          {fragos.length === 0 ? <p style={{ opacity: '0.7' }}>No FRAGOs yet.</p> : fragos.map((f: any) => {
            const signed = ['moderator', 'fic', 'treasurer'].filter(k => f.signatures?.[k]).length;
            return (
              <div key={f._id} style={{ padding: '15px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '5px' }}>{f.opName}</h3>
                    <p style={{ fontSize: '13px', opacity: '0.7' }}>Created: {new Date(f.createdAt).toLocaleDateString()}</p>
                    <p style={{ fontSize: '13px', opacity: '0.7' }}>Attendees: {f.attendees?.length || 0}</p>
                    <p style={{ fontSize: '13px', opacity: '0.7' }}>Budget: KES {(f.budget || []).reduce((s: number, i: any) => s + (parseFloat(i.amount) || 0), 0).toLocaleString()}</p>
                    <p style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '600' }}>✍️ Signatures: {signed}/3</p>
                    <p style={{ fontSize: '12px', color: f.status === 'approved' ? '#10b981' : f.status === 'completed' ? '#3b82f6' : '#f59e0b', fontWeight: '600' }}>Status: {f.status || 'draft'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button onClick={() => editFRAGO(f)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit</button>
                    <button onClick={() => printFRAGO(f)} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>📄 PDF</button>
                    <button onClick={() => deleteFRAGO(f._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'edit' && (
        <div>
          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>🎯 Basic Info</h2>
            <label style={labelStyle}>Linked Event (optional)</label>
            <select value={form.eventId} onChange={(e) => { const ev = events.find((x: any) => x._id === e.target.value); setForm({ ...form, eventId: e.target.value, opName: ev?.title || form.opName }); }} style={inputStyle}>
              <option value="">— No event —</option>
              {events.map((e: any) => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
            <label style={labelStyle}>Operation Name</label>
            <input value={form.opName} onChange={(e) => setForm({ ...form, opName: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>Situation</label>
            <textarea value={form.situation} onChange={(e) => setForm({ ...form, situation: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} />
            <label style={labelStyle}>Mission Statement</label>
            <textarea value={form.missionStmt} onChange={(e) => setForm({ ...form, missionStmt: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} />
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>⏱️ Timings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
              <div><label style={labelStyle}>Assembly</label><input type="time" value={form.assemblyTime} onChange={(e) => setForm({ ...form, assemblyTime: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Departure</label><input type="time" value={form.departTime} onChange={(e) => setForm({ ...form, departTime: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Arrival</label><input type="time" value={form.arriveTime} onChange={(e) => setForm({ ...form, arriveTime: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Redeploy</label><input type="time" value={form.redeployTime} onChange={(e) => setForm({ ...form, redeployTime: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Return</label><input type="time" value={form.returnTime} onChange={(e) => setForm({ ...form, returnTime: e.target.value })} style={inputStyle} /></div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>🚌 Bus Contact</h2>
            <input placeholder="Company" value={form.busCompany} onChange={(e) => setForm({ ...form, busCompany: e.target.value })} style={inputStyle} />
            <input placeholder="Phone" value={form.busPhone} onChange={(e) => setForm({ ...form, busPhone: e.target.value })} style={inputStyle} />
            <input placeholder="Vehicle details" value={form.busDetails} onChange={(e) => setForm({ ...form, busDetails: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>💰 Budget</h2>
            {form.budget.map((b: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input placeholder="Item" value={b.name} onChange={(e) => updateBudgetLine(i, 'name', e.target.value)} style={{ ...inputStyle, flex: 2, marginBottom: 0 }} />
                <input type="number" placeholder="Amount" value={b.amount} onChange={(e) => updateBudgetLine(i, 'amount', e.target.value)} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                <button onClick={() => removeBudgetLine(i)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0 12px', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button onClick={addBudgetLine} style={{ background: darkMode ? '#334155' : '#e5e7eb', color: textColor, border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}>+ Add Item</button>
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>👥 Attendees ({form.attendees.length})</h2>
            <select onChange={(e) => { if (e.target.value) { addAttendee(e.target.value); e.target.value = ''; } }} style={inputStyle}>
              <option value="">+ Add member...</option>
              {members.filter((m: any) => !form.attendees.find((a: any) => a.memberId === m._id)).map((m: any) => (
                <option key={m._id} value={m._id}>{m.fullName}</option>
              ))}
            </select>
            <input placeholder="Or type a manual name..." onKeyDown={(e) => { if (e.key === 'Enter') { const val = (e.target as HTMLInputElement).value; if (val.trim()) { setForm({ ...form, attendees: [...form.attendees, { memberId: 'manual_' + Date.now(), name: val, role: 'Guest' }] }); (e.target as HTMLInputElement).value = ''; } } }} style={inputStyle} />
            {form.attendees.map((a: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: darkMode ? '#334155' : '#f9fafb', borderRadius: '6px', marginBottom: '5px' }}>
                <span>{i + 1}. {a.name} ({a.role})</span>
                <button onClick={() => removeAttendee(a.memberId)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>✅ Checklist</h2>
            {form.checklist.map((c: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <input type="checkbox" checked={c.done} onChange={(e) => updateChecklist(i, 'done', e.target.checked)} />
                <input placeholder="Task" value={c.text} onChange={(e) => updateChecklist(i, 'text', e.target.value)} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                <button onClick={() => removeChecklist(i)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button onClick={addChecklist} style={{ background: darkMode ? '#334155' : '#e5e7eb', color: textColor, border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}>+ Add Task</button>
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>📞 Command & Signal</h2>
            <label style={labelStyle}>OIC</label><input value={form.oicContact} onChange={(e) => setForm({ ...form, oicContact: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>NCOIC 1</label><input value={form.ncoic1Contact} onChange={(e) => setForm({ ...form, ncoic1Contact: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>NCOIC 2</label><input value={form.ncoic2Contact} onChange={(e) => setForm({ ...form, ncoic2Contact: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>Medic</label><input value={form.medicContact} onChange={(e) => setForm({ ...form, medicContact: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>Comms</label><input value={form.comms} onChange={(e) => setForm({ ...form, comms: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>📝 Post-Event Analysis</h2>
            <label style={labelStyle}>No-Shows</label><input value={form.noShows} onChange={(e) => setForm({ ...form, noShows: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>Late Arrivals</label><input value={form.lateArrivals} onChange={(e) => setForm({ ...form, lateArrivals: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>What Worked</label>
            <textarea value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} />
            <label style={labelStyle}>What Didn't Work</label>
            <textarea value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} />
            <label style={labelStyle}>Recommendations</label>
            <textarea value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} />
            <label style={labelStyle}>Incidents</label>
            <textarea value={form.incidents} onChange={(e) => setForm({ ...form, incidents: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} />
            <label style={labelStyle}>Verdict</label>
            <select value={form.verdict} onChange={(e) => setForm({ ...form, verdict: e.target.value })} style={inputStyle}>
              <option value="">— Select —</option>
              <option value="Successful">✅ Successful</option>
              <option value="Mixed">⚠️ Mixed</option>
              <option value="Needs Improvement">❌ Needs Improvement</option>
            </select>
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>✍️ Signatures ({['moderator', 'fic', 'treasurer'].filter(k => form.signatures?.[k]).length}/3)</h2>
            <p style={{ fontSize: '12px', opacity: '0.7', marginBottom: '15px' }}>At least 2 required (Moderator + FIC) to approve</p>
            {['moderator', 'fic', 'treasurer'].map(role => (
              <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '8px' }}>
                <div>
                  <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>{role === 'fic' ? 'Father In-Charge' : role}</p>
                  {form.signatures?.[role] && <img src={form.signatures[role]} style={{ maxHeight: '40px', marginTop: '5px' }} />}
                </div>
                <button onClick={() => setSignatureModal({ role })} style={{ background: form.signatures?.[role] ? '#10b981' : '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
                  {form.signatures?.[role] ? '✓ Signed' : 'Sign'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ ...cardStyle, marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '15px' }}>💰 Budget Reconciliation</h2>
            <button onClick={addReconciliation} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px', fontSize: '13px' }}>Generate from Budget</button>
            {form.reconciliation.map((r: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input value={r.name} readOnly style={{ ...inputStyle, flex: 2, marginBottom: 0 }} />
                <input placeholder="Actual" value={r.actual} onChange={(e) => updateReconciliation(i, 'actual', e.target.value)} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                <input placeholder="Note" value={r.note} onChange={(e) => updateReconciliation(i, 'note', e.target.value)} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button onClick={() => saveFRAGO('draft')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Save Draft</button>
            <button onClick={() => saveFRAGO('approved')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✅ Approve</button>
            <button onClick={() => saveFRAGO('completed')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>🏁 Complete</button>
          </div>
        </div>
      )}

      {activeTab === 'quarterly' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>📊 Quarterly Reports</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)} placeholder="2026-Q1" style={{ ...inputStyle, maxWidth: '200px', marginBottom: 0 }} />
            <button onClick={fetchQuarterlyReport} style={{ background: '#ea580c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Generate</button>
            {quarterlyReport && <button onClick={printQuarterlyReport} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>📄 Print PDF</button>}
          </div>

          {quarterlyReport && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '15px', background: darkMode ? '#334155' : '#eff6ff', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', opacity: '0.7' }}>Total Events</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{quarterlyReport.totalEvents}</p>
                </div>
                <div style={{ padding: '15px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', opacity: '0.7' }}>Total Attendees</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{quarterlyReport.totalAttendees}</p>
                </div>
                <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fff7ed', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', opacity: '0.7' }}>Budget</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>KES {quarterlyReport.totalBudget.toLocaleString()}</p>
                </div>
                <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fef2f2', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', opacity: '0.7' }}>Actual</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>KES {quarterlyReport.totalActual.toLocaleString()}</p>
                </div>
              </div>
              <h3 style={{ marginBottom: '10px' }}>Events</h3>
              {quarterlyReport.fragos.map((f: any) => (
                <div key={f.id} style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '6px', marginBottom: '8px' }}>
                  <p style={{ fontWeight: '600' }}>{f.opName}</p>
                  <p style={{ fontSize: '12px', opacity: '0.7' }}>{new Date(f.date).toLocaleDateString()} | {f.attendees} attendees | {f.verdict}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {signatureModal && (
        <SignaturePad
          role={signatureModal.role}
          onSave={(data) => saveSignature(signatureModal.role, data)}
          onCancel={() => setSignatureModal(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

function SignaturePad({ role, onSave, onCancel, darkMode }: any) {
  const canvasRef = useState<HTMLCanvasElement | null>(null);
  let canvasEl: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let drawing = false;

  const initCanvas = (el: HTMLCanvasElement | null) => {
    if (!el) return;
    canvasEl = el;
    el.width = 400;
    el.height = 200;
    ctx = el.getContext('2d');
    if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, el.width, el.height); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; }
  };

  const start = (e: any) => {
    if (!canvasEl || !ctx) return;
    drawing = true;
    const rect = canvasEl.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!drawing || !canvasEl || !ctx) return;
    e.preventDefault();
    const rect = canvasEl.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stop = () => { drawing = false; };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '12px', maxWidth: '440px', width: '100%' }}>
        <h3 style={{ marginBottom: '15px', textTransform: 'capitalize' }}>Sign as {role === 'fic' ? 'Father In-Charge' : role}</h3>
        <canvas
          ref={initCanvas}
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
          style={{ border: '1px solid #ddd', borderRadius: '8px', width: '100%', touchAction: 'none', background: 'white' }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' }}>
          <button onClick={() => { if (ctx && canvasEl) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvasEl.width, canvasEl.height); } }} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Clear</button>
          <button onClick={() => { if (canvasEl) onSave(canvasEl.toDataURL('image/png')); }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', flex: 1 }}>Save</button>
          <button onClick={onCancel} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}