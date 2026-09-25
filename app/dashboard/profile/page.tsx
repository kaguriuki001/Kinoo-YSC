"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    const saved = localStorage.getItem("kinoo_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        loadProfile(u.id || u._id);
      } catch (e) {}
    }
  }, []);

  const loadProfile = (uid: string) => {
    fetch("/api/profile?userId=" + uid + "&t=" + Date.now())
      .then(r => r.json())
      .then(d => { setProfile(d); setBio(d.bio || ""); })
      .catch(() => {});
  };

  const uploadImage = (field: string, file: File) => {
    if (file.size > 2000000) { toast.error("Image too large (max 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const uid = user.id || user._id;
      const body: any = { userId: uid };
      body[field] = dataUrl;
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success(field === "photo" ? "Profile photo updated" : "Cover photo updated");
        loadProfile(uid);
      } else toast.error("Upload failed");
    };
    reader.readAsDataURL(file);
  };

  const saveBio = async () => {
    const uid = user.id || user._id;
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, bio })
    });
    if (res.ok) {
      toast.success("Bio updated");
      setEditMode(false);
      loadProfile(uid);
    }
  };

  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const cardStyle = { background: darkMode ? "#1e293b" : "white", padding: "20px", borderRadius: "12px", border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"), color: textColor, marginBottom: "15px" };

  if (!profile) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  const initials = (profile.fullName || "?").split(" ").map((n: string) => n.charAt(0)).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ color: textColor, maxWidth: "700px", margin: "0 auto" }}>
      <div style={cardStyle}>
        <div style={{ position: "relative", height: "140px", borderRadius: "12px 12px 0 0", background: profile.coverPhoto ? "url(" + profile.coverPhoto + ") center/cover" : "linear-gradient(135deg, #1a1a2e, #16213e)", marginBottom: "60px" }}>
          <input type="file" accept="image/*" id="cover-upload" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage("coverPhoto", f); }} />
          <label htmlFor="cover-upload" style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.5)", color: "white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>📸 Change Cover</label>
          <div style={{ position: "absolute", bottom: "-50px", left: "20px", width: "100px", height: "100px", borderRadius: "50%", border: "4px solid " + (darkMode ? "#1e293b" : "white"), background: profile.photo ? "url(" + profile.photo + ") center/cover" : "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "32px", fontWeight: "bold" }}>
            {!profile.photo && initials}
            <input type="file" accept="image/*" id="photo-upload" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage("photo", f); }} />
            <label htmlFor="photo-upload" style={{ position: "absolute", bottom: 0, right: 0, background: "#3b82f6", color: "white", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px", border: "2px solid " + (darkMode ? "#1e293b" : "white") }}>📷</label>
          </div>
        </div>
        <div style={{ marginTop: "15px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "5px" }}>{profile.fullName}</h1>
          <p style={{ fontSize: "14px", opacity: "0.7", marginBottom: "5px" }}>📱 {profile.phone}</p>
          <p style={{ fontSize: "14px", opacity: "0.7", marginBottom: "10px" }}>📍 {profile.outstation || "No outstation"}</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "15px" }}>
            {profile.roles?.map((r: string) => (
              <span key={r} style={{ background: "#3b82f6", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}>{r.replace("_", " ")}</span>
            ))}
          </div>
          {profile.pairName && (
            <div style={{ padding: "10px", background: darkMode ? "#334155" : "#f0fdf4", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>
              🤝 <strong>Pair:</strong> {profile.pairName}
            </div>
          )}

          {editMode ? (
            <div>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." style={{ width: "100%", minHeight: "80px", padding: "10px", borderRadius: "8px", border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"), background: darkMode ? "#334155" : "white", color: textColor, fontSize: "14px", boxSizing: "border-box" }} />
              <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                <button onClick={saveBio} style={{ background: "#10b981", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Save</button>
                <button onClick={() => { setEditMode(false); setBio(profile.bio || ""); }} style={{ background: "#6b7280", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "10px" }}>{profile.bio || "No bio yet."}</p>
              <button onClick={() => setEditMode(true)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>✏️ Edit Bio</button>
            </div>
          )}

          <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
            <div style={{ textAlign: "center", padding: "12px", background: darkMode ? "#334155" : "#f8fafc", borderRadius: "8px" }}>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>{profile.checkInCount}</p>
              <p style={{ fontSize: "11px", opacity: "0.7" }}>Check-ins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
