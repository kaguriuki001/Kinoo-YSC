"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function TreasurerPage() {
  const [activeTab, setActiveTab] = useState("ledger");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    fetch("/api/transactions", { credentials: "include" }).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setTransactions(d);
        const total = d.filter((t: any) => t.verified).reduce((s: number, t: any) => s + t.amount, 0);
        setBalance(total);
      }
    });
    fetch("/api/financial-summary").then(r => r.json()).then(setFinancialSummary).catch(() => {});
  }, []);

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const cardStyle = { background: bgColor, padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor };

  const tabs = [
    { id: 'ledger', label: '📒 Ledger' },
    { id: 'summary', label: '📊 Summary' },
    { id: 'reports', label: '📈 Reports' },
  ];

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>💰 Treasurer Console</h1>

      <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '25px', borderRadius: '16px', color: 'white', marginBottom: '20px' }}>
        <p style={{ opacity: '0.9', fontSize: '14px' }}>Current Balance</p>
        <p style={{ fontSize: '36px', fontWeight: 'bold' }}>KES {balance.toLocaleString()}</p>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === t.id ? '#16a34a' : darkMode ? '#334155' : '#e5e7eb', color: activeTab === t.id ? 'white' : textColor, fontSize: '14px' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'ledger' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Transaction Ledger ({transactions.length})</h2>
          {transactions.length === 0 ? <p style={{ opacity: '0.7' }}>No transactions yet.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Purpose</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}`, fontSize: '13px' }}>Status</th>
              </tr></thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t._id}>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>{t.purpose}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}`, fontWeight: '600' }}>KES {t.amount}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${borderColor}` }}>
                      <span style={{ color: t.verified ? '#10b981' : '#f59e0b' }}>{t.verified ? '✓ Verified' : 'Pending'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'summary' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Financial Summary</h2>
          {financialSummary ? (
            <div>
              <p>Total Income: <strong>KES {financialSummary.totalIncome?.toLocaleString()}</strong></p>
              <p>Verified Transactions: {financialSummary.verifiedTransactions}</p>
              <p>Total Transactions: {financialSummary.totalTransactions}</p>
              <h3 style={{ marginTop: '15px', marginBottom: '10px' }}>By Purpose</h3>
              {Object.entries(financialSummary.byPurpose || {}).map(([key, value]: any) => (
                <p key={key}>{key}: KES {value?.toLocaleString()}</p>
              ))}
            </div>
          ) : <p style={{ opacity: '0.7' }}>Loading summary...</p>}
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '15px' }}>Generate Reports</h2>
          <button onClick={() => toast.success("Report generated!")} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Download Monthly Report</button>
        </div>
      )}
    </div>
  );
}