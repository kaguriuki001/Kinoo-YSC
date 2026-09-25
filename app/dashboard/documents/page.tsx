"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function DocumentsPage() {
  const [user, setUser] = useState<any>(null);
  const [docs, setDocs] = useState<any>({});
  const [darkMode, setDarkMode] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    const saved = localStorage.getItem("kinoo_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        loadDocs(u.id || u._id);
      } catch (e) {}
    }
  }, []);

  const loadDocs = (uid: string) => {
    fetch("/api/documents?userId=" + uid + "&t=" + Date.now())
      .then(r => r.json())
      .then(d => setDocs(d || {}))
      .catch(() => {});
  };

  const uploadDoc = (docType: string, file: File) => {
    if (file.size > 2000000) { toast.error("File too large (max 2MB)"); return; }
    setUploading(docType);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const uid = user.id || user._id;
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, docType, docData: dataUrl })
      });
      setUploading(null);
      if (res.ok) {
        toast.success("Document uploaded! Waiting for Father approval.");
        loadDocs(uid);
      } else toast.error("Upload failed");
    };
    reader.readAsDataURL(file);
  };

  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const cardStyle = { background: darkMode ? "#1e293b" : "white", padding: "20px", borderRadius: "12px", border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"), color: textColor, marginBottom: "15px" };

  if (!user) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  const docTypes = [
    { key: "nationalId", label: "National ID", icon: "🆔", required: true },
    { key: "baptismCard", label: "Baptism Card", icon: "📜", required: true },
    { key: "photo", label: "Profile Photo", icon: "📸", required: false },
    { key: "kcpe", label: "KCPE Certificate", icon: "🎓", required: false },
    { key: "kcse", label: "KCSE Certificate", icon: "🎓", required: false }
  ];

  return (
    <div style={{ color: textColor, maxWidth: "700px" }}>
      <h1 style={{ fontSize: "26px", marginBottom: "20px" }}>📋 My Documents</h1>
      <div style={{ padding: "15px", background: "#fef3c7", borderRadius: "10px", marginBottom: "20px", color: "#92400e", fontSize: "13px" }}>
        🔒 Documents are only visible to Father, Moderator, and yourself. ID and Baptism Card are required.
      </div>

      {docTypes.map(dt => {
        const status = docs[dt.key + "Status"] || "not uploaded";
        const hasDoc = !!docs[dt.key];
        const statusColor = status === "approved" ? "#10b981" : status === "pending" ? "#f59e0b" : status === "rejected" ? "#ef4444" : "#6b7280";
        return (
          <div key={dt.key} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{dt.icon} {dt.label} {dt.required && <span style={{ color: "#ef4444", fontSize: "12px" }}>*Required</span>}</h3>
                <p style={{ fontSize: "12px", color: statusColor, fontWeight: "600", textTransform: "uppercase" }}>{status}</p>
              </div>
              <div>
                <input type="file" accept="image/*,.pdf" id={"doc-" + dt.key} style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(dt.key, f); }} />
                <label htmlFor={"doc-" + dt.key} style={{ background: hasDoc ? "#10b981" : "#3b82f6", color: "white", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "inline-block" }}>
                  {uploading === dt.key ? "Uploading..." : hasDoc ? "🔄 Replace" : "📤 Upload"}
                </label>
              </div>
            </div>
            {hasDoc && (
              <div style={{ marginTop: "10px" }}>
                <img src={docs[dt.key]} alt={dt.label} style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "8px", border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb") }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
