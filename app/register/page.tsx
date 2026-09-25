"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

function PasswordInput({ value, onChange, placeholder, style }: any) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={show ? "text" : "password"} placeholder={placeholder} value={value} onChange={onChange} style={{ ...style, paddingRight: "48px" }} />
      <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#666", padding: "4px" }}>{show ? "🙈" : "👁️"}</button>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ fullName: "", phone: "", idNumber: "", password: "", confirmPassword: "", outstation: "", paidCash: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [mpesaStatus, setMpesaStatus] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.idNumber || !form.password) { toast.error("Fill all required fields"); return; }
    if (!form.outstation) { toast.error("Select your outstation"); return; }
    if (form.password.length < 6) { toast.error("Password must be 6+ characters"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.fullName, phone: form.phone, password: form.password, idNumber: form.idNumber, outstation: form.outstation, paidCash: form.paidCash })
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Registration failed"); setLoading(false); return; }
      setSuccess(data);

      if (!form.paidCash) {
        setMpesaStatus("Sending M-Pesa prompt...");
        try {
          const mpesaRes = await fetch("/api/mpesa-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: form.phone, amount: 100, purpose: "Registration Fee", memberId: data.userId })
          });
          const mpesaData = await mpesaRes.json();
          if (mpesaRes.ok) {
            setMpesaStatus("Check your phone for M-Pesa prompt to pay KES 100.");
            toast.success("M-Pesa prompt sent!");
          } else {
            setMpesaStatus("M-Pesa failed: " + (mpesaData.error || "unknown"));
            toast.error("M-Pesa prompt failed. Pay cash to Secretary.");
          }
        } catch (err) {
          setMpesaStatus("M-Pesa network error. Pay cash to Secretary.");
        }
      } else {
        setMpesaStatus("Pay KES 100 cash to your Secretary when you next meet.");
      }
    } catch (err) { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "15px", outline: "none", boxSizing: "border-box", marginBottom: "10px" };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", padding: "20px" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "20px", maxWidth: "450px", width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: "60px", marginBottom: "15px" }}>🎉</p>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "10px" }}>Welcome to Forge Youth!</h2>
          <p style={{ fontSize: "16px", color: "#666", marginBottom: "15px" }}>You are member #{success.memberNumber}</p>
          <div style={{ padding: "15px", background: "#f0fdf4", borderRadius: "10px", marginBottom: "20px" }}>
            <p style={{ fontSize: "14px", color: "#16a34a", fontWeight: "600", marginBottom: "8px" }}>Registration Fee: KES 100</p>
            <p style={{ fontSize: "13px", color: "#666" }}>{mpesaStatus}</p>
          </div>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>Next: Your Moderator will pair you with a Jozi partner.</p>
          <Link href="/login" style={{ display: "inline-block", background: "#0f3460", color: "white", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold" }}>Go to Login →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", padding: "20px" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "20px", maxWidth: "480px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "5px" }}>Join Forge Youth</h1>
          <p style={{ fontSize: "14px", color: "#666" }}>Uthiru · Kagondo · Kinoo</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Full Name *</label>
          <input type="text" placeholder="e.g., John Kamau" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={inputStyle} required />
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Phone Number *</label>
          <input type="tel" placeholder="e.g., 0712345678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} required />
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>National ID *</label>
          <input type="text" placeholder="e.g., 12345678" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} style={inputStyle} required />
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Outstation *</label>
          <select value={form.outstation} onChange={(e) => setForm({ ...form, outstation: e.target.value })} style={inputStyle} required>
            <option value="">— Select —</option>
            <option value="Uthiru">Uthiru</option>
            <option value="Kagondo">Kagondo</option>
            <option value="Kinoo">Kinoo</option>
          </select>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Password * (min 6)</label>
          <PasswordInput value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value })} placeholder="Create password" style={inputStyle} />
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Confirm Password *</label>
          <PasswordInput value={form.confirmPassword} onChange={(e: any) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" style={inputStyle} />
          <div style={{ padding: "15px", background: "#f8fafc", borderRadius: "10px", marginBottom: "15px" }}>
            <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>Registration Fee: KES 100</p>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginBottom: "8px" }}>
              <input type="radio" checked={!form.paidCash} onChange={() => setForm({ ...form, paidCash: false })} /> Pay now via M-Pesa
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
              <input type="radio" checked={form.paidCash} onChange={() => setForm({ ...form, paidCash: true })} /> Pay cash to Secretary
            </label>
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #1a1a2e, #0f3460)", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Registering..." : "Register & Pay KES 100"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>Already registered? <Link href="/login" style={{ color: "#0f3460", fontWeight: "600" }}>Sign In</Link></p>
      </div>
    </div>
  );
}
