"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function FatherDocumentsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    loadPending();
  }, []);

  const loadPending = () => {
    setLoading(true);
    fetch("/api/documents/admin?t=" + Date.now())
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPending(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const act = async (userId: string, docType: string, status: string) => {
    const res = await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, docType, status, approvedBy: "father" })
    });
    if (res.ok) {
      toast.success("Document " + status);
      setSelected(null);
      loadPending();
    } else toast.error("Failed");
  };

  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const cardStyle = { background: darkMode ? "#1e293b" : "white", padding: "20px", borderRadius: "12px", border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"), color: textColor, marginBottom: "15px" };

  const docLabels: Record<string, string> = {
    nationalId: "🆔 National ID",
    baptismCard: "📜 Baptism Card",
    photo: "📸 Profile Photo",
    kcpe: "🎓 KCPE Certificate",
    kcse: "🎓 KCSE Certificate"
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ color: textColor, maxWidth: "900px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>📋 Document Approvals</h1>
      <p style={{ opacity: "0.7", marginBottom: "20px" }}>Review member documents and approve or reject them.</p>

      {pending.length === 0 ? (
        <div style={cardStyle}><p style={{ textAlign: "center", opacity: "0.7" }}>✅ No pending documents. All caught up!</p></div>
      ) : pending.map((p: any, i: number) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <p style={{ fontWeight: "600", fontSize: "16px" }}>{p.fullName}</p>
              <p style={{ fontSize: "13px", opacity: "0.7" }}>{p.phone} · {p.outstation}</p>
              <p style={{ fontSize: "13px", marginTop: "5px" }}>{docLabels[p.docType] || p.docType}</p>
            </div>
            <button onClick={() => setSelected(p)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Review</button>
          </div>
        </div>
      ))}

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px", overflowY: "auto" }} onClick={() => setSelected(null)}>
          <div style={{ background: darkMode ? "#1e293b" : "white", padding: "25px", borderRadius: "16px", maxWidth: "700px", width: "100%", color: textColor }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Review Document</h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: textColor }}>✕</button>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <p><strong>Member:</strong> {selected.fullName}</p>
              <p><strong>Phone:</strong> {selected.phone}</p>
              <p><strong>Outstation:</strong> {selected.outstation}</p>
              <p><strong>Document:</strong> {docLabels[selected.docType]}</p>
            </div>
            <div style={{ marginBottom: "20px", textAlign: "center", background: darkMode ? "#0f172a" : "#f8fafc", padding: "15px", borderRadius: "10px" }}>
              <img src={selected.docData} alt={selected.docType} style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => act(selected.userId, selected.docType, "approved")} style={{ flex: 1, background: "#10b981", color: "white", border: "none", padding: "14px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>✅ Approve</button>
              <button onClick={() => act(selected.userId, selected.docType, "rejected")} style={{ flex: 1, background: "#ef4444", color: "white", border: "none", padding: "14px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>❌ Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
