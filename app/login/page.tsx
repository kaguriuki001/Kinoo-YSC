"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

function PasswordInput({ value, onChange, placeholder, style }: any) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input type={show ? "text" : "password"} placeholder={placeholder} value={value} onChange={onChange} style={{ ...style, paddingRight: '48px' }} />
      <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#666', padding: '4px' }} aria-label={show ? "Hide password" : "Show password"}>
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}

export default function Login() {
  const [identifier, setIdentifier] = useState("");
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
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/stats/public", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { toast.error("Fill all fields"); return; }
    setLoading(true);
    try {
      const csrfRes = await fetch("/api/auth/csrf", { credentials: "include" });
      const csrfData = await csrfRes.json();
      const body = new URLSearchParams();
      body.append("identifier", identifier.trim());
      body.append("phone", identifier.trim());
      body.append("password", password);
      body.append("csrfToken", csrfData.csrfToken);
      body.append("callbackUrl", window.location.origin + "/dashboard");
      body.append("json", "true");
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        credentials: "include",
        redirect: "manual"
      });
      if (res.status === 200 || res.status === 302 || res.status === 0) {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
        const sessionData = await sessionRes.json();
        if (sessionData?.user) {
          localStorage.setItem('kinoo_user', JSON.stringify(sessionData.user));
          toast.success("Karibu, " + (sessionData.user.name || "friend") + "!");
          window.location.href = "/dashboard";
        } else {
          toast.error("Session failed — try again");
          setLoading(false);
        }
      } else {
        toast.error("Invalid credentials. Check phone/name and password.");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Login failed. Try again.");
      setLoading(false);
    }
  };

  const requestOTP = async () => {
    if (!forgotPhone) { toast.error("Enter your phone number"); return; }
    setResetLoading(true);
    try {
      const res = await fetch("/api/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: forgotPhone }) });
      const data = await res.json();
      setResetLoading(false);
      if (res.ok) { setDevOTP(data.otp); toast.success("OTP generated!"); setForgotStep(2); }
      else toast.error(data.error || "Failed to send OTP");
    } catch (err) { setResetLoading(false); toast.error("Network error."); }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) { toast.error("Enter OTP and new password"); return; }
    if (newPassword.length < 6) { toast.error("Password must be 6+ characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setResetLoading(true);
    try {
      const res = await fetch("/api/forgot-password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: forgotPhone, otp, newPassword }) });
      const data = await res.json();
      setResetLoading(false);
      if (res.ok) {
        toast.success("Password reset! Login now.");
        setTimeout(() => { setShowForgot(false); setForgotStep(1); setForgotPhone(""); setOtp(""); setNewPassword(""); setConfirmPassword(""); setDevOTP(""); }, 1500);
      } else toast.error(data.error || "Reset failed");
    } catch (err) { setResetLoading(false); toast.error("Network error."); }
  };

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const };
  const btnStyle = { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600' as const, cursor: 'pointer' };

  const upcoming = stats?.upcomingEvent;
  const upcomingText = upcoming && upcoming.date
    ? new Date(upcoming.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', padding: '20px' }}>

      {/* HERO — social proof + identity */}
      <div style={{ maxWidth: '460px', margin: '0 auto', paddingTop: '30px', paddingBottom: '20px', textAlign: 'center', color: 'white' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>K</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
          Kinoo YSC
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>
          Forge Youth · Kinoo Parish
        </p>
        <p style={{ fontSize: '13px', opacity: 0.55, letterSpacing: '0.5px' }}>
          Uthiru · Kagondo · Kinoo
        </p>
      </div>

      {/* LIVE COUNTERS */}
      {stats && (stats.members > 0 || stats.outstations > 0) && (
        <div style={{ maxWidth: '460px', margin: '0 auto 20px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {stats.members > 0 && (
            <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', padding: '8px 14px', borderRadius: '20px', color: '#bfdbfe', fontSize: '12px', fontWeight: 600 }}>
              👥 {stats.members} members
            </div>
          )}
          {stats.outstations > 0 && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', padding: '8px 14px', borderRadius: '20px', color: '#a7f3d0', fontSize: '12px', fontWeight: 600 }}>
              📍 {stats.outstations} outstations
            </div>
          )}
          {stats.checkedInThisWeek > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', padding: '8px 14px', borderRadius: '20px', color: '#fde68a', fontSize: '12px', fontWeight: 600 }}>
              ✅ {stats.checkedInThisWeek} checked in
            </div>
          )}
        </div>
      )}

      {/* UPCOMING EVENT TICKER */}
      {upcoming && upcomingText && (
        <div style={{ maxWidth: '460px', margin: '0 auto 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
          <span style={{ fontSize: '22px' }}>📅</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.5px', textTransform: 'uppercase' as const, fontWeight: 700 }}>Next up · {upcomingText}</p>
            <p style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{upcoming.title}</p>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <div style={{ maxWidth: '460px', margin: '0 auto', background: 'white', padding: '32px 28px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

        {!showForgot ? (
          <>
            <div style={{ marginBottom: '22px' }}>
              <h2 style={{ fontSize: '20px', color: '#1a1a2e', fontWeight: 700, marginBottom: '4px' }}>
                Karibu tena 👋
              </h2>
              <p style={{ fontSize: '13px', color: '#666' }}>
                Sign in to continue your journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#333' }}>Phone or Full Name</label>
                <input type="text" placeholder="e.g., 0712345678 or John Kamau" value={identifier} onChange={(e) => setIdentifier(e.target.value)} style={inputStyle} required autoComplete="username" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#333' }}>Password</label>
                <PasswordInput value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="Enter your password" style={inputStyle} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: '#0f3460', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: 0 }}>Forgot Password?</button>
              </div>
              <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>{loading ? "Signing in..." : "Sign In →"}</button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '22px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ color: '#999', fontSize: '12px', fontWeight: 600 }}>NEW HERE?</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            <Link href="/register" style={{ display: 'block', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' as const }}>
              ✨ Join Kinoo YSC
            </Link>

            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#888' }}>🔒 Private</span>
              <span style={{ fontSize: '11px', color: '#888' }}>📱 Mobile-first</span>
              <span style={{ fontSize: '11px', color: '#888' }}>🕊️ Safe space</span>
            </div>

            <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px' }}>
              <Link href="/" style={{ color: '#666', textDecoration: 'underline' }}>← Back to Homepage</Link>
            </p>
          </>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>Reset Password</h2>
              <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            {forgotStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="tel" placeholder="Your phone number" value={forgotPhone} onChange={(e) => setForgotPhone(e.target.value)} style={inputStyle} />
                <button onClick={requestOTP} disabled={resetLoading} style={{ ...btnStyle, background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>{resetLoading ? "Sending..." : "Send OTP"}</button>
              </div>
            )}
            {forgotStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {devOTP && (
                  <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                    <p style={{ fontSize: '12px', color: '#92400e' }}>Dev Mode OTP:</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e', letterSpacing: '4px', textAlign: 'center' }}>{devOTP}</p>
                  </div>
                )}
                <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }} />
                <PasswordInput value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} placeholder="New password" style={inputStyle} />
                <PasswordInput value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} placeholder="Confirm password" style={inputStyle} />
                <button onClick={resetPassword} disabled={resetLoading} style={{ ...btnStyle, background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>{resetLoading ? "Resetting..." : "Reset Password"}</button>
              </div>
            )}
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
        Built for the youth of Kinoo Parish · 2026
      </p>
    </div>
  );
}
