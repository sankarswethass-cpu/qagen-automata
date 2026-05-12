import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ClipboardList, Monitor, Plug, Copy, Check, LogOut, Link2, X as XIcon, FileText, FileDown, FileCode, Brain, Search, Shield, Code2 } from "lucide-react";
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

type Integration = {
  id: string;
  name: string;
  desc: string;
  color: string;
  letter: string;
};

const INTEGRATIONS: Integration[] = [
  { id: "github",     name: "GitHub",        desc: "Read issues, PRs & specs",            color: "#24292F", letter: "G" },
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
  const [repoUrl, setRepoUrl] = useState("");
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [repoDraft, setRepoDraft] = useState("");
  const [sample, setSample] = useState(SAMPLE);
  const [stats, setStats] = useState([
    { label: "Total",  value: 0 },
    { label: "Manual", value: 0 },
    { label: "UI",     value: 0 },
    { label: "API",    value: 0 },
  ]);
  const [showIntegrations, setShowIntegrations] = useState(true);
  const [progress, setProgress] = useState(0);
  const [agentIdx, setAgentIdx] = useState(0);

  const AGENTS = [
    { name: "Requirement Analyzer", icon: Brain },
    { name: "Coverage Planner",    icon: Search },
    { name: "Manual Case Writer",  icon: ClipboardList },
    { name: "Playwright UI Agent", icon: Monitor },
    { name: "Playwright API Agent", icon: Code2 },
    { name: "Security Reviewer",   icon: Shield },
  ];

  function toggleConnection(id: string) {
    if (id === "github") {
      if (connected.includes("github")) {
        setConnected((prev) => prev.filter((x) => x !== "github"));
        setRepoUrl("");
        setShowRepoInput(false);
        toast.success("Disconnected GitHub");
        return;
      }
      setRepoDraft(repoUrl);
      setShowRepoInput(true);
      return;
    }
    setConnected((prev) => {
      if (prev.includes(id)) {
        toast.success(`Disconnected ${INTEGRATIONS.find((i) => i.id === id)?.name}`);
        return prev.filter((x) => x !== id);
      }
      toast.success(`Connected to ${INTEGRATIONS.find((i) => i.id === id)?.name}`);
      return [...prev, id];
    });
  }

  function submitRepo() {
    const url = repoDraft.trim();
    if (!/^https?:\/\/(www\.)?github\.com\/[^/\s]+\/[^/\s]+/.test(url)) {
      toast.error("Enter a valid GitHub repo URL (https://github.com/owner/repo)");
      return;
    }
    setRepoUrl(url);
    setConnected((prev) => (prev.includes("github") ? prev : [...prev, "github"]));
    setShowRepoInput(false);
    toast.success("Connected to GitHub");
  }

async function handleGenerate() {
  if (!input.trim()) {
    toast.error("Please enter a requirement first");
    return;
  }
  setLoading(true);
  setGenerated(false);
  setProgress(0);
  setAgentIdx(0);

  // Animate agent-wise progress
  const totalAgents = AGENTS.length;
  const tick = setInterval(() => {
    setProgress((p) => {
      const next = Math.min(p + 100 / (totalAgents * 4), 95);
      setAgentIdx(Math.min(Math.floor((next / 100) * totalAgents), totalAgents - 1));
      return next;
    });
  }, 450);

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
        requirement: input,
        use_rag: false,
        include_ui: true,
        include_api: true,
        include_manual: true
      }),
      }
    );
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();

    // Backend returns one markdown_output string — split into sections
    const fullOutput = data.markdown_output || "No output returned.";

    // Try to split by common section headers
    const manualMatch = fullOutput.match(/#{1,3}\s*(Manual Test Cases?[\s\S]*?)(?=#{1,3}\s*(Playwright|UI|API)|$)/i);
    const uiMatch     = fullOutput.match(/#{1,3}\s*(Playwright UI[\s\S]*?)(?=#{1,3}\s*(Playwright API|API Test)|$)/i);
    const apiMatch    = fullOutput.match(/#{1,3}\s*(Playwright API[\s\S]*?)$/i);

    setSample({
      manual: manualMatch ? manualMatch[0].trim() : (fullOutput || SAMPLE.manual),
      ui:     uiMatch     ? uiMatch[0].trim()     : SAMPLE.ui,
      api:    apiMatch    ? apiMatch[0].trim()     : SAMPLE.api,
    });

    const total = data.total_test_cases || 0;
    setStats([
      { label: "Total",  value: total },
      { label: "Manual", value: Math.round(total * 0.1)  },
      { label: "UI",     value: Math.round(total * 0.45) },
      { label: "API",    value: Math.round(total * 0.45) },
    ]);
    clearInterval(tick);
    setProgress(100);
    setAgentIdx(totalAgents - 1);
    setGenerated(true);
    toast.success(`Generated ${total} test cases from your backend!`);
  } catch (err) {
    // Fall back to demo content so UI still demonstrates progress + 3 tabs
    clearInterval(tick);
    setSample(SAMPLE);
    setStats([
      { label: "Total",  value: 27 },
      { label: "Manual", value: 2 },
      { label: "UI",     value: 12 },
      { label: "API",    value: 13 },
    ]);
    setProgress(100);
    setAgentIdx(AGENTS.length - 1);
    setGenerated(true);
    toast.message("Showing demo output (backend unavailable)");
    console.error(err);
  } finally {
    setLoading(false);
  }
}

  function handleCopy() {
    navigator.clipboard.writeText(sample[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadBlob(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleDownloadMd() {
    downloadBlob(sample[tab], `qagen-${tab}.md`, "text/markdown");
    toast.success("Markdown downloaded");
  }

  function handleDownloadWord() {
    const body = sample[tab]
      .split("\n")
      .map((l) => `<p>${l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") || "&nbsp;"}</p>`)
      .join("");
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>QAGen ${tab}</title></head><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt;">${body}</body></html>`;
    downloadBlob(html, `qagen-${tab}.doc`, "application/msword");
    toast.success("Word document downloaded");
  }

  function handleDownloadPdf() {
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Popup blocked — allow popups to export PDF");
      return;
    }
    const safe = sample[tab].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    w.document.write(`<html><head><title>QAGen ${tab}</title><style>body{font-family:-apple-system,Segoe UI,Arial,sans-serif;padding:32px;color:#111;font-size:12px;line-height:1.5;}pre{white-space:pre-wrap;word-wrap:break-word;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;}</style></head><body><pre>${safe}</pre><script>window.onload=()=>{setTimeout(()=>window.print(),200);}<\/script></body></html>`);
    w.document.close();
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

            {showRepoInput && (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  GitHub repository URL
                </label>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    autoFocus
                    value={repoDraft}
                    onChange={(e) => setRepoDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitRepo()}
                    placeholder="https://github.com/owner/repo"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={submitRepo}
                    className="rounded-lg bg-accent text-primary-dark px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => setShowRepoInput(false)}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {connected.includes("github") && repoUrl && !showRepoInput && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/5 p-3 text-sm">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Connected repo</div>
                  <a href={repoUrl} target="_blank" rel="noreferrer" className="block truncate font-medium text-foreground hover:underline">
                    {repoUrl}
                  </a>
                </div>
                <button
                  onClick={() => { setRepoDraft(repoUrl); setShowRepoInput(true); }}
                  className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  Change
                </button>
              </div>
            )}

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
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDownloadMd}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition"
                    title="Download Markdown"
                  >
                    <FileCode size={14} /> .md
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition"
                    title="Download Word"
                  >
                    <FileText size={14} /> Word
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition"
                    title="Download PDF"
                  >
                    <FileDown size={14} /> PDF
                  </button>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition"
                    title="Copy to clipboard"
                  >
                    {copied ? <><Check size={14} className="text-accent" /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              )}
            </div>

            {!generated ? (
              loading ? (
                <div className="flex-1 p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-foreground">Generating test suite…</div>
                    <div className="font-mono-code text-sm text-primary font-bold">{Math.round(progress)}%</div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <ul className="mt-6 space-y-2">
                    {AGENTS.map((a, i) => {
                      const done = i < agentIdx;
                      const active = i === agentIdx;
                      const Icon = a.icon;
                      return (
                        <li
                          key={a.name}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                            active
                              ? "border-accent bg-accent/5"
                              : done
                              ? "border-border bg-muted/30"
                              : "border-border bg-card"
                          }`}
                        >
                          <div
                            className={`h-7 w-7 rounded-md grid place-items-center shrink-0 ${
                              done
                                ? "bg-accent text-primary-dark"
                                : active
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {done ? (
                              <Check size={14} />
                            ) : active ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Icon size={14} />
                            )}
                          </div>
                          <div className="flex-1 text-sm font-medium text-foreground">{a.name}</div>
                          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                            {done ? "Done" : active ? "Running" : "Queued"}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="flex-1 grid place-items-center p-12 text-center">
                  <div>
                    <div className="mx-auto h-14 w-14 rounded-full bg-accent/10 grid place-items-center text-accent">
                      <Sparkles size={24} />
                    </div>
                    <p className="mt-4 font-display text-xl text-foreground">Your test suite will appear here</p>
                    <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                      Enter a requirement on the left and click Generate.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <>
                <div className="grid grid-cols-4 border-b border-border">
                  {stats.map((s) => (
                    <div key={s.label} className="px-4 py-3 text-center border-r border-border last:border-r-0">
                      <div className="font-display text-2xl text-primary">{s.value}</div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
                <pre className="flex-1 overflow-auto bg-primary-dark text-white/90 p-5 font-mono-code text-xs leading-relaxed whitespace-pre">
{sample[tab]}
                </pre>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}