import { motion } from "framer-motion";
import { ClipboardList, Monitor, Plug } from "lucide-react";

const cards = [
  { icon: ClipboardList, title: "Step-by-Step Manual Test Cases", desc: "Structured with preconditions, numbered steps, and expected results. Covers happy path, negative, edge cases, boundary conditions, and security.", badge: "Production-Grade" },
  { icon: Monitor, title: "Playwright UI Scripts (TypeScript)", desc: "Ready-to-run browser automation across Chromium, Firefox, and WebKit. Includes mobile viewport testing and responsive layout validation.", badge: "Cross-Browser" },
  { icon: Plug, title: "Playwright API Scripts (TypeScript)", desc: "Tests endpoint validation, rate limiting, authentication bypass, and schema compliance directly against your API contracts.", badge: "Full Coverage" },
];

export default function Outputs() {
  return (
    <section className="mesh-bg text-white py-20 lg:py-28" id="features">
      <div className="container">
        <h2 className="font-display text-3xl md:text-5xl text-center max-w-3xl mx-auto tracking-tight">
          Three Outputs. One Input. Zero Manual Effort.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.div key={c.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-7 hover:-translate-y-1 hover:shadow-glow transition-all">
              <c.icon size={36} className="text-accent" />
              <h3 className="mt-5 font-display text-2xl">{c.title}</h3>
              <p className="mt-3 text-white/75">{c.desc}</p>
              <span className="inline-block mt-5 text-xs font-semibold px-3 py-1 rounded-full bg-accent text-primary-dark">{c.badge}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
