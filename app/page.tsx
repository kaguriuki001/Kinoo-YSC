"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotPhone, setForgotPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devOTP, setDevOTP] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) { toast.error("Fill all fields"); return; }
    setLoading(true);

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
    if (formattedPhone.startsWith("7")) formattedPhone = "254" + formattedPhone;

    const result = await signIn("credentials", {
      phone: formattedPhone,
      password,
      redirect: false
    });

    if (result?.ok) {
      toast.success("Welcome to Kinoo YSC!");
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
        const sessionData = await sessionRes.json();
        if (sessionData?.user) {
          localStorage.setItem('kinoo_user', JSON.stringify(sessionData.user));
        }
      } catch (e) {}
      window.location.href = "/dashboard";
    } else {
      toast.error("Invalid phone or password");
      setLoading(false);
    }
  };

  const requestOTP = async () => {
    if (!forgotPhone) { toast.error("Enter your phone number"); return; }
    setResetLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone })
      });
      const data = await res.json();
      setResetLoading(false);
      if (res.ok) {
        setDevOTP(data.otp);
        toast.success("OTP generated!");
        setForgotStep(2);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setResetLoading(false);
      toast.error("Network error. Try again.");
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) { toast.error("Enter OTP and new password"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }

    setResetLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, otp, newPassword })
      });
      const data = await res.json();
      setResetLoading(false);
      if (res.ok) {
        toast.success("Password reset! Login with your new password.");
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep(1);
          setForgotPhone("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setDevOTP("");
        }, 1500);
      } else {
        toast.error(data.error || "Reset failed");
      }
    } catch (err) {
      setResetLoading(false);
      toast.error("Network error. Try again.");
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotPhone("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setDevOTP("");
  };

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const };
  const btnStyle = { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600' as const, cursor: 'pointer' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>K</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '5px' }}>Kinoo YSC</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>kINOO YSC</p>
        </div>

        {!showForgot ? (
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Phone Number</label>
                <input type="tel" placeholder="e.g., 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Password</label>
                <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: '#0f3460', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: 0 }}>Forgot Password?</button>
              </div>
              <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ color: '#999', fontSize: '13px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            <Link href="/register" style={{ display: 'block', width: '100%', padding: '14px', background: 'white', color: '#0f3460', border: '2px solid #0f3460', borderRadius: '10px', fontSize: '16px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' as const }}>
              Register Now
            </Link>
          </>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>Reset Password</h2>
              <button onClick={closeForgot} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>

            {forgotStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                  Enter your registered phone number. We'll send you a 6-digit OTP to reset your password.
                </p>
                <input
                  type="tel"
                  placeholder="e.g., 0712345678"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  style={inputStyle}
                />
                <button onClick={requestOTP} disabled={resetLoading} style={{ ...btnStyle, background: 'linear-gradient(135deg, #16a34a, #15803d)', opacity: resetLoading ? 0.6 : 1 }}>
                  {resetLoading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {devOTP && (
                  <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                    <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '5px' }}>🔧 Dev Mode OTP:</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e', letterSpacing: '4px', textAlign: 'center' }}>{devOTP}</p>
                    <p style={{ fontSize: '11px', color: '#92400e', marginTop: '5px' }}>In production this will be sent via SMS</p>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ ...inputStyle, textAlign: 'center' as const, letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }}
                />
                <input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
                <button onClick={resetPassword} disabled={resetLoading} style={{ ...btnStyle, background: 'linear-gradient(135deg, #16a34a, #15803d)', opacity: resetLoading ? 0.6 : 1 }}>
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
                <button onClick={() => setForgotStep(1)} style={{ background: 'none', border: 'none', color: '#0f3460', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: 0 }}>
                  ← Request new OTP
                </button>
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#999' }}>© 2026 Kinoo YSC</p>
      </div>
    </div>
  );
}