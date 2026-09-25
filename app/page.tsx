"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [stats, setStats] = useState({ members: 0, events: 0, balance: 0 });
  const [harambee, setHarambee] = useState({ totalPledged: 0, totalPaid: 0, target: 600000 });
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.origin + "/register" : "";
    setRegistrationUrl(url);
    setQrUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + encodeURIComponent(url));
    const saved = localStorage.getItem("kinoo_user");
    if (saved) { try { const u = JSON.parse(saved); if (u?.roles) setIsLoggedIn(true); } catch (e) {} }
    fetch("/api/users?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(prev => ({ ...prev, members: d.filter((u: any) => u.status === "active").length })); }).catch(() => {});
    fetch("/api/events?t=" + Date.now()).then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(prev => ({ ...prev, events: d.length })); }).catch(() => {});
    fetch("/api/transactions?t=" + Date.now()).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const income = d.filter((t: any) => t.type !== "expense" && t.verified).reduce((s: number, t: any) => s + (t.amount || 0), 0);
        const expenses = d.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + (t.amount || 0), 0);
        setStats(prev => ({ ...prev, balance: income - expenses }));
      }
    }).catch(() => {});
    fetch("/api/harambee").then(r => r.json()).then(d => { if (d?.target) setHarambee(d); }).catch(() => {});
  }, []);

  const percent = Math.min(100, Math.round((harambee.totalPaid / harambee.target) * 100));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", color: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px 30px" }}>
        {isLoggedIn ? (
          <Link href="/dashboard" style={{ background: "white", color: "#1a1a2e", padding: "10px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>Go to Dashboard →</Link>
        ) : (
          <Link href="/login" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "10px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", fontSize: "14px", border: "1px solid rgba(255,255,255,0.3)" }}>Sign In →</Link>
        )}
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px 30px" }}>
        <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
          <div style={{ width: "100px", height: "100px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ fontSize: "48px", fontWeight: "bold", color: "#1a1a2e" }}>F</span>
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "10px" }}>Forge Youth</h1>
          <p style={{ fontSize: "18px", opacity: "0.8", marginBottom: "5px" }}>Uthiru · Kagondo · Kinoo</p>
          <p style={{ fontSize: "14px", opacity: "0.6" }}>Archdiocese of Nairobi Youth</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.1)", padding: "25px", borderRadius: "16px", marginBottom: "30px", textAlign: "center" }}>
          <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px", lineHeight: "1.4" }}>"From inactivity to super active"</p>
          <p style={{ fontSize: "14px", opacity: "0.8", lineHeight: "1.6" }}>Building a legacy of Discipline, Enterprise, Identity, and Financial Independence</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "15px", marginBottom: "30px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "36px", fontWeight: "bold", color: "#3b82f6" }}>{stats.members}</p>
            <p style={{ fontSize: "13px", opacity: "0.8" }}>Registered</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "36px", fontWeight: "bold", color: "#f59e0b" }}>{stats.events}</p>
            <p style={{ fontSize: "13px", opacity: "0.8" }}>Events</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "36px", fontWeight: "bold", color: "#10b981" }}>KES {stats.balance.toLocaleString()}</p>
            <p style={{ fontSize: "13px", opacity: "0.8" }}>Reserve</p>
          </div>
        </div>

        <div style={{ background: "white", color: "#1a1a2e", padding: "30px", borderRadius: "16px", marginBottom: "30px", textAlign: "center" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "10px" }}>Join Forge Youth</h2>
          <p style={{ fontSize: "14px", opacity: "0.7", marginBottom: "20px" }}>Scan with your phone camera to register</p>
          {qrUrl && <img src={qrUrl} alt="QR" style={{ width: "220px", height: "220px", margin: "0 auto 20px", display: "block", borderRadius: "12px" }} />}
          <p style={{ fontSize: "12px", opacity: "0.5", wordBreak: "break-all", marginBottom: "20px" }}>{registrationUrl}</p>
          <Link href="/register" style={{ display: "inline-block", background: "#3b82f6", color: "white", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", fontSize: "16px" }}>Register Now →</Link>
        </div>

        <div style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", padding: "25px", borderRadius: "16px", marginBottom: "30px", textAlign: "center" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>🎯 Operation Bamba</h3>
          <p style={{ fontSize: "14px", opacity: "0.9", marginBottom: "5px" }}>Target: KES 600,000 by 27 June 2027</p>
          <p style={{ fontSize: "13px", opacity: "0.85", marginBottom: "15px" }}>{harambee.totalPaid.toLocaleString()} raised · {harambee.totalPledged.toLocaleString()} pledged</p>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "20px", height: "24px", overflow: "hidden", marginBottom: "10px", position: "relative" }}>
            <div style={{ width: percent + "%", height: "100%", background: "white", transition: "width 0.5s" }}></div>
            <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#1a1a2e", fontWeight: "bold", fontSize: "13px" }}>{percent}%</span>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "20px 0", opacity: "0.7", fontSize: "13px" }}>
          <p>© 2026 Forge Youth Uthiru-Kagondo-Kinoo</p>
          <p style={{ marginTop: "5px" }}>Victory through Discipline</p>
        </div>
      </div>
    </div>
  );
}
