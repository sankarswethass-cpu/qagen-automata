import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Calendar, Clock, Video } from "lucide-react";
import PageShell from "@/components/site/PageShell";
import SEO from "@/components/site/SEO";

type Errors = Record<string, string>;
const teams = ["Just me", "2–10 people", "11–50 people", "51–200 people", "200+ people"];

export default function Demo() {
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<{ name: string; email: string } | null>(null);

  const inputClass = (n: string) =>
    `w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition ${
      errors[n] ? "border-destructive" : "border-border"
    }`;

  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const e: Errors = {};
    ["name", "email", "company", "team"].forEach((f) => { if (!String(data.get(f) || "").trim()) e[f] = "Required"; });
    const email = String(data.get("email") || "");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSubmitted({ name: String(data.get("name")), email });
    }
  }

  return (
    <PageShell>
      <SEO
        title="Request a Live Demo — QAGen AI"
        description="Book a personalised 30-minute QAGen AI demo. See how teams turn requirements into Playwright UI and API tests in seconds."
        path="/demo"
      />
      <section className="mesh-bg py-16 lg:py-24">
        <div className="container grid lg:grid-cols-[60fr_40fr] gap-10 items-start">
          {/* LEFT */}
          <div className="bg-card rounded-2xl shadow-card p-8 lg:p-10">
            {!submitted ? (
              <>
                <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">See QAGen AI in Action</h1>
                <p className="mt-3 text-muted-foreground">
                  Fill in your details and we'll schedule a personalised 30-minute live demo for your team.
                </p>
                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                  <Field label="Full Name" name="name" placeholder="Jane Cooper" errors={errors} inputClass={inputClass} />
                  <Field label="Work Email" name="email" type="email" placeholder="jane@company.com" errors={errors} inputClass={inputClass} />
                  <Field label="Company Name" name="company" placeholder="Acme Inc." errors={errors} inputClass={inputClass} />
                  <div>
                    <label className="text-sm font-medium text-foreground">Team Size</label>
                    <select name="team" defaultValue="" className={inputClass("team") + " mt-1"}>
                      <option value="" disabled>Select team size</option>
                      {teams.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    {errors.team && <p className="mt-1 text-xs text-destructive">{errors.team}</p>}
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-accent text-primary-dark py-4 font-semibold text-lg hover:scale-[1.01] transition-transform shadow-glow">
                    Request My Demo →
                  </button>
                </form>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}
                className="text-center py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="mx-auto h-20 w-20 rounded-full bg-accent grid place-items-center shadow-glow">
                  <Check size={44} className="text-primary-dark" strokeWidth={3} />
                </motion.div>
                <h2 className="font-display text-3xl md:text-4xl mt-6 text-foreground">You're on the list!</h2>
                <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
                  Thanks {submitted.name}! We'll reach out to <span className="text-accent font-medium">{submitted.email}</span> within 1 business day to schedule your demo.
                </p>
                <Link to="/" className="inline-block mt-7 rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition-colors">
                  Back to Home
                </Link>
              </motion.div>
            )}
          </div>

          {/* RIGHT */}
          <div className="glass-dark text-white rounded-2xl p-8 lg:p-10">
            <h3 className="font-display text-2xl">What to expect in your demo</h3>
            <ul className="mt-5 space-y-3 text-white/85">
              {[
                "Live walkthrough of AI test case generation from a real requirement",
                "See all 6 scenario types generated in real-time",
                "Playwright script output demo (UI + API)",
                "RAG + Jira integration showcase",
                "Q&A with the product team",
                "Custom pricing discussion for your team size",
              ].map((t) => (
                <li key={t} className="flex gap-3"><Check size={18} className="text-accent mt-0.5 shrink-0" /><span>{t}</span></li>
              ))}
            </ul>

            <h4 className="font-display text-xl mt-8">Timeline</h4>
            <ul className="mt-3 space-y-2 text-white/85 text-sm">
              <li className="flex items-center gap-2"><Calendar size={16} className="text-accent" /> Response within 1 business day</li>
              <li className="flex items-center gap-2"><Clock size={16} className="text-accent" /> Demo lasts approximately 30 minutes</li>
              <li className="flex items-center gap-2"><Video size={16} className="text-accent" /> Conducted via Google Meet or Zoom</li>
            </ul>

            <blockquote className="mt-8 rounded-xl border border-accent/30 bg-white/5 p-5">
              <p className="text-white/90 italic text-sm">"The demo alone showed us 3 ways QAGen AI would save our team hours every sprint. We signed up on the spot."</p>
              <footer className="mt-3 text-xs text-accent">— Rajan K., Engineering Lead</footer>
            </blockquote>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, name, type = "text", placeholder, errors, inputClass }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input name={name} type={type} placeholder={placeholder} className={inputClass(name) + " mt-1"} />
      {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]}</p>}
    </div>
  );
}
