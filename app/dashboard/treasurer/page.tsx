"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function TreasurerPage() {
  const [activeTab, setActiveTab] = useState("ledger");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const [txForm, setTxForm] = useState({ amount: "", purpose: "", type: "income", description: "", memberId: "" });
  const [budgetForm, setBudgetForm] = useState({ title: "", items: [{ name: "", estimatedCost: "" }] });

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetchAll();
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, marginBottom: '10px' };

  const fetchAll = async () => {
    try {
      const [txRes, budRes, userRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/budgets"),
        fetch("/api/users")
      ]);
      const txData = await txRes.json();
      const budData = await budRes.json();
      const userData = await userRes.json();
      if (Array.isArray(txData)) setTransactions(txData);
      if (Array.isArray(budData)) setBudgets(budData);
      if (Array.isArray(userData)) setMembers(userData.filter((u: any) => u.status === 'active'));
    } catch (e) {}
  };

  const income = transactions.filter(t => t.type !== 'expense' && t.verified).reduce((s, t) => s + (t.amount || 0), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const balance = income - expenses;
  const verifiedCount = transactions.filter(t => t.verified).length;

  const addTransaction = async () => {
    if (!txForm.amount || !txForm.purpose) { toast.error("Amount and purpose required"); return; }
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...txForm, amount: Number(txForm.amount) })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Transaction added!");
      setTxForm({ amount: "", purpose: "", type: "income", description: "", memberId: "" });
      fetchAll();
    } else toast.error(data.error || "Failed");
  };

  const addBudgetLine = () => setBudgetForm({ ...budgetForm, items: [...budgetForm.items, { name: "", estimatedCost: "" }] });
  const removeBudgetLine = (idx: number) => setBudgetForm({ ...budgetForm, items: budgetForm.items.filter((_, i) => i !== idx) });
  const updateBudgetLine = (idx: number, field: string, value: string) => {
    const newItems = [...budgetForm.items];
    (newItems[idx] as any)[field] = value;
    setBudgetForm({ ...budgetForm, items: newItems });
  };

  const createBudget = async () => {
    if (!budgetForm.title) { toast.error("Title required"); return; }
    const validItems = budgetForm.items.filter(i => i.name && i.estimatedCost);
    if (validItems.length === 0) { toast.error("Add at least one item"); return; }
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: budgetForm.title, items: validItems })
    });
    if (res.ok) {
      toast.success("Budget created!");
      setBudgetForm({ title: "", items: [{ name: "", estimatedCost: "" }] });
      fetchAll();
    } else toast.error("Failed");
  };

  const updateBudgetStatus = async (id: string, status: string) => {
    await fetch("/api/budgets", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    toast.success(`Budget ${status}`);
    fetchAll();
  };

  const tabs = [
    { id: 'ledger', label: '📒 Ledger' },
    { id: 'add', label: '➕ Add Transaction' },
    { id: 'budgets', label: '💰 Budgets' },
    { id: 'reports', label: '📊 Reports' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>💰 Treasurer Console</h1>

      {/* Financial Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '20px', borderRadius: '12px', color: 'white' }}>
          <p style={{ opacity: '0.9', fontSize: '13px' }}>Total Income</p>
          <p style={{ fontSize: '22px', fontWeight: 'bold' }}>KES {income.toLocaleString()}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', padding: '20px', borderRadius: '12px', color: 'white' }}>
          <p style={{ opacity: '0.9', fontSize: '13px' }}>Total Expenses</p>
          <p style={{ fontSize: '22px', fontWeight: 'bold' }}>KES {expenses.toLocaleString()}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '20px', borderRadius: '12px', color: 'white' }}>
          <p style={{ opacity: '0.9', fontSize: '13px' }}>Balance</p>
          <p style={{ fontSize: '22px', fontWeight: 'bold' }}>KES {balance.toLocaleString()}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '20px', borderRadius: '12px', color: 'white' }}>
          <p style={{ opacity: '0.9', fontSize: '13px' }}>Transactions</p>
          <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{transactions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#16a34a' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>
        ))}
      </div>

      {/* Ledger */}
      {activeTab === 'ledger' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Transaction Ledger ({transactions.length})</h2>
          {transactions.length === 0 ? <p style={{ opacity: '0.7' }}>No transactions yet.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Purpose</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Status</th>
              </tr></thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t._id}>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{t.purpose}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                      <span style={{ color: t.type === 'expense' ? '#ef4444' : '#10b981' }}>{t.type === 'expense' ? '💸 Expense' : '💰 Income'}</span>
                    </td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px', fontWeight: '600' }}>KES {t.amount}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                      <span style={{ color: t.verified ? '#10b981' : '#f59e0b' }}>{t.verified ? '✓ Verified' : 'Pending'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Transaction */}
      {activeTab === 'add' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Add Transaction</h2>
          <div style={{ maxWidth: '450px' }}>
            <label style={{ fontSize: '13px', opacity: '0.7' }}>Type</label>
            <select value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value })} style={inputStyle}>
              <option value="income">💰 Income</option>
              <option value="expense">💸 Expense</option>
            </select>
            <label style={{ fontSize: '13px', opacity: '0.7' }}>Amount (KES)</label>
            <input type="number" placeholder="0" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} style={inputStyle} />
            <label style={{ fontSize: '13px', opacity: '0.7' }}>Purpose</label>
            <input placeholder="e.g., Tithe, Event Fee, Transport" value={txForm.purpose} onChange={(e) => setTxForm({ ...txForm, purpose: e.target.value })} style={inputStyle} />
            <label style={{ fontSize: '13px', opacity: '0.7' }}>Description (optional)</label>
            <input placeholder="Additional notes" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} style={inputStyle} />
            <label style={{ fontSize: '13px', opacity: '0.7' }}>Member (optional)</label>
            <select value={txForm.memberId} onChange={(e) => setTxForm({ ...txForm, memberId: e.target.value })} style={inputStyle}>
              <option value="">— None —</option>
              {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
            </select>
            <button onClick={addTransaction} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>💾 Save Transaction</button>
          </div>
        </div>
      )}

      {/* Budgets */}
      {activeTab === 'budgets' && (
        <div>
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '15px' }}>Create Budget</h2>
            <input placeholder="Budget Title (e.g., Youth Retreat 2026)" value={budgetForm.title} onChange={(e) => setBudgetForm({ ...budgetForm, title: e.target.value })} style={inputStyle} />
            <label style={{ fontSize: '13px', opacity: '0.7' }}>Items</label>
            {budgetForm.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input placeholder="Item name" value={item.name} onChange={(e) => updateBudgetLine(idx, 'name', e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
                <input type="number" placeholder="Cost" value={item.estimatedCost} onChange={(e) => updateBudgetLine(idx, 'estimatedCost', e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                {budgetForm.items.length > 1 && (
                  <button onClick={() => removeBudgetLine(idx)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0 12px', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={addBudgetLine} style={{ background: darkMode ? '#334155' : '#e5e7eb', color: textColor, border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>+ Add Line</button>
              <button onClick={createBudget} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Save Budget</button>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginBottom: '15px' }}>All Budgets ({budgets.length})</h2>
            {budgets.length === 0 ? <p style={{ opacity: '0.7' }}>No budgets yet.</p> : budgets.map((b: any) => (
              <div key={b._id} style={{ padding: '15px', border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontWeight: '600' }}>{b.title}</h3>
                    <p style={{ fontSize: '13px', opacity: '0.7' }}>Total: KES {(b.totalAmount || 0).toLocaleString()}</p>
                    <p style={{ fontSize: '12px', opacity: '0.6' }}>
                      Status: <span style={{
                        color: b.status === 'approved' ? '#10b981' : b.status === 'rejected' ? '#ef4444' : '#f59e0b',
                        fontWeight: '600'
                      }}>{b.status || 'draft'}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {b.status !== 'approved' && <button onClick={() => updateBudgetStatus(b._id, 'approved')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✅ Approve</button>}
                    {b.status !== 'rejected' && <button onClick={() => updateBudgetStatus(b._id, 'rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>❌ Reject</button>}
                  </div>
                </div>
                {b.items && b.items.length > 0 && (
                  <ul style={{ marginTop: '10px', marginLeft: '20px', fontSize: '13px', opacity: '0.8' }}>
                    {b.items.map((i: any, idx: number) => (
                      <li key={idx}>{i.name}: KES {(i.estimatedCost || 0).toLocaleString()}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Financial Reports</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '10px' }}>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>Income Sources</p>
              {Object.entries(transactions.filter(t => t.type !== 'expense' && t.verified).reduce((acc: any, t: any) => { acc[t.purpose] = (acc[t.purpose] || 0) + t.amount; return acc; }, {})).map(([k, v]: any) => (
                <p key={k} style={{ fontSize: '14px' }}>{k}: <strong>KES {v.toLocaleString()}</strong></p>
              ))}
              {transactions.filter(t => t.type !== 'expense').length === 0 && <p style={{ fontSize: '13px', opacity: '0.6' }}>No income yet</p>}
            </div>
            <div style={{ padding: '16px', background: darkMode ? '#334155' : '#fef2f2', borderRadius: '10px' }}>
              <p style={{ fontSize: '13px', opacity: '0.7' }}>Expense Categories</p>
              {Object.entries(transactions.filter(t => t.type === 'expense').reduce((acc: any, t: any) => { acc[t.purpose] = (acc[t.purpose] || 0) + t.amount; return acc; }, {})).map(([k, v]: any) => (
                <p key={k} style={{ fontSize: '14px' }}>{k}: <strong>KES {v.toLocaleString()}</strong></p>
              ))}
              {transactions.filter(t => t.type === 'expense').length === 0 && <p style={{ fontSize: '13px', opacity: '0.6' }}>No expenses yet</p>}
            </div>
          </div>
          <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>📄 Print Report</button>
        </div>
      )}
    </div>
  );
}