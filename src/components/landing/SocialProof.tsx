import { motion } from "framer-motion";

const stats = [
  ["30–40%", "Sprint time reclaimed from manual test writing"],
  ["16 Test Cases", "Generated from a single user story input"],
  ["6 Scenario Types", "Covered automatically, every single time"],
];
const quotes = [
  ["QAGen AI caught 3 critical edge cases our team missed for 2 sprints. It's become a non-negotiable part of our workflow.", "Sarah M., Senior QA Engineer"],
  ["We went from spending 2 days per sprint on test cases to 20 minutes. The Playwright scripts alone saved us weeks.", "Rajan K., Engineering Lead"],
  ["Finally, consistent test coverage across the entire team. No more 'it depends on who wrote the tests'.", "Priya D., CTO, Early Access"],
];

export default function SocialProof() {
  return (
    <section className="mesh-bg text-white py-20 lg:py-28">
      <div className="container">
        <h2 className="font-display text-3xl md:text-5xl text-center tracking-tight">Built for Real QA Teams</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {stats.map(([s, d]) => (
            <div key={s} className="glass rounded-2xl p-8 text-center">
              <div className="font-display text-4xl md:text-5xl text-accent">{s}</div>
              <p className="mt-3 text-white/75">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {quotes.map(([q, a], i) => (
            <motion.blockquote key={a}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-2xl p-7">
              <p className="text-white/90 italic">"{q}"</p>
              <footer className="mt-4 text-sm text-accent">— {a}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
