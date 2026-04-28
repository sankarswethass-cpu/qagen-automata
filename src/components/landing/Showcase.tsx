import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check, Minus, X } from "lucide-react";

const matrix = [
  ["Happy Path", true, true, true],
  ["Negative Scenarios", true, true, true],
  ["Edge Cases", true, true, true],
  ["Boundary Conditions", false, true, true],
  ["Security Checks", true, true, false],
  ["Cross Platform", false, false, true],
] as const;

const before = [
  "30–40% sprint time on test writing",
  "Coverage depends on individual engineer",
  "Edge cases and security checks missed",
  "QA always lags behind development",
  "Inconsistent formatting across team",
];
const after = [
  "16 test cases generated in seconds",
  "6 scenario types covered every time",
  "Edge cases and security auto-detected",
  "QA happens alongside development",
  "Clean Markdown output, every time",
];

export default function Showcase() {
  return (
    <section className="bg-surface-light py-20 lg:py-28" id="output">
      <div className="container">
        <h2 className="font-display text-3xl md:text-5xl text-foreground text-center max-w-4xl mx-auto tracking-tight">
          From Requirement to Production-Grade Test Suite — In Seconds
        </h2>

        {/* Sub A: input → output */}
        <div className="mt-14 grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="text-xs font-semibold tracking-widest text-muted-foreground">YOUR INPUT</div>
            <div className="mt-3 rounded-xl bg-muted p-5 font-mono-code text-sm text-foreground/90">
              "User should be able to log in with valid credentials. System must reject invalid passwords and log failed attempts."
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center text-accent">
            <Sparkles size={28} />
            <ArrowRight size={32} className="my-1" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-card border-2 border-accent rounded-2xl p-6 shadow-glow">
            <div className="text-xs font-semibold tracking-widest text-accent">AI GENERATED OUTPUT — 16 TEST CASES</div>
            <table className="mt-3 w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr><th className="py-2 text-left">ID</th><th className="text-left">Title</th><th className="text-left">Priority</th><th className="text-left">Type</th></tr>
              </thead>
              <tbody className="font-mono-code">
                <tr className="border-b border-border/50"><td className="py-2">TC-001</td><td>Valid User Login</td><td className="text-accent">HIGH</td><td>Happy</td></tr>
                <tr><td className="py-2">TC-002</td><td>Invalid Password</td><td className="text-accent">HIGH</td><td>Negative</td></tr>
              </tbody>
            </table>
            <div className="mt-4 flex flex-wrap gap-2">
              {["+ 14 more", "Edge Cases", "Security", "Boundary", "Cross-Platform"].map((b) => (
                <span key={b} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{b}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sub B: Coverage matrix */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="font-display text-2xl md:text-3xl text-center text-foreground">6 Scenario Types. Zero Manual Effort.</h3>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Scenario Type</th>
                  <th className="py-3 px-4 font-medium">Manual</th>
                  <th className="py-3 px-4 font-medium">API</th>
                  <th className="py-3 px-4 font-medium">UI</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map(([name, m, a, u], i) => (
                  <motion.tr key={name as string}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.05 }}
                    className="border-t border-border">
                    <td className="py-3 px-4 font-medium text-foreground">✅ {name}</td>
                    {[m, a, u].map((v, idx) => (
                      <td key={idx} className="text-center py-3 px-4">
                        {v ? <Check size={18} className="inline text-accent" /> : <Minus size={18} className="inline text-muted-foreground/60" />}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub C: Before vs After */}
        <div className="mt-20 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="rounded-2xl bg-muted/60 border border-border p-7">
            <h4 className="font-display text-2xl text-muted-foreground">Before QAGen AI</h4>
            <ul className="mt-4 space-y-3">
              {before.map((b) => (
                <li key={b} className="flex gap-3 text-foreground/80"><X size={18} className="text-destructive mt-0.5 shrink-0" /><span>{b}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-primary text-white border-2 border-accent p-7 shadow-glow">
            <h4 className="font-display text-2xl text-accent">After QAGen AI</h4>
            <ul className="mt-4 space-y-3">
              {after.map((b) => (
                <li key={b} className="flex gap-3"><Check size={18} className="text-accent mt-0.5 shrink-0" /><span>{b}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
