// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ArrowRightAltOutlinedIcon from "@mui/icons-material/ArrowRightAltOutlined";
import { useAuth } from "@/hooks/usAuth";

const fullText = "Shift your performance left with AI-powered code audits";

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuth();

  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const textIndexRef = useRef(0);

  // Typewriter effect
  useEffect(() => {
    const typeInterval = setInterval(() => {
      const index = textIndexRef.current;
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText[index]);
        textIndexRef.current += 1;
      } else {
        clearInterval(typeInterval);
        setIsTypingDone(true);
      }
    }, 45);
    return () => clearInterval(typeInterval);
  }, []);

  const handlePrimary = () => {
    router.push(token ? "/dashboard" : "/auth/login");
  };


  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-[#0a0a0f]">
      {/* Animated gradient orbs - modern, softer, more depth */}
      <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] bg-[#8B5CF6] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-float-slow" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-[#06B6D4] rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-float-slower" />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#EC4899] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-float-medium" />
      <div className="absolute bottom-[20%] left-[-5%] w-[350px] h-[350px] bg-[#A855F7] rounded-full mix-blend-screen filter blur-[90px] opacity-20 animate-float-slow" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.02)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E')] opacity-40 pointer-events-none" />

      {/* Hero Section */}
      <div className="z-10 text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-gray-300 tracking-wide">
            AI-Precision • Next-Gen Audits
          </span>
        </div>

        {/* Logo / Name */}
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter">
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
            Shift Audit AI
          </span>
        </h1>

        {/* Tagline with typewriter */}
        <div className="mt-4 h-16 md:h-12">
          <p className="text-lg md:text-xl font-medium text-gray-300 max-w-2xl mx-auto">
            {displayedText}
            <span
              className={`inline-block w-[2px] h-6 bg-gradient-to-b from-purple-400 to-blue-500 ml-1 rounded-full transition-all duration-300 ${
                isTypingDone ? "opacity-0" : "opacity-100"
              }`}
              style={{ animation: "blink 1s step-end infinite" }}
            />
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8">
          <button
            onClick={handlePrimary}
            className="group relative px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] shadow-[0_8px_20px_-6px_rgba(139,92,246,0.4)] hover:shadow-[0_12px_28px_-8px_rgba(139,92,246,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 text-lg cursor-pointer"
          >
            <span className="cursor-pointer">{token ? "Go to Console" : "Get Started"}</span>
            <ArrowRightAltOutlinedIcon className="text-xl group-hover:translate-x-1 transition-transform" />
          </button>
        
        </div>
      </div>

      {/* Feature Grid - Modern, Elevated Cards */}
      <div className="z-10 mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-4">
        {[
          {
            icon: "⚡",
            title: "AI-Powered Precision",
            desc: "Laser-focused diagnostics that identify real performance bottlenecks with actionable code fixes.",
            accent: "from-amber-500 to-orange-500",
          },
          {
            icon: "🔧",
            title: "Dev-First Workflows",
            desc: "Native CI/CD integration, code-level diffs, and automated PR comments. Ship faster, break nothing.",
            accent: "from-blue-500 to-cyan-500",
          },
          {
            icon: "🤝",
            title: "Collaborative Intelligence",
            desc: "Share audits, assign fixes, track team progress, and merge insights across your entire org.",
            accent: "from-purple-500 to-pink-500",
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="group relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-purple-500/40 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.06] shadow-xl"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10 from-purple-600/20 to-blue-600/20" />
            
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              {feature.title}
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              {feature.desc}
            </p>
            <div className={`mt-4 h-1 w-12 bg-gradient-to-r ${feature.accent} rounded-full group-hover:w-20 transition-all duration-300`} />
          </div>
        ))}
      </div>

      {/* Stats / Social Proof Section - Modern touch */}
      <div className="z-10 mt-20 flex flex-wrap justify-center gap-8 md:gap-16 px-4">
        <div className="text-center">
          <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            98%
          </div>
          <p className="text-gray-400 text-sm mt-1">Faster load times</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            15k+
          </div>
          <p className="text-gray-400 text-sm mt-1">Active developers</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            &lt;2min
          </div>
          <p className="text-gray-400 text-sm mt-1">Average audit time</p>
        </div>
      </div>

      {/* CTA Banner - Minimal but impactful */}
      <div className="z-10 mt-20 w-full max-w-3xl mx-auto px-4">
        <div className="relative rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-blue-900/30 backdrop-blur-xl border border-white/10 p-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
          <h3 className="text-2xl md:text-3xl font-bold text-white relative z-10">
            Ready to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">shift left</span>?
          </h3>
          <p className="text-gray-300 mt-2 relative z-10">
            Join thousands of teams shipping high-performance web apps.
          </p>
          <button
            onClick={handlePrimary}
            className="mt-5 relative z-10 px-6 py-2.5 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl cursor-pointer active:scale-[0.98]"
          >
            Start free audit →
          </button>
        </div>
      </div>

      {/* Custom animations injected via style tag */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
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
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </main>
  );
}