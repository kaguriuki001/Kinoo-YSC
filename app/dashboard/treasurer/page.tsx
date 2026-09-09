"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function TreasurerPage() {
  const [activeTab, setActiveTab] = useState("ledger");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch("/api/transactions").then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setTransactions(data);
        const total = data.filter((t: any) => t.verified).reduce((sum: number, t: any) => sum + t.amount, 0);
        setBalance(total);
      }
    });
  }, []);

  const tabs = ["ledger", "budgets", "reports"];

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Treasurer Console</h1>
      
      <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', opacity: '0.9' }}>Current Balance</h2>
        <p style={{ fontSize: '36px', fontWeight: 'bold' }}>KES {balance.toLocaleString()}</p>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: activeTab === tab ? '#16a34a' : '#e5e7eb',
            color: activeTab === tab ? 'white' : '#333', textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === "ledger" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Transaction Ledger</h2>
          {transactions.length === 0 ? (
            <p style={{ color: '#666' }}>No transactions yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Purpose</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t._id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>{t.purpose}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontWeight: '600' }}>KES {t.amount}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ color: t.verified ? '#16a34a' : '#f59e0b' }}>{t.verified ? '✓ Verified' : 'Pending'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "budgets" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Event Budgets</h2>
          <p style={{ color: '#666' }}>No budgets created yet.</p>
        </div>
      )}

      {activeTab === "reports" && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '15px' }}>Financial Reports</h2>
          <button onClick={() => toast.success("Report generated!")} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Generate Monthly Report</button>
        </div>
      )}
    </div>
  );
}