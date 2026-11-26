"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function ProfileInner() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get("userId");

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [outstation, setOutstation] = useState("");
  const [bio, setBio] = useState("");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    const saved = localStorage.getItem("kinoo_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        loadProfile(targetId || u.id || u._id);
      } catch (e) {}
    }
  }, [targetId]);

  const loadProfile = (uid: string) => {
    fetch("/api/profile?userId=" + uid + "&t=" + Date.now())
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setFullName(d.fullName || "");
        setPhone(d.phone || "");
        setOutstation(d.outstation || "");
        setBio(d.bio || "");
      })
      .catch(() => {});
  };

  const uploadImage = (field: string, file: File) => {
    if (file.size > 2000000) {
      toast.error("Image too large (max 2MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const uid = profile?._id;
      const callerId = user?.id || user?._id;
      const body: any = { userId: uid, callerId };
      body[field] = dataUrl;
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(field === "photo" ? "Profile photo updated" : "Cover photo updated");
        loadProfile(uid);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const saveEdits = async () => {
    setSaving(true);
    const callerId = user?.id || user?._id;
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: profile?._id,
        callerId,
        fullName,
        phone,
        outstation,
        bio,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Profile updated");
      setEditMode(false);
      loadProfile(profile?._id);
      if (String(profile?._id) === String(callerId)) {
        const stored = localStorage.getItem("kinoo_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            u.fullName = fullName;
            u.phone = phone;
            u.outstation = outstation;
            localStorage.setItem("kinoo_user", JSON.stringify(u));
          } catch (e) {}
        }
      }
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Save failed");
    }
  };

  const searchMembers = async () => {
    if (search.trim().length < 2) {
      toast.error("Type at least 2 characters");
      return;
    }
    setSearching(true);
    try {
      const res = await fetch("/api/search-users?q=" + encodeURIComponent(search.trim()));
      const matches = await res.json();
      setSearchResults(Array.isArray(matches) ? matches : []);
    } catch (e) {
      toast.error("Search failed");
    }
    setSearching(false);
  };

  const isSelf = profile && user && String(profile._id) === String(user.id || user._id);
  const callerRoles: string[] = (user?.roles || []).map((r: string) => String(r).toLowerCase());
  const isAdmin = callerRoles.some((r) => r === "father" || r === "moderator");

  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const cardStyle: any = {
    background: darkMode ? "#1e293b" : "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"),
    color: textColor,
    marginBottom: "15px",
  };
  const inputStyle: any = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid " + (darkMode ? "#475569" : "#cbd5e1"),
    background: darkMode ? "#0f172a" : "#f8fafc",
    color: textColor,
    fontSize: "14px",
    marginTop: "4px",
    marginBottom: "12px",
    boxSizing: "border-box",
  };
  const labelStyle: any = {
    fontSize: "12px",
    fontWeight: 600,
    opacity: 0.75,
    display: "block",
    marginTop: "8px",
  };

  if (!profile) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  const initials = (profile.fullName || "?")
    .split(" ")
    .map((n: string) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={{ color: textColor, maxWidth: "700px", margin: "0 auto" }}>
      {isAdmin && (
        <div style={cardStyle}>
          <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            Search a member to edit their profile
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMembers()}
              placeholder="Name or phone"
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
            />
            <button
              onClick={searchMembers}
              disabled={searching}
              style={{
                padding: "10px 16px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {searching ? "..." : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              {searchResults.map((m) => (
                <a
                  key={m._id}
                  href={"/dashboard/profile?userId=" + m._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px",
                    borderRadius: "8px",
                    color: textColor,
                    textDecoration: "none",
                    borderBottom: "1px solid " + (darkMode ? "#334155" : "#e5e7eb"),
                  }}
                >
                  <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#3b82f6", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                    {(m.fullName || "?").charAt(0).toUpperCase()}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{m.fullName}</span>
                    <span style={{ display: "block", fontSize: 11, opacity: 0.6 }}>{m.phone} - {(m.roles || []).join(", ")}</span>
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.5 }}>Edit</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {!isSelf && (
        <div style={{ ...cardStyle, background: darkMode ? "#422006" : "#fef3c7", borderColor: "#f59e0b" }}>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
            Editing {profile.fullName} profile (Moderator mode).
          </p>
          <a href="/dashboard/profile" style={{ fontSize: 12, color: "#3b82f6", marginTop: 4, display: "inline-block" }}>
            Back to my profile
          </a>
        </div>
      )}

      <div style={cardStyle}>
        <div
          style={{
            position: "relative",
            height: "140px",
            borderRadius: "12px 12px 0 0",
            background: profile.coverPhoto
              ? "url(" + profile.coverPhoto + ") center/cover"
              : "linear-gradient(135deg, #1a1a2e, #16213e)",
            marginBottom: "60px",
          }}
        >
          <input
            type="file"
            accept="image/*"
            id="cover-upload"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImage("coverPhoto", f);
            }}
          />
          <label
            htmlFor="cover-upload"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(0,0,0,0.5)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Change Cover
          </label>
          <div
            style={{
              position: "absolute",
              bottom: "-50px",
              left: "20px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "4px solid " + (darkMode ? "#1e293b" : "white"),
              background: profile.photo ? "url(" + profile.photo + ") center/cover" : "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {!profile.photo && initials}
            <input
              type="file"
              accept="image/*"
              id="photo-upload"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage("photo", f);
              }}
            />
            <label
              htmlFor="photo-upload"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "#3b82f6",
                color: "white",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "14px",
                border: "2px solid " + (darkMode ? "#1e293b" : "white"),
              }}
            >
              Cam
            </label>
          </div>
        </div>

        <div style={{ marginTop: "15px" }}>
          {!editMode ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "5px" }}>
                    {profile.fullName}
                  </h1>
                  <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "5px" }}>{profile.phone}</p>
                  <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "10px" }}>
                    {profile.outstation || "No outstation"}
                  </p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    padding: "8px 16px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Edit Profile
                </button>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "15px" }}>
                {profile.roles?.map((r: string) => (
                  <span
                    key={r}
                    style={{
                      background: "#3b82f6",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {r.replace("_", " ")}
                  </span>
                ))}
              </div>
              {profile.bio && (
                <div
                  style={{
                    padding: "10px",
                    background: darkMode ? "#334155" : "#f8fafc",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    fontSize: "13px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <strong>Bio:</strong> {profile.bio}
                </div>
              )}
              {profile.pairName && (
                <div
                  style={{
                    padding: "10px",
                    background: darkMode ? "#334155" : "#f0fdf4",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    fontSize: "13px",
                  }}
                >
                  Pair: <strong>{profile.pairName}</strong>
                </div>
              )}
              <div
                style={{
                  marginTop: "20px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    background: darkMode ? "#334155" : "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                    {profile.checkInCount || 0}
                  </p>
                  <p style={{ fontSize: "11px", opacity: 0.7 }}>Check-ins</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <label style={labelStyle}>Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>Outstation</label>
              <input
                value={outstation}
                onChange={(e) => setOutstation(e.target.value)}
                placeholder="e.g. Uthiru, Kagondo, Kinoo"
                style={inputStyle}
              />

              <label style={labelStyle}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={saveEdits}
                  disabled={saving}
                  style={{
                    padding: "10px 20px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFullName(profile.fullName || "");
                    setPhone(profile.phone || "");
                    setOutstation(profile.outstation || "");
                    setBio(profile.bio || "");
                  }}
                  style={{
                    padding: "10px 20px",
                    background: darkMode ? "#334155" : "#e2e8f0",
                    color: textColor,
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>

              <p style={{ fontSize: "11px", opacity: 0.55, marginTop: "12px" }}>
                Roles are managed by the Father. Contact them if your role needs to change.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
      <ProfileInner />
    </Suspense>
  );
}
