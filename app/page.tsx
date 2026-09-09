"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
    if (formattedPhone.startsWith("7")) formattedPhone = "254" + formattedPhone;

    // Get CSRF token first
    const csrfRes = await fetch("/api/auth/csrf");
    const csrfData = await csrfRes.json();

    const result = await signIn("credentials", {
      phone: formattedPhone,
      password,
      csrfToken: csrfData.csrfToken,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid phone or password");
      setLoading(false);
    } else {
      toast.success("Welcome!");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Kinoo YSC</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="tel" placeholder="Phone (e.g., 0712345678)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <Link href="/register" className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg mt-4 text-center">
          Register Now
        </Link>
      </div>
    </div>
  );
}