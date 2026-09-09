"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
    if (formattedPhone.startsWith("7")) formattedPhone = "254" + formattedPhone;

    const result = await signIn("credentials", {
      phone: formattedPhone,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid phone or password");
      setLoading(false);
    } else {
      toast.success("Welcome to Kinoo YSC!");
      
      // Fetch fresh session to get real roles
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
        const sessionData = await sessionRes.json();
        if (sessionData?.user) {
          localStorage.setItem('kinoo_user', JSON.stringify(sessionData.user));
        }
      } catch (e) {}
      
      window.location.href = "/dashboard";
    }
  };

  const handleForgotPassword = async () => {
    const userPhone = prompt("Enter your phone number for OTP:");
    if (!userPhone) return;
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userPhone })
      });
      const data = await res.json();
      if (res.ok) toast.success(`Your OTP: ${data.otp}`);
      else toast.error(data.error || "Phone not found");
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>K</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '5px' }}>Kinoo YSC</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Youth Sports Club Management</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Phone Number</label>
            <input type="tel" placeholder="e.g., 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' }} onFocus={(e) => e.target.style.border = '1px solid #0f3460'} onBlur={(e) => e.target.style.border = '1px solid #ddd'} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' }} onFocus={(e) => e.target.style.border = '1px solid #0f3460'} onBlur={(e) => e.target.style.border = '1px solid #ddd'} required />
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: '#0f3460', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>Forgot Password?</button>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#999', fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        <Link href="/register" style={{ display: 'block', width: '100%', padding: '14px', background: 'white', color: '#0f3460', border: '2px solid #0f3460', borderRadius: '10px', fontSize: '16px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>Register Now</Link>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#999' }}>© 2026 Kinoo Youth Sports Club</p>
      </div>
    </div>
  );
}