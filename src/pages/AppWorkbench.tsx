import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ClipboardList, Monitor, Plug, Copy, Check, LogOut, Link2, X as XIcon, Brain, Shield, Layers } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";

type Tab = "manual" | "ui" | "api";

const SAMPLE = {
  manual: `Test Case ID: TC-001
Title: Valid User Login with Correct Credentials
Priority: High
Type: Happy Path
Preconditions: User account exists and is active

Steps:
  1. Navigate to login page          → Login page is displayed
  2. Enter email: user@example.com   → Email accepted
  3. Enter password: Password@123    → Password masked
  4. Click "Login"                   → Loading indicator appears
  5. Wait for response               → Redirected to /dashboard

Expected: User is authenticated and lands on the dashboard.

----------------------------------------------------------------
Test Case ID: TC-002
Title: Login with Invalid Password
Priority: High
Type: Negative
Preconditions: User account exists

Steps:
  1. Navigate to login page                → Page loads
  2. Enter valid email                     → Accepted
  3. Enter wrong password                  → Masked
  4. Click "Login"                         → Error shown
  5. Observe failed-attempt counter        → Incremented

Expected: "Invalid credentials" error, no session created.`,
  ui: `import { test, expect, devices } from '@playwright/test';

test.describe('Login — UI Automation (full coverage)', () => {
  // ───── Happy Path ─────
  test('TC-UI-001 [Happy Path] valid login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('TC-UI-002 [Happy Path] "Remember me" persists session', async ({ page, context }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('Password@123');
    await page.getByLabel(/remember me/i).check();
    await page.getByRole('button', { name: /sign in/i }).click();
    const cookies = await context.cookies();
    expect(cookies.find(c => c.name === 'session')?.expires).toBeGreaterThan(Date.now() / 1000);
  });

  // ───── Negative ─────
  test('TC-UI-003 [Negative] invalid password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('wrong-pass');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('TC-UI-004 [Negative] empty fields show validation errors', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  // ───── Edge Cases ─────
  test('TC-UI-005 [Edge] email with leading/trailing spaces is trimmed', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('  user@example.com  ');
    await page.getByLabel('Password').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('TC-UI-006 [Edge] unicode + emoji password accepted', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('intl@example.com');
    await page.getByLabel('Password').fill('Pässwörd🔐123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // ───── Boundary ─────
  test('TC-UI-007 [Boundary] password at min length (8) succeeds', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('min@example.com');
    await page.getByLabel('Password').fill('Pass@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('TC-UI-008 [Boundary] password below min length blocked', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('Pa@1');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  // ───── Security ─────
  test('TC-UI-009 [Security] XSS payload in email is escaped', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('<script>alert(1)</script>@x.io');
    await page.getByLabel('Password').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('TC-UI-010 [Security] password field uses type="password"', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  });

  // ───── Cross-Platform ─────
  test('TC-UI-011 [Cross-Platform] iPhone 13 viewport renders form', async ({ browser }) => {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await ctx.newPage();
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await ctx.close();
  });

  test('TC-UI-012 [Cross-Platform] tablet landscape layout', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
  });
});`,
  api: `import { test, expect } from '@playwright/test';

test.describe('Auth API — Automation (full coverage)', () => {
  // ───── Happy Path ─────
  test('TC-API-001 [Happy Path] valid credentials returns 200 + token', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'user@example.com', password: 'Password@123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.user.email).toBe('user@example.com');
  });

  test('TC-API-002 [Happy Path] response schema matches contract', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'user@example.com', password: 'Password@123' },
    });
    const body = await res.json();
    expect(body).toMatchObject({
      token: expect.any(String),
      user: { id: expect.any(String), email: expect.any(String) },
      expiresIn: expect.any(Number),
    });
  });

  // ───── Negative ─────
  test('TC-API-003 [Negative] invalid password returns 401', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'user@example.com', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
  });

  test('TC-API-004 [Negative] missing fields returns 400', async ({ request }) => {
    const res = await request.post('/api/login', { data: {} });
    expect(res.status()).toBe(400);
  });

  test('TC-API-005 [Negative] non-existent user returns 401 (no enumeration)', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'ghost@example.com', password: 'Password@123' },
    });
    expect(res.status()).toBe(401);
  });

  // ───── Edge Cases ─────
  test('TC-API-006 [Edge] email is case-insensitive', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'USER@Example.COM', password: 'Password@123' },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-API-007 [Edge] extra unknown fields are ignored', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'user@example.com', password: 'Password@123', admin: true },
    });
    const body = await res.json();
    expect(body.user.role).not.toBe('admin');
  });

  // ───── Boundary ─────
  test('TC-API-008 [Boundary] 8-char password accepted', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'min@example.com', password: 'Pass@123' },
    });
    expect([200, 401]).toContain(res.status());
  });

  test('TC-API-009 [Boundary] 256-char email rejected', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'a'.repeat(250) + '@x.io', password: 'Password@123' },
    });
    expect(res.status()).toBe(400);
  });

  // ───── Security ─────
  test('TC-API-010 [Security] SQL injection payload safely rejected', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: "' OR 1=1 --", password: 'x' },
    });
    expect([400, 401]).toContain(res.status());
  });

  test('TC-API-011 [Security] rate limit triggers after 5 attempts', async ({ request }) => {
    for (let i = 0; i < 5; i++) {
      await request.post('/api/login', { data: { email: 'x@x.io', password: 'no' } });
    }
    const res = await request.post('/api/login', { data: { email: 'x@x.io', password: 'no' } });
    expect(res.status()).toBe(429);
    expect(res.headers()['retry-after']).toBeDefined();
  });

  test('TC-API-012 [Security] response never contains password hash', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'user@example.com', password: 'Password@123' },
    });
    const text = await res.text();
    expect(text).not.toMatch(/passwordHash|bcrypt|\\$2[aby]\\$/i);
  });

  // ───── Cross-Platform ─────
  test('TC-API-013 [Cross-Platform] CORS headers present for web origin', async ({ request }) => {
    const res = await request.post('/api/login', {
      headers: { Origin: 'https://app.example.com' },
      data: { email: 'user@example.com', password: 'Password@123' },
    });
    expect(res.headers()['access-control-allow-origin']).toBeTruthy();
  });
});`,
};

const STATS = [
  { label: "Total", value: 27 },
  { label: "Manual", value: 2 },
  { label: "UI", value: 12 },
  { label: "API", value: 13 },
];

type Integration = {
  id: string;
  name: string;
  desc: string;
  color: string;
  letter: string;
};

const INTEGRATIONS: Integration[] = [
  { id: "jira",       name: "Jira",          desc: "Pull tickets & acceptance criteria",  color: "#2684FF", letter: "J" },
  { id: "azure",      name: "Azure DevOps",  desc: "Sync work items & test plans",        color: "#0078D4", letter: "A" },
  { id: "github",     name: "GitHub",        desc: "Read issues, PRs & specs",            color: "#24292F", letter: "G" },
  { id: "gitlab",     name: "GitLab",        desc: "Sync issues & merge requests",        color: "#FC6D26", letter: "G" },
  { id: "confluence", name: "Confluence",    desc: "Import PRDs & design docs",           color: "#0052CC", letter: "C" },
  { id: "notion",     name: "Notion",        desc: "Pull specs from Notion pages",        color: "#111827", letter: "N" },
  { id: "linear",     name: "Linear",        desc: "Sync issues & cycles",                color: "#5E6AD2", letter: "L" },
  { id: "slack",      name: "Slack",         desc: "Notify on test generation",           color: "#4A154B", letter: "S" },
];

export default function AppWorkbench() {
  const navigate = useNavigate();
  const [input, setInput] = useState(
    "User should be able to log in with valid credentials. System must reject invalid passwords and log failed attempts."
  );
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [tab, setTab] = useState<Tab>("manual");
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState<string[]>([]);
  const [showIntegrations, setShowIntegrations] = useState(true);
  const [progress, setProgress] = useState(0);
  const [agentIdx, setAgentIdx] = useState(0);

  const AGENTS = [
    { name: "Requirement Analyzer", icon: Brain,        desc: "Parsing user story & acceptance criteria" },
    { name: "Coverage Planner",     icon: Layers,       desc: "Mapping happy / negative / edge / boundary scenarios" },
    { name: "Manual Case Writer",   icon: ClipboardList,desc: "Drafting structured manual test cases" },
    { name: "Playwright UI Agent",  icon: Monitor,      desc: "Generating end-to-end UI automation" },
    { name: "Playwright API Agent", icon: Plug,         desc: "Generating API contract & integration tests" },
    { name: "Security Reviewer",    icon: Shield,       desc: "Adding XSS, SQLi, rate-limit & auth checks" },
  ];

  function toggleConnection(id: string) {
    setConnected((prev) => {
      if (prev.includes(id)) {
        toast.success(`Disconnected ${INTEGRATIONS.find((i) => i.id === id)?.name}`);
        return prev.filter((x) => x !== id);
      }
      toast.success(`Connected to ${INTEGRATIONS.find((i) => i.id === id)?.name}`);
      return [...prev, id];
    });
  }

  function handleGenerate() {
    if (!input.trim()) {
      toast.error("Please enter a requirement first");
      return;
    }
    setLoading(true);
    setGenerated(false);
    setProgress(0);
    setAgentIdx(0);
    const total = AGENTS.length;
    const stepMs = 550;
    let i = 0;
    const tick = () => {
      i += 1;
      setAgentIdx(Math.min(i, total - 1));
      setProgress(Math.round((i / total) * 100));
      if (i < total) {
        setTimeout(tick, stepMs);
      } else {
        setTimeout(() => {
          setLoading(false);
          setGenerated(true);
          toast.success("Generated 27 test cases across 6 scenario types");
        }, 300);
      }
    };
    setTimeout(tick, stepMs);
  }

  function handleCopy() {
    navigator.clipboard.writeText(SAMPLE[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function handleLogout() {
    localStorage.removeItem("qagen_auth");
    toast.success("Logged out");
    navigate("/");
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "manual", label: "Manual Test Cases", icon: ClipboardList },
    { id: "ui", label: "Playwright UI", icon: Monitor },
    { id: "api", label: "Playwright API", icon: Plug },
  ];

  return (
    <div className="min-h-screen bg-surface-light flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest text-accent border border-accent/40 rounded-full px-3 py-1 bg-accent/10">
              WORKBENCH
            </span>
            <h1 className="mt-3 font-display text-3xl md:text-4xl text-foreground tracking-tight">
              Generate Production-Grade Test Cases
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Paste a requirement, acceptance criteria, or user story. Our AI returns manual cases, Playwright UI scripts, and Playwright API scripts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIntegrations((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
            >
              <Link2 size={16} />
              Integrations
              {connected.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-primary-dark text-[11px] font-bold">
                  {connected.length}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>

        {showIntegrations && (
          <div className="mt-6 bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs font-semibold tracking-widest text-muted-foreground">CONNECT YOUR TOOLS</div>
                <h2 className="mt-1 font-display text-xl text-foreground">
                  Ground tests in your real project context
                </h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                  Connect Jira, Azure DevOps, GitHub and more so QAGen can pull live tickets, acceptance criteria and API contracts.
                </p>
              </div>
              <button
                onClick={() => setShowIntegrations(false)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Hide integrations"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {INTEGRATIONS.map((it) => {
                const isOn = connected.includes(it.id);
                return (
                  <button
                    key={it.id}
                    onClick={() => toggleConnection(it.id)}
                    className={`group relative text-left rounded-xl border p-4 transition shadow-sm ${
                      isOn
                        ? "border-accent bg-accent/5 ring-1 ring-accent/40"
                        : "border-border bg-card hover:border-accent/60 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-lg grid place-items-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: it.color }}
                      >
                        {it.letter}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">{it.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{it.desc}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          isOn ? "text-accent" : "text-muted-foreground"
                        }`}
                      >
                        {isOn ? "Connected" : "Not connected"}
                      </span>
                      <span
                        className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${
                          isOn ? "bg-accent text-primary-dark" : "border border-border text-muted-foreground"
                        }`}
                      >
                        {isOn ? <Check size={12} /> : <Plug size={12} />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              {connected.length === 0
                ? "Tip: you can also generate tests from raw text — connecting tools is optional."
                : `${connected.length} integration${connected.length > 1 ? "s" : ""} connected — your generated tests will reference real tickets and contracts.`}
            </p>
          </div>
        )}

        <div className="mt-8 grid lg:grid-cols-[5fr_7fr] gap-6">
          {/* INPUT */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="text-xs font-semibold tracking-widest text-muted-foreground">REQUIREMENT INPUT</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              placeholder="e.g. As a user, I want to reset my password via email so that I can regain access to my account..."
              className="mt-3 w-full rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground font-mono-code focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            />
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {["Happy Path", "Negative", "Edge Cases", "Boundary", "Security", "Cross-Platform"].map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white py-3 font-semibold hover:bg-primary-light transition disabled:opacity-70"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Generating…</> : <><Sparkles size={18} /> Generate Test Cases</>}
            </button>
          </div>

          {/* OUTPUT */}
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col">
            {/* Tabs header — always visible & prominent */}
            <div className="border-b border-border px-3 sm:px-5 pt-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-1 flex-wrap">
                {tabs.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
                        active
                          ? "border-accent text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <t.icon size={15} /> {t.label}
                    </button>
                  );
                })}
              </div>
              {generated && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground pb-2"
                >
                  {copied ? <><Check size={14} className="text-accent" /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-foreground">Generating your test suite…</div>
                  <div className="text-sm font-mono text-primary">{progress}%</div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <ul className="mt-5 space-y-2.5">
                  {AGENTS.map((a, i) => {
                    const done = i < agentIdx || progress === 100;
                    const active = i === agentIdx && progress < 100;
                    return (
                      <li
                        key={a.name}
                        className={`flex items-start gap-3 rounded-lg border p-3 transition ${
                          active
                            ? "border-accent bg-accent/5"
                            : done
                              ? "border-border bg-muted/40"
                              : "border-border bg-card opacity-70"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-md grid place-items-center shrink-0 ${
                            done ? "bg-accent text-primary-dark" : active ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {done ? <Check size={16} /> : active ? <Loader2 size={16} className="animate-spin" /> : <a.icon size={16} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-foreground truncate">{a.name}</div>
                            <div className={`text-[11px] font-semibold uppercase tracking-wider ${
                              done ? "text-accent" : active ? "text-primary" : "text-muted-foreground"
                            }`}>
                              {done ? "Done" : active ? "Running" : "Queued"}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{a.desc}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : !generated ? (
              <div className="flex-1 grid place-items-center p-12 text-center">
                <div>
                  <div className="mx-auto h-14 w-14 rounded-full bg-accent/10 grid place-items-center text-accent">
                    <Sparkles size={24} />
                  </div>
                  <p className="mt-4 font-display text-xl text-foreground">Your test suite will appear here</p>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    Enter a requirement on the left and click Generate. You'll get manual cases, Playwright UI scripts, and Playwright API scripts in 3 tabs.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 border-b border-border">
                  {STATS.map((s) => (
                    <div key={s.label} className="px-4 py-3 text-center border-r border-border last:border-r-0">
                      <div className="font-display text-2xl text-primary">{s.value}</div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
                <pre className="flex-1 overflow-auto bg-primary-dark text-white/90 p-5 font-mono-code text-xs leading-relaxed whitespace-pre max-h-[600px]">
{SAMPLE[tab]}
                </pre>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}