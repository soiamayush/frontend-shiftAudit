// src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { useAuth } from "../hooks/usAuth";  
import Button from "./Button";
export default function Navbar() {
  const { token, logout } = useAuth();
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Glass backdrop + subtle border so it doesn’t feel “floating” */}
      <div className="bg-[#0a0a0f]/50 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_40px_-28px_rgba(0,0,0,0.8)]">
        {/* Gradient hairline accent */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

        <nav className="h-16 px-4 flex items-center">
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-purple-500/30 transition-colors">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 shadow-[0_0_0_4px_rgba(168,85,247,0.12)]" />
              </span>
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-200 bg-clip-text text-transparent">
                Shift Audit AI
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {token && (
                <Button onClick={logout} className="px-4 py-2 rounded-full">
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
