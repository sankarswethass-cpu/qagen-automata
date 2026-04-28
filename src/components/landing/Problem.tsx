import { motion } from "framer-motion";
import { Clock, AlertTriangle, CircleDashed, Turtle } from "lucide-react";

const items = [
  { icon: Clock, title: "Time Consuming", stat: "30–40% of sprint time", desc: "Engineers manually writing repetitive, pattern-based test cases." },
  { icon: AlertTriangle, title: "Inconsistent Coverage", stat: "Varies by engineer", desc: "One may run SQL injection checks. Another won't. Quality depends on individual habits." },
  { icon: CircleDashed, title: "Incomplete Testing", stat: "Edge cases missed", desc: "Boundary conditions and security scenarios skipped under deadline pressure." },
  { icon: Turtle, title: "Delayed QA", stat: "Always a lagging activity", desc: "Test cases written after development — never a proactive quality gate." },
];

export default function Problem() {
  return (
    <section className="bg-surface-light py-20 lg:py-28" id="problem">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-5xl text-foreground tracking-tight">
            Manual QA Is Silently Killing Your Sprint Velocity
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Every sprint, your team loses hours to repetitive, inconsistent, incomplete test writing.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 shadow-card border-l-4 border-primary"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <it.icon size={22} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-foreground">{it.title}</h3>
                  <div className="text-accent font-semibold text-sm mt-0.5">{it.stat}</div>
                  <p className="mt-2 text-muted-foreground">{it.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
