import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ClipboardList, Monitor, Plug, Copy, Check, LogOut, Link2, X as XIcon } from "lucide-react";
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
  ui: `import { test, expect } from '@playwright/test';

test.describe('Login flow — UI', () => {
  test('TC-001 valid login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('TC-002 invalid password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('wrong-pass');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('TC-003 responsive layout — mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });
});`,
  api: `import { test, expect, request } from '@playwright/test';

test.describe('Auth API', () => {
  test('POST /api/login — valid credentials returns 200 + token', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'user@example.com', password: 'Password@123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
  });

  test('POST /api/login — invalid password returns 401', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'user@example.com', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/login — rate limit after 5 attempts', async ({ request }) => {
    for (let i = 0; i < 5; i++) {
      await request.post('/api/login', { data: { email: 'x@x.io', password: 'no' } });
    }
    const res = await request.post('/api/login', { data: { email: 'x@x.io', password: 'no' } });
    expect(res.status()).toBe(429);
  });

  test('POST /api/login — SQL injection payload safely rejected', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: "' OR 1=1 --", password: 'x' },
    });
    expect([400, 401]).toContain(res.status());
  });
});`,
};

const STATS = [
  { label: "Total", value: 16 },
  { label: "Manual", value: 3 },
  { label: "API", value: 6 },
  { label: "UI", value: 7 },
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
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
      toast.success("Generated 16 test cases across 6 scenario types");
    }, 1400);
  }

  function handleCopy() {
    navigator.clipboard.writeText(SAMPLE[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function handleLogout() {
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
            <div className="border-b border-border px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      tab === t.id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>
              {generated && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {copied ? <><Check size={14} className="text-accent" /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              )}
            </div>

            {!generated ? (
              <div className="flex-1 grid place-items-center p-12 text-center">
                <div>
                  <div className="mx-auto h-14 w-14 rounded-full bg-accent/10 grid place-items-center text-accent">
                    <Sparkles size={24} />
                  </div>
                  <p className="mt-4 font-display text-xl text-foreground">Your test suite will appear here</p>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    {loading ? "Analyzing requirement, planning coverage, generating cases…" : "Enter a requirement on the left and click Generate."}
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
                <pre className="flex-1 overflow-auto bg-primary-dark text-white/90 p-5 font-mono-code text-xs leading-relaxed whitespace-pre">
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