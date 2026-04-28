import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 text-center" style={{ background: "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)" }}>
      <div className="container">
        <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight">Stop Writing Test Cases Manually.</h2>
        <p className="mt-5 text-lg text-white/90 max-w-2xl mx-auto">
          See how your team ships faster — without sacrificing QA quality.
        </p>
        <Link to="/demo" className="inline-flex items-center gap-2 mt-9 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary-dark shadow-card hover:scale-[1.04] transition-transform">
          Request Your Demo →
        </Link>
        <p className="mt-4 text-sm text-white/80">No commitment. No credit card. Just a 30-minute live demo.</p>
      </div>
    </section>
  );
}
