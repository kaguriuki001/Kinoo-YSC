"use client";
export default function TreasurerPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Treasurer Console</h1>
      <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
        <h2>Current Balance</h2>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>KES 0</p>
      </div>
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2>Transactions</h2>
        <p style={{ color: '#666' }}>No transactions yet.</p>
      </div>
    </div>
  );
}