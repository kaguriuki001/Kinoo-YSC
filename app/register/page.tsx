"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", phone: "", idNumber: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.idNumber || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Registration successful!");
        setTimeout(() => window.location.href = "/", 1500);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-teal-700 p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Join Kinoo YSC</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
          <input type="tel" placeholder="Phone (e.g., 0712345678)" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
          <input type="text" placeholder="National ID Number" value={form.idNumber} onChange={(e) => setForm({...form, idNumber: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
          <input type="password" placeholder="Password (min 8 characters)" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
          <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-500 dark:text-gray-400">
          Already registered? <Link href="/" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}