"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MemberPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Tithe");

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMembers(data);
    });
    fetch("/api/events").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setEvents(data);
    });
  }, []);

  const contribute = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), purpose })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("M-Pesa prompt sent to your phone!");
      setAmount("");
    } else {
      toast.error(data.error || "Contribution failed");
    }
  };

  const tabs = ["home", "events", "giving", "members"];

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Member Console</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            background: activeTab === tab ? '#1d4ed8' : '#e5e7eb',
            color: activeTab === tab ? 'white' : '#333',
            textTransform: 'capitalize'
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Home Tab */}
      {activeTab === "home" && (
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2>Welcome to Kinoo YSC</h2>
          <p style={{ color: '#666' }}>Access events, contribute, and view attendance from here.</p>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2>Upcoming Events</h2>
          {events.length === 0 ? (
            <p style={{ color: '#666' }}>No upcoming events.</p>
          ) : (
            events.map((e: any) => (
              <div key={e._id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                <h3>{e.title}</h3>
                <p>Date: {new Date(e.date).toDateString()}</p>
                <p>Venue: {e.venue}</p>
                <p>Ticket Price: KES {e.ticketPrice || 'Free'}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Giving Tab */}
      {activeTab === "giving" && (
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2>Contribute</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
              <option>Tithe</option>
              <option>Offering</option>
              <option>Event Fee</option>
              <option>Welfare</option>
              <option>Other</option>
            </select>
            <input type="number" placeholder="Amount (KES)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
            <button onClick={contribute} style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Send M-Pesa Prompt
            </button>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2>Members List ({members.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.filter((m: any) => m.status === 'active').map((m: any) => (
                <tr key={m._id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{m.fullName}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{m.phone}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    <span style={{ color: m.status === 'active' ? '#16a34a' : '#f59e0b' }}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}