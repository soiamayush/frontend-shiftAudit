"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/usAuth";

const fullText =
  "Shift your performance left with AI-powered code audits";

const features = [
  {
    icon: "⚡",
    title: "AI-Powered Precision",
    desc: "Laser-focused diagnostics that identify real performance bottlenecks with actionable code fixes.",
  },
  {
    icon: "🔧",
    title: "Dev-First Workflows",
    desc: "Native CI/CD integration, code-level diffs, and automated PR comments. Ship faster, break nothing.",
  },
  {
    icon: "🤝",
    title: "Collaborative Intelligence",
    desc: "Share audits, assign fixes, track team progress, and merge insights across your entire org.",
  },
];

const stats = [
  { value: "98%", label: "Faster load times" },
  { value: "15k+", label: "Active developers" },
  { value: "<2min", label: "Average audit time" },
];

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuth();

  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const textIndexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const index = textIndexRef.current;
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText[index]);
        textIndexRef.current += 1;
      } else {
        clearInterval(interval);
        setIsTypingDone(true);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handlePrimary = () => {
    router.push(token ? "/dashboard" : "/auth/login");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/ai-hero-bg.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <div className="animate-float-slow absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="animate-float-slower absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="animate-float-medium absolute bottom-1/4 left-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-[100px]" />
      </div>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center">
        {/* HERO */}
        <section className="flex flex-col items-center justify-center text-center pt-28 pb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-gray-300 tracking-wider">
              AI-Precision • Next-Gen Audits
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl sm:text-7xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-gradient-x"
          >
            Shift Audit AI
          </motion.h1>

          {/* Typewriter */}
          <motion.p className="mt-6 max-w-2xl text-lg text-gray-300">
            {displayedText}
            <span
              className={`inline-block w-[2px] h-5 bg-white ml-1 ${
                isTypingDone ? "opacity-0" : "animate-blink"
              }`}
            />
          </motion.p>

          {/* CTA */}
          <motion.button
            onClick={handlePrimary}
            className="mt-10 cursor-pointer px-8 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold flex items-center gap-2 hover:scale-[1.03] transition"
          >
            {token ? "Go to Console" : "Get Started"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </section>

        {/* FEATURES */}
        <section className="w-full pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur hover:border-cyan-500/40 hover:-translate-y-2 transition"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="w-full pb-24 grid grid-cols-3 gap-6 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {s.value}
              </div>
              <p className="text-sm text-gray-400 mt-2">{s.label}</p>
            </motion.div>
          ))}
        </section>

        {/* CTA */}
        <section className="w-full pb-24">
          <div className="p-10 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur relative overflow-hidden">
            <h2 className="text-3xl font-bold">
              Ready to{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                shift left
              </span>
              ?
            </h2>
            <p className="mt-3 text-gray-400">
              Join thousands of teams shipping high-performance apps.
            </p>
            <button
              onClick={handlePrimary}
              className="mt-6 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Start free audit →
            </button>
          </div>
        </section>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1 }
          50% { opacity: 0 }
        }

        .animate-blink {
          animation: blink 1s infinite;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }

        @keyframes float-slow {
          0% { transform: translate(0, 0); }
          50% { transform: translate(30px, -40px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes float-slower {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 30px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes float-medium {
          0% { transform: translate(0, 0); }
          50% { transform: translate(25px, 25px); }
          100% { transform: translate(0, 0); }
        }

        .animate-float-slow {
          animation: float-slow 16s infinite ease-in-out;
        }

        .animate-float-slower {
          animation: float-slower 20s infinite ease-in-out;
        }

        .animate-float-medium {
          animation: float-medium 14s infinite ease-in-out;
        }
      `}</style>
    </main>
  );
}