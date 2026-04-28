import { motion } from "framer-motion";
import { Brain, BookOpen, Settings, CheckCircle2, FileText } from "lucide-react";

const steps = [
  { n: "01", icon: Brain, title: "Planner Agent", desc: "Parses your AC, user story, or plain text. Detects intent, domain & tech stack." },
  { n: "02", icon: BookOpen, title: "Context Gathering", desc: "RAG retrieves past test cases. Tool calling fetches live Jira tickets, API docs & DB schemas." },
  { n: "03", icon: Settings, title: "Generator Agent", desc: "Creates manual test cases + Playwright UI & API automation scripts simultaneously." },
  { n: "04", icon: CheckCircle2, title: "Review Agent", desc: "Verifies all 6 coverage categories. Sends gaps back to Generator automatically." },
  { n: "05", icon: FileText, title: "Formatter Agent", desc: "Delivers clean Markdown — ready for Confluence, Notion, or any test management tool." },
];

export default function HowItWorks() {
  return (
    <section className="mesh-bg text-white py-20 lg:py-28" id="how">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-5xl tracking-tight">
            A 5-Step AI Pipeline That Thinks Like Your Best QA Engineer
          </h2>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-5 lg:gap-4 relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative glass rounded-2xl p-6 text-center"
            >
              <div className="mx-auto h-12 w-12 rounded-xl bg-accent text-primary-dark grid place-items-center font-bold font-mono-code shadow-glow">
                {s.n}
              </div>
              <s.icon className="mx-auto mt-4 text-accent" size={28} />
              <h3 className="mt-3 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-white/70">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px border-t-2 border-dashed border-accent/50" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
