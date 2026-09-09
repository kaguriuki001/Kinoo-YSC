"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", phone: "", idNumber: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.idNumber || !form.password) { toast.error("Fill all fields"); return; }
    if (form.password.length < 8) { toast.error("Password must be 8+ characters"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { toast.success(data.message || "Registration successful!"); setTimeout(() => window.location.href = "/", 1500); }
      else toast.error(data.error || "Registration failed");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '450px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: '25px' }}>Join Kinoo YSC</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} style={inputStyle} required />
          <input type="tel" placeholder="Phone (e.g., 0712345678)" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} style={inputStyle} required />
          <input type="text" placeholder="National ID Number" value={form.idNumber} onChange={(e) => setForm({...form, idNumber: e.target.value})} style={inputStyle} required />
          <input type="password" placeholder="Password (min 8 characters)" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} style={inputStyle} required />
          <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} style={inputStyle} required />
          <button type="submit" disabled={loading} style={{ padding: '14px', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>Already registered? <Link href="/" style={{ color: '#0f3460', fontWeight: '600' }}>Sign In</Link></p>
      </div>
    </div>
  );
}