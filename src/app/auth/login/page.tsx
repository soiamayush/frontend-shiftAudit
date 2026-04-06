"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { useAuth } from "../../../hooks/usAuth";
import { API_ROUTES } from "@/config";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(form);
    setIsLoading(false);
    if (result.ok) return router.push("/dashboard");
    setError(result.error || "Invalid credentials");
  };

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    try {
      const res = await fetch(API_ROUTES.GOOGLE_AUTH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (!res.ok) throw new Error("Google login failed");
      const { token } = await res.json();
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google sign‑in failed");
    }
  }, [router]);

  // Google Sign-In Integration
  useEffect(() => {
    if (typeof window === "undefined" || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-signin")!,
      { theme: "outline", size: "large", width: 300 } as any
    );
  }, [handleGoogleResponse]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      {/* Animated background orbs */}
      <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] bg-[#8B5CF6] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-float-slow" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-[#06B6D4] rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-float-slower" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[#EC4899] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-float-medium" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cdefs%3E%3Cpattern id=%27grid%27 width=%2760%27 height=%2760%27 patternUnits=%27userSpaceOnUse%27%3E%3Cpath d=%27M 60 0 L 0 0 0 60%27 fill=%27none%27 stroke=%27rgba(255,255,255,0.02)%27 stroke-width=%271%27/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%27100%25%27 height=%27100%25%27 fill=%27url(%23grid)%27/%3E%3C/svg%3E')] opacity-40 pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/[0.03] backdrop-blur-xl rounded-2xl w-full max-w-md space-y-6 shadow-2xl border border-white/10 p-8 transition-all duration-500 hover:border-purple-500/30"
      >
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Shift Audit
          </h2>
          <p className="text-gray-400 text-sm">Welcome back</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email Address"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
        />
        <Input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
        />

        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-500/25"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Logging in...
            </div>
          ) : (
            "Log In"
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-transparent text-gray-500">OR CONTINUE WITH</span>
          </div>
        </div>

        {/* Google Sign-In button container */}
        <div id="google-signin" className="flex justify-center" />

        <p className="text-sm text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <span
            className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer font-medium transition-colors"
            onClick={() => router.push("/auth/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>

      <style jsx>{`
        @keyframes float-slow {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
          100% { transform: translate(10px, -10px) scale(1); }
        }
        @keyframes float-slower {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 30px) scale(1.15); }
          100% { transform: translate(20px, -20px) scale(0.95); }
        }
        @keyframes float-medium {
          0% { transform: translate(0px, 0px) scale(1); }
          40% { transform: translate(25px, 25px) scale(1.05); }
          80% { transform: translate(-15px, -15px) scale(0.95); }
          100% { transform: translate(5px, -5px) scale(1); }
        }
        .animate-float-slow {
          animation: float-slow 16s infinite alternate ease-in-out;
        }
        .animate-float-slower {
          animation: float-slower 20s infinite alternate-reverse ease-in-out;
        }
        .animate-float-medium {
          animation: float-medium 14s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}