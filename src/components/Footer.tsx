"use client";

import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";

const RESUME_URL =
  "https://drive.google.com/file/d/1ZgKc3c3Csx1rMJzkD6Ot5KXzwqpC0GQq/view?usp=sharing";
const GITHUB_URL = "https://github.com/soiamayush";
const LINKEDIN_URL =
  "https://www.linkedin.com/in/ayush-bhargava-a53a3a202/";

const linkClass =
  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-cyan-300";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Shift Audit AI
            </p>
            <p className="mt-2 max-w-md text-sm text-gray-400">
              Built by{" "}
              <span className="text-gray-300">Ayush Bhargava</span> — AI-powered
              performance audits for modern web apps.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Connect
            </p>
            <nav className="flex flex-col gap-1 sm:items-end">
              {/* <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <FiFileText className="h-4 w-4 text-cyan-400" />
                Resume
              </a> */}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <FaGithub className="h-4 w-4 text-cyan-400" />
                GitHub
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <FaLinkedin className="h-4 w-4 text-cyan-400" />
                LinkedIn
              </a>
            </nav>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-8 text-center text-xs text-gray-500 sm:flex-row sm:justify-between sm:text-left">
          <span>© {new Date().getFullYear()} Shift Audit — portfolio demo</span>
          <Link href="/" className="hover:text-cyan-400/80 transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </footer>
  );
}
