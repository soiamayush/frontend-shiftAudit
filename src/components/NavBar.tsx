"use client";

import Link from "next/link";
import { useAuth } from "../hooks/usAuth";
import Button from "./Button";

export default function Navbar() {
  const { token, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Glass background */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_40px_-28px_rgba(0,0,0,0.8)]">

        {/* Top gradient line (UPDATED) */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        <nav className="h-16 px-4 flex items-center">
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="group inline-flex items-center gap-3">
              
              {/* Icon */}
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/40 transition-colors">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_0_4px_rgba(6,182,212,0.15)]" />
              </span>

              {/* Text */}
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Shift Audit AI
              </span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {token && (
                <Button
                  onClick={logout}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:scale-[1.03] transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(6,182,212,0.5)]"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}