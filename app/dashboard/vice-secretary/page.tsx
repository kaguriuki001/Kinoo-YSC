"use client";
import { useState, useEffect } from "react";

export default function ViceSecretaryPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({ members: 0, events: 0, balance: 0, pairs: 0 });

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    loadStats();
    setMessages([
      { role: "assistant", title: "👋 Hello!", lines: ["I am your AI Strategist.", "Ask me anything about members, finances, events, attendance, or strategies."] }
    ]);
  }, []);

  const loadStats = () => {
    fetch("/api/users?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(prev => ({ ...prev, members: d.filter((u: any) => u.status === "active").length })); }).catch(() => {});
    fetch("/api/events?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(prev => ({ ...prev, events: d.length })); }).catch(() => {});
    fetch("/api/transactions?t=" + Date.now()).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const income = d.filter((t: any) => t.type !== "expense" && t.verified).reduce((s: number, t: any) => s + (t.amount || 0), 0);
        const expenses = d.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + (t.amount || 0), 0);
        setStats(prev => ({ ...prev, balance: income - expenses }));
      }
    }).catch(() => {});
    fetch("/api/pairs?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(prev => ({ ...prev, pairs: d.length })); }).catch(() => {});
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", lines: [input] }]);
    const question = input;
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question })
      });
      const data = await res.json();
      if (data.lines) {
        setMessages(prev => [...prev, { role: "assistant", title: data.title, lines: data.lines }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", lines: [data.answer || data.error || "No response"] }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", lines: ["Error connecting to AI."] }]);
    } finally { setLoading(false); }
  };

  const quickAsk = (q: string) => { setInput(q); };

  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const cardStyle = { background: darkMode ? "#1e293b" : "white", padding: "20px", borderRadius: "12px", border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"), color: textColor, marginBottom: "15px" };

  return (
    <div style={{ color: textColor }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>🧠 Vice Secretary — AI Strategist</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Members", value: stats.members, color: "#3b82f6", icon: "👥" },
          { label: "Events", value: stats.events, color: "#f59e0b", icon: "📅" },
          { label: "Pairs", value: stats.pairs, color: "#8b5cf6", icon: "🤝" },
          { label: "Balance", value: "KES " + stats.balance.toLocaleString(), color: "#10b981", icon: "💰" }
        ].map(c => (
          <div key={c.label} style={{ ...cardStyle, marginBottom: 0, textAlign: "center", padding: "15px" }}>
            <p style={{ fontSize: "24px", marginBottom: "3px" }}>{c.icon}</p>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: c.color }}>{c.value}</p>
            <p style={{ fontSize: "12px", opacity: "0.7" }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{ height: "400px", overflowY: "auto", marginBottom: "15px", padding: "15px", background: darkMode ? "#0f172a" : "#f8fafc", borderRadius: "10px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: "12px" }}>
              <div style={{
                maxWidth: "85%",
                background: m.role === "user" ? "#3b82f6" : (darkMode ? "#1e293b" : "white"),
                color: m.role === "user" ? "white" : textColor,
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                lineHeight: "1.7",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}>
                {m.title && <p style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "15px" }}>{m.title}</p>}
                {m.lines && m.lines.map((line: string, j: number) => (
                  <p key={j} style={{ margin: "4px 0" }}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {loading && <div style={{ textAlign: "center", opacity: "0.6", fontSize: "13px" }}>Thinking...</div>}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          {["How many members?", "Financial status?", "Upcoming events?", "Suggest strategy"].map(q => (
            <button key={q} onClick={() => quickAsk(q)} style={{ background: darkMode ? "#334155" : "#e5e7eb", color: textColor, border: "none", padding: "8px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px" }}>{q}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder="Ask anything..." style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"), background: darkMode ? "#334155" : "white", color: textColor, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          <button onClick={sendMessage} disabled={loading} style={{ background: "#8b5cf6", color: "white", border: "none", padding: "0 20px", borderRadius: "24px", cursor: "pointer", fontWeight: "600", opacity: loading ? 0.6 : 1 }}>Send</button>
        </div>
      </div>
    </div>
  );
}
