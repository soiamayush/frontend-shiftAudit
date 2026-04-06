"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { useAuth } from "../../../hooks/usAuth";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const result = await signup({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    setIsLoading(false);

    if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      {/* Animated background orbs */}
      <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] bg-[#8B5CF6] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-float-slow" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-[#06B6D4] rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-float-slower" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[#EC4899] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-float-medium" />
      <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-[#A855F7] rounded-full mix-blend-screen filter blur-[90px] opacity-20 animate-float-slow" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cdefs%3E%3Cpattern id=%27grid%27 width=%2760%27 height=%2760%27 patternUnits=%27userSpaceOnUse%27%3E%3Cpath d=%27M 60 0 L 0 0 0 60%27 fill=%27none%27 stroke=%27rgba(255,255,255,0.02)%27 stroke-width=%271%27/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%27100%25%27 height=%27100%25%27 fill=%27url(%23grid)%27/%3E%3C/svg%3E')] opacity-40 pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/[0.03] backdrop-blur-xl rounded-2xl w-full max-w-md space-y-6 shadow-2xl border border-white/10 p-8 transition-all duration-500 hover:border-purple-500/30"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Shift Audit
          </h2>
          <p className="text-gray-400 text-sm">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-shake">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
        />
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
          placeholder="Password (min. 6 characters)"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
        />
        <Input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
        />

        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </div>
          ) : (
            "Sign Up"
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-transparent text-gray-500">Join the future of audits</span>
          </div>
        </div>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <span
            className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer font-medium transition-colors"
            onClick={() => router.push("/auth/login")}
          >
            Log In
          </span>
        </p>

        {/* Terms */}
        <p className="text-xs text-center text-gray-500">
          By signing up, you agree to our{" "}
          <span className="text-purple-400 hover:underline cursor-pointer">Terms</span> and{" "}
          <span className="text-purple-400 hover:underline cursor-pointer">Privacy Policy</span>
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}