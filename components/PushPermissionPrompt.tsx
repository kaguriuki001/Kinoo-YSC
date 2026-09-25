"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function PushPermissionPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    const asked = localStorage.getItem("kinoo_push_asked");
    if (asked === "yes") return;
    if (Notification.permission === "granted") return;
    if (Notification.permission === "denied") return;
    setTimeout(() => setShow(true), 8000);
  }, []);

  const enable = async () => {
    try {
      const perm = await Notification.requestPermission();
      localStorage.setItem("kinoo_push_asked", "yes");
      setShow(false);
      if (perm === "granted") {
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notifications blocked. Enable in browser settings.");
      }
    } catch (e) {
      setShow(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem("kinoo_push_asked", "yes");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{ position: "fixed", bottom: "90px", left: "16px", right: "16px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "white", padding: "16px", borderRadius: "14px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 9998, maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span style={{ fontSize: "24px" }}>🔔</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: "bold", fontSize: "15px" }}>Enable Notifications</p>
          <p style={{ fontSize: "12px", opacity: "0.9" }}>Get alerts for new messages, events, and check-ins.</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={enable} style={{ flex: 2, background: "white", color: "#1d4ed8", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Enable</button>
        <button onClick={dismiss} style={{ flex: 1, background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Later</button>
      </div>
    </div>
  );
}
