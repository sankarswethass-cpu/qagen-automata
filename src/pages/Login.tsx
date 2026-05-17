import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const forcedMode = params.get("mode");
  const hasSignedUp = typeof window !== "undefined" && localStorage.getItem("qagen_signed_up") === "1";
  const mode: "login" | "signup" =
    forcedMode === "signup" ? "signup" : forcedMode === "login" ? "login" : hasSignedUp ? "login" : "signup";
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const inputClass = (name: string) =>
    `w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition ${
      errors[name] ? "border-destructive" : "border-border"
    }`;

  function validate(form: FormData, fields: string[]): FieldErrors {
    const e: FieldErrors = {};
    fields.forEach((f) => { if (!String(form.get(f) || "").trim()) e[f] = "This field is required"; });
    const email = String(form.get("email") || "");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (mode === "signup") {
      const p = String(form.get("password") || "");
      const c = String(form.get("confirm") || "");
      if (p && c && p !== c) e.confirm = "Passwords don't match";
    }
    return e;
  }

  async function handleLogin(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const e = validate(data, ["email", "password"]);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") || "").trim(),
          password: String(data.get("password") || ""),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors({ password: err.detail || "Invalid email or password" });
        return;
      }
      const { access_token } = await res.json();
      sessionStorage.setItem("qagen_token", access_token);
      toast.success("Welcome back! Opening workbench…");
      navigate("/app");
    } catch {
      setErrors({ password: "Could not connect to server. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const e = validate(data, ["name", "email", "company", "password", "confirm"]);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") || "").trim(),
          password: String(data.get("password") || ""),
          name: String(data.get("name") || "").trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors({ email: err.detail || "Signup failed. Please try again." });
        return;
      }
      const body = await res.json();
      localStorage.setItem("qagen_signed_up", "1");
      localStorage.setItem("qagen_email", String(data.get("email") || "").trim());
      if (body.email_confirmation_required) {
        toast.info("Check your email to confirm your account, then sign in.");
        navigate("/login?mode=login");
        return;
      }
      sessionStorage.setItem("qagen_token", body.access_token);
      toast.success("Account created! Opening workbench…");
      navigate("/app");
    } catch {
      setErrors({ email: "Could not connect to server. Please try again." });
    } finally {
      setSubmitting(false);
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
            <h2 className="font-display text-3xl text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your QA workbench."
                : "Sign up to get started with QAGen AI."}
            </p>

            {mode === "login" ? (
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
                <button type="submit" disabled={submitting} className="w-full rounded-lg bg-primary text-white py-3 font-semibold hover:bg-primary-light transition-colors disabled:opacity-70">
                  {submitting ? "Signing in…" : "Sign In"}
                </button>
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
                <button type="submit" disabled={submitting} className="w-full rounded-lg bg-primary text-white py-3 font-semibold hover:bg-primary-light transition-colors disabled:opacity-70">
                  {submitting ? "Creating account…" : "Create Account"}
                </button>
                <p className="text-xs text-center text-muted-foreground">By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.</p>
              </form>
            )}

            <p className="mt-6 text-sm text-center text-muted-foreground">
              {mode === "login"
                ? <>Don't have an account? <Link to="/login?mode=signup" className="text-accent font-medium hover:underline">Sign Up</Link></>
                : <>Already have an account? <Link to="/login?mode=login" className="text-accent font-medium hover:underline">Log In</Link></>}
            </p>
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
