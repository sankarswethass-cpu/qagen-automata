import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, Search, Lock, Link2, FileCode, BarChart3, Clock, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";

const pills = [
  { icon: Zap, label: "AI Test Generation" },
  { icon: Search, label: "Edge Case Detection" },
  { icon: Lock, label: "Security Coverage" },
  { icon: Link2, label: "Jira Integration" },
  { icon: FileCode, label: "Playwright Scripts" },
  { icon: BarChart3, label: "Coverage Analytics" },
];

const cards = [
  { icon: Zap, title: "Lightning Fast", desc: "Generate 16 test cases in seconds, not days" },
  { icon: Clock, title: "Always Accurate", desc: "6 scenario types covered every run" },
  { icon: Target, title: "Precision Coverage", desc: "Fine-tuned for your domain and team patterns" },
  { icon: TrendingUp, title: "Scalable Design", desc: "Grows with your team and project complexity" },
];

type FieldErrors = Record<string, string>;

export default function Login() {
  const navigate = useNavigate();
  const hasSignedUp = typeof window !== "undefined" && localStorage.getItem("qagen_signed_up") === "1";
  const [tab, setTab] = useState<"login" | "signup">(hasSignedUp ? "login" : "signup");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const inputClass = (name: string) =>
    `w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition ${
      errors[name] ? "border-destructive" : "border-border"
    }`;

  function validate(form: FormData, fields: string[]): FieldErrors {
    const e: FieldErrors = {};
    fields.forEach((f) => { if (!String(form.get(f) || "").trim()) e[f] = "This field is required"; });
    const email = String(form.get("email") || "");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (tab === "signup") {
      const p = String(form.get("password") || "");
      const c = String(form.get("confirm") || "");
      if (p && c && p !== c) e.confirm = "Passwords don't match";
    }
    return e;
  }

  function handleLogin(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const e = validate(data, ["email", "password"]);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      if (localStorage.getItem("qagen_signed_up") !== "1") {
        toast.error("Please sign up first to create an account.");
        setTab("signup");
        return;
      }
      toast.success("Welcome back! Opening workbench…");
      localStorage.setItem("qagen_auth", "1");
      ev.currentTarget.reset();
      setTimeout(() => navigate("/app"), 400);
    }
  }

  function handleSignup(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const e = validate(data, ["name", "email", "company", "password", "confirm"]);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      toast.success("Account created! Please sign in to continue.");
      localStorage.setItem("qagen_signed_up", "1");
      ev.currentTarget.reset();
      setErrors({});
      setTab("login");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 grid lg:grid-cols-[55fr_45fr]">
        {/* LEFT */}
        <div className="mesh-bg text-white p-10 lg:p-14 flex flex-col">
          <h1 className="font-display text-4xl lg:text-5xl tracking-tight max-w-lg">
            Streamline Your QA Operations
          </h1>
          <p className="mt-5 text-white/75 max-w-md">
            Unify your test generation, automate processes, and empower your QA team with a single, intelligent AI platform.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 max-w-xl">
            {pills.map((p) => (
              <span key={p.label} className="pill"><p.icon size={14} className="text-accent" /> {p.label}</span>
            ))}
          </div>
          <div className="mt-auto pt-10 grid sm:grid-cols-2 gap-4 max-w-xl">
            {cards.map((c) => (
              <div key={c.title} className="glass rounded-xl p-5">
                <c.icon size={22} className="text-accent" />
                <div className="mt-3 font-display text-lg">{c.title}</div>
                <p className="mt-1 text-sm text-white/70">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-surface-light flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <h2 className="font-display text-3xl text-foreground">Welcome to QAGen AI</h2>
            <p className="mt-2 text-muted-foreground">Sign in to access your QA dashboard.</p>

            <div className="mt-7 flex border-b border-border">
              {(["login", "signup"] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setErrors({}); }}
                  className={`px-5 py-2.5 text-sm font-semibold capitalize -mb-px border-b-2 transition-colors ${tab === t ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
                <div>
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <input name="email" type="email" placeholder="you@company.com" className={inputClass("email") + " mt-1"} />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative mt-1">
                    <input name="password" type={showPass ? "text" : "password"} placeholder="••••••••" className={inputClass("password") + " pr-11"} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="text-right">
                  <a href="#" className="text-sm font-medium text-accent hover:underline">Forgot Password?</a>
                </div>
                <button type="submit" className="w-full rounded-lg bg-primary text-white py-3 font-semibold hover:bg-primary-light transition-colors">Sign In</button>
                <Divider />
                <GoogleButton />
                <p className="text-sm text-center text-muted-foreground">Don't have an account? <button type="button" onClick={() => setTab("signup")} className="text-accent font-medium hover:underline">Sign up</button></p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="mt-6 space-y-4" noValidate>
                <Field label="Full Name" name="name" placeholder="Jane Cooper" errors={errors} inputClass={inputClass} />
                <Field label="Work Email" name="email" type="email" placeholder="jane@company.com" errors={errors} inputClass={inputClass} />
                <Field label="Company Name" name="company" placeholder="Acme Inc." errors={errors} inputClass={inputClass} />
                <div>
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative mt-1">
                    <input name="password" type={showPass ? "text" : "password"} placeholder="••••••••" className={inputClass("password") + " pr-11"} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative mt-1">
                    <input name="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••" className={inputClass("confirm") + " pr-11"} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
                </div>
                <button type="submit" className="w-full rounded-lg bg-primary text-white py-3 font-semibold hover:bg-primary-light transition-colors">Create Account</button>
                <Divider />
                <GoogleButton />
                <p className="text-sm text-center text-muted-foreground">Already have an account? <button type="button" onClick={() => setTab("login")} className="text-accent font-medium hover:underline">Sign in</button></p>
                <p className="text-xs text-center text-muted-foreground">By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.</p>
              </form>
            )}

            <p className="mt-10 text-xs text-center text-muted-foreground">© 2026 QAGen AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
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
function Divider() {
  return <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>;
}
function GoogleButton() {
  return (
    <button type="button" className="w-full rounded-lg border border-border bg-card py-2.5 font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-6-5.1c-2 1.4-4.4 2.1-6.9 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6 5.1c-.4.4 6.5-4.7 6.5-14.7 0-1.2-.1-2.3-.4-3.5z"/></svg>
      Continue with Google
    </button>
  );
}
