import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Search, Lock, Link2, FileCode, Brain } from "lucide-react";

const pills = [
  { icon: Zap, label: "AI-Generated" },
  { icon: Search, label: "Edge Case Detection" },
  { icon: Lock, label: "Security Coverage" },
  { icon: Link2, label: "Jira Integration" },
  { icon: FileCode, label: "Playwright Scripts" },
  { icon: Brain, label: "RAG-Powered" },
];

export default function Hero() {
  return (
    <section className="relative mesh-bg text-white overflow-hidden">
      <div className="container grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center min-h-[calc(100vh-4rem)] py-16 lg:py-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="pill"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> AI-Powered QA Automation
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="font-display mt-6 text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight"
          >
            Generate Production-Grade <span className="text-accent">Test Cases</span> from Requirements — Instantly.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-5 text-lg text-white/75 max-w-xl"
          >
            Your AI-powered QA engineer catches edge cases, security gaps, and boundary conditions that humans miss under deadline pressure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-7 flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible"
          >
            {pills.map((p) => (
              <span key={p.label} className="pill whitespace-nowrap">
                <p.icon size={14} className="text-accent" /> {p.label}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-9 flex flex-wrap items-center gap-5"
          >
            <Link to="/demo" className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-semibold text-primary-dark shadow-glow hover:scale-[1.04] transition-transform">
              Request a Demo →
            </Link>
            <a href="#output" className="text-white/85 hover:text-accent underline-offset-4 hover:underline">See example output ↓</a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
          className="relative"
        >
          <div className="glass-dark rounded-2xl shadow-card animate-pulse-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              <span className="ml-3 text-xs text-white/60 font-mono-code">QAGen AI — Output Preview</span>
            </div>
            <pre className="p-5 text-[12.5px] leading-relaxed font-mono-code text-white/90 whitespace-pre-wrap">
{`INPUT: "User should be able to log in with valid credentials"

✅ TC-001: Valid User Login (Happy Path) — Priority: HIGH
   Step 1: Navigate to login page → Login page displayed
   Step 2: Enter valid email → Email accepted
   Step 3: Enter valid password → Password masked
   Step 4: Click Login → Loading indicator appears
   Step 5: Wait for response → Redirected to dashboard

✅ TC-002: Invalid Password (Negative) — Priority: HIGH
   Step 1: Enter registered email → Accepted
   Step 2: Enter wrong password → Field highlighted red
   Step 3: Click Login → Error message displayed

🔐 TC-003: SQL Injection Attempt (Security)
🔁 TC-004: Boundary — Max password length (128 chars)
📱 TC-005: Mobile viewport — Responsive login form`}
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
