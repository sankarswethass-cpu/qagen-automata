import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ClipboardList, Monitor, Plug, Copy, Check, LogOut, Link2, X as XIcon, FileText, FileDown, FileCode, Brain, Search, Shield, Code2, AlertTriangle, AlertCircle, Plus, FolderKanban, History as HistoryIcon, BarChart3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";
import SEO from "@/components/site/SEO";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type Tab = "manual" | "ui" | "api";

const SAMPLE = { manual: "", ui: "", api: "" };

// Strip any Playwright/automation code blocks from the manual section, so the
// Manual Test Cases tab only contains plain manual test cases.
function stripAutomationFromManual(md: string): string {
  if (!md) return md;
  // Remove fenced code blocks that look like Playwright/JS/TS automation
  return md
    .replace(/```(?:javascript|typescript|js|ts|playwright)[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?(?:from\s+['"]@playwright\/test['"]|playwright)[\s\S]*?```/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type Integration = {
  id: string;
  name: string;
  desc: string;
  color: string;
  letter: string;
};

const INTEGRATIONS: Integration[] = [
  { id: "github",     name: "GitHub",        desc: "Read issues, PRs & specs",            color: "#24292F", letter: "G" },
  { id: "website",    name: "Website",       desc: "Crawl a live URL for context",        color: "#2563EB", letter: "W" },
];

// ---------- Requirement validation ----------
type Validation =
  | { state: "ok" }
  | { state: "empty" }
  | { state: "mismatch" }
  | { state: "incomplete"; unclear: string[]; needed: string[]; example: string };

function validateRequirement(text: string): Validation {
  const t = text.trim();
  if (!t) return { state: "empty" };
  const words = t.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const detailRegex = /\b(when|given|then|should|must|api|endpoint|click|input|field|response|status|error|valid|invalid|redirect|return|expect)\b/i;
  const hasDetail = detailRegex.test(t);
  const hasActor = /\b(user|admin|guest|customer|system|client|service)\b/i.test(t);

  if (wordCount < 12 || !hasDetail || !hasActor) {
    const snippet = t.length > 140 ? t.slice(0, 140) + "…" : t;
    return {
      state: "incomplete",
      unclear: [
        `The requirement is too vague: "${snippet}" — it lacks specifics about the flow, inputs, and expected outcomes.`,
        "No success criteria, inputs, outputs, or constraints are provided.",
      ],
      needed: [
        "Who is the actor (user role, system, third-party)?",
        "What inputs are involved and what are their validation rules?",
        "What is the expected outcome on success (redirect, response, UI state)?",
        "What should happen on failure, invalid input, or edge cases?",
        "Any non-functional constraints (performance, security, permissions)?",
      ],
      example:
        '"As a registered user, I want to log in with my username and password, and upon successful authentication, I should be redirected to a personalized dashboard showing my account summary and recent transactions."',
    };
  }
  return { state: "ok" };
}

// ---------- Optimised prompt builder ----------
// When the user's requirement is incomplete, build a richer, well-structured
// prompt they can use as-is. Keeps the user's intent but adds the standard
// acceptance-criteria scaffolding the test generator expects.
function buildOptimisedPrompt(raw: string): string {
  const t = (raw || "").trim();
  const seed = t || "the feature described above";
  // Try to detect a feature noun (login, signup, checkout, search, password reset...)
  const featureMatch = t.match(/\b(login|sign[- ]?in|sign[- ]?up|register|registration|checkout|payment|password reset|forgot password|search|upload|profile|dashboard|logout|booking|subscription)\b/i);
  const feature = featureMatch ? featureMatch[0].toLowerCase() : "the requested feature";
  return [
    `As a registered user, I want to use ${feature} so that I can achieve the outcome described: "${seed}".`,
    ``,
    `Acceptance Criteria:`,
    `1. Actor & Preconditions`,
    `   - The actor is an authenticated end user (or guest where applicable).`,
    `   - The user is on the relevant screen / endpoint for ${feature}.`,
    ``,
    `2. Inputs & Validation`,
    `   - All required fields must be provided and validated (format, length, allowed characters).`,
    `   - Invalid or missing inputs must show clear, field-level error messages.`,
    ``,
    `3. Happy Path`,
    `   - When the user submits valid inputs, the system processes the request and returns a success response (HTTP 200 / UI confirmation).`,
    `   - The user is redirected or shown the expected next state.`,
    ``,
    `4. Negative & Edge Cases`,
    `   - Invalid credentials / inputs return an appropriate error (e.g. 400/401) without leaking sensitive info.`,
    `   - Boundary values (min/max length, empty, very large input, unicode) are handled gracefully.`,
    ``,
    `5. Non-Functional`,
    `   - Response time should be under 2s for the happy path.`,
    `   - Sensitive data must be transmitted over HTTPS and never logged.`,
    `   - Rate limiting should protect against brute-force or abuse.`,
    ``,
    `6. Expected Outcome`,
    `   - On success: clear confirmation and correct state transition.`,
    `   - On failure: actionable error message and no partial state changes.`,
  ].join("\n");
}

// ---------- Projects & history (localStorage) ----------
type Project = { id: string; name: string; createdAt: number };
type HistoryEntry = {
  id: string;
  projectId: string;
  requirement: string;
  createdAt: number;
  stats: { label: string; value: number }[];
  sample: { manual: string; ui: string; api: string };
};

const PROJECTS_KEY = "qagen_projects";
const HISTORY_KEY = "qagen_history";
const CURRENT_PROJECT_KEY = "qagen_current_project";

function loadProjects(): Project[] {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]"); } catch { return []; }
}
function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

export default function AppWorkbench() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [tab, setTab] = useState<Tab>("manual");
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState<string[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [repoDraft, setRepoDraft] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [showSiteInput, setShowSiteInput] = useState(false);
  const [siteDraft, setSiteDraft] = useState("");
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
  const [validation, setValidation] = useState<Validation>({ state: "ok" });
  const [optimisedCopied, setOptimisedCopied] = useState(false);

  // Projects & history
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>("");
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    let p = loadProjects();
    if (p.length === 0) {
      p = [{ id: crypto.randomUUID(), name: "Default Project", createdAt: Date.now() }];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(p));
    }
    setProjects(p);
    const stored = localStorage.getItem(CURRENT_PROJECT_KEY);
    setCurrentProjectId(stored && p.find((x) => x.id === stored) ? stored : p[0].id);
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (currentProjectId) localStorage.setItem(CURRENT_PROJECT_KEY, currentProjectId);
  }, [currentProjectId]);

  // When switching to a project, auto-load its latest history entry (requirement + test cases)
  useEffect(() => {
    if (!currentProjectId) return;
    const entries = loadHistory()
      .filter((h) => h.projectId === currentProjectId)
      .sort((a, b) => b.createdAt - a.createdAt);
    if (entries.length > 0) {
      const h = entries[0];
      setInput(h.requirement);
      setSample(h.sample);
      setStats(h.stats);
      setGenerated(true);
      setValidation({ state: "ok" });
    } else {
      setInput("");
      setSample(SAMPLE);
      setStats([
        { label: "Total",  value: 0 },
        { label: "Manual", value: 0 },
        { label: "UI",     value: 0 },
        { label: "API",    value: 0 },
      ]);
      setGenerated(false);
      setValidation({ state: "ok" });
    }
  }, [currentProjectId]);

  const projectHistory = useMemo(
    () => history.filter((h) => h.projectId === currentProjectId).sort((a, b) => b.createdAt - a.createdAt),
    [history, currentProjectId]
  );

  const projectStats = useMemo(() => {
    const totals = { Total: 0, Manual: 0, UI: 0, API: 0 } as Record<string, number>;
    projectHistory.forEach((h) => h.stats.forEach((s) => { totals[s.label] = (totals[s.label] || 0) + s.value; }));
    return totals;
  }, [projectHistory]);

  function createProject() {
    const name = newProjectName.trim();
    if (!name) return;
    const np: Project = { id: crypto.randomUUID(), name, createdAt: Date.now() };
    const next = [...projects, np];
    setProjects(next);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
    setCurrentProjectId(np.id);
    toast.success(`Project "${name}" created`);
    setNewProjectName("");
    setShowNewProject(false);
    // Clear previous requirement input and test cases for a fresh start
    setInput("");
    setSample(SAMPLE);
    setStats([
      { label: "Total",  value: 0 },
      { label: "Manual", value: 0 },
      { label: "UI",     value: 0 },
      { label: "API",    value: 0 },
    ]);
    setGenerated(false);
    setValidation({ state: "ok" });
    setProgress(0);
    setAgentIdx(0);
  }

  function deleteHistoryEntry(id: string) {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  function loadHistoryEntry(h: HistoryEntry) {
    setInput(h.requirement);
    setSample(h.sample);
    setStats(h.stats);
    setGenerated(true);
    setValidation({ state: "ok" });
    toast.success("Loaded from history");
  }

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
    if (id === "website") {
      if (connected.includes("website")) {
        setConnected((prev) => prev.filter((x) => x !== "website"));
        setSiteUrl("");
        setShowSiteInput(false);
        toast.success("Disconnected Website");
        return;
      }
      setSiteDraft(siteUrl);
      setShowSiteInput(true);
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

  function submitSite() {
    const url = siteDraft.trim();
    if (!/^https?:\/\/[^\s.]+\.[^\s]+/.test(url)) {
      toast.error("Enter a valid website URL (https://example.com)");
      return;
    }
    setSiteUrl(url);
    setConnected((prev) => (prev.includes("website") ? prev : [...prev, "website"]));
    setShowSiteInput(false);
    toast.success("Connected to Website");
  }

async function handleGenerate() {
  const v = validateRequirement(input);
  setValidation(v);
  if (v.state !== "ok") {
    setGenerated(false);
    return;
  }

  // Cross-check requirement against connected GitHub repo
  if (connected.includes("github") && repoUrl) {
    const match = repoUrl.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
    if (match) {
      const owner = match[1].toLowerCase();
      const repo = match[2].replace(/\.git$/i, "").toLowerCase();
      const tokens = Array.from(
        new Set(
          [owner, repo, ...repo.split(/[-_./]+/), ...owner.split(/[-_./]+/)]
            .map((t) => t.trim())
            .filter((t) => t.length >= 3)
        )
      );
      const text = input.toLowerCase();
      const hit = tokens.some((t) => text.includes(t));
      if (!hit) {
        setValidation({ state: "ok" });
        toast.warning(
          "Inputs are varying from the connected GitHub repo. Generating based on your requirement input."
        );
      }
    }
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
      manual: stripAutomationFromManual(manualMatch ? manualMatch[0].trim() : fullOutput),
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
    persistHistory(total);
    toast.success(`Generated ${total} test cases from your backend!`);
  } catch (err) {
    clearInterval(tick);
    setProgress(0);
    setAgentIdx(0);
    setGenerated(false);
    toast.error("Backend unavailable. Please try again.");
    console.error(err);
  } finally {
    setLoading(false);
  }
}

  function persistHistory(total: number, overrideSample?: typeof SAMPLE, overrideStats?: typeof stats) {
    if (!currentProjectId) return;
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      projectId: currentProjectId,
      requirement: input.trim(),
      createdAt: Date.now(),
      stats: overrideStats ?? stats,
      sample: overrideSample ?? sample,
    };
    // stats/sample state may not be flushed yet — use latest known values via setTimeout
    setTimeout(() => {
      const latest: HistoryEntry = {
        ...entry,
        stats: overrideStats ?? [
          { label: "Total",  value: total },
          { label: "Manual", value: Math.round(total * 0.1)  },
          { label: "UI",     value: Math.round(total * 0.45) },
          { label: "API",    value: Math.round(total * 0.45) },
        ],
      };
      const next = [latest, ...loadHistory()];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      setHistory(next);
    }, 0);
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
    navigate("/login");
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "manual", label: "Manual Test Cases", icon: ClipboardList },
    { id: "ui", label: "Playwright UI", icon: Monitor },
    { id: "api", label: "Playwright API", icon: Plug },
  ];

  return (
    <div className="min-h-screen bg-surface-light flex flex-col">
      <SEO
        title="Workbench — Generate Test Cases | QAGen AI"
        description="QAGen AI workbench: turn requirements into manual test cases plus Playwright UI and API automation, with project history and validation."
        path="/app"
      />
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
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <FolderKanban size={16} className="text-muted-foreground" />
              <select
                value={currentProjectId}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="bg-transparent text-foreground font-medium focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button onClick={() => setShowNewProject(true)} className="text-accent hover:opacity-80" title="New project">
                <Plus size={16} />
              </button>
            </div>
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
                  Connect a GitHub repository or a live website so QAGen grounds tests in your real code and product.
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

            {showSiteInput && (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Website URL
                </label>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    autoFocus
                    value={siteDraft}
                    onChange={(e) => setSiteDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitSite()}
                    placeholder="https://example.com"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={submitSite}
                    className="rounded-lg bg-accent text-primary-dark px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => setShowSiteInput(false)}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {connected.includes("website") && siteUrl && !showSiteInput && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/5 p-3 text-sm">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Connected website</div>
                  <a href={siteUrl} target="_blank" rel="noreferrer" className="block truncate font-medium text-foreground hover:underline">
                    {siteUrl}
                  </a>
                </div>
                <button
                  onClick={() => { setSiteDraft(siteUrl); setShowSiteInput(true); }}
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
              onChange={(e) => { setInput(e.target.value); if (validation.state !== "ok") setValidation({ state: "ok" }); }}
              rows={10}
              placeholder="e.g. As a user, I want to reset my password via email so that I can regain access to my account..."
              readOnly={loading}
              onKeyDown={(e) => {
                if (loading) {
                  e.preventDefault();
                  toast.message("Please wait, your test cases are getting generated.");
                }
              }}
              onPaste={(e) => {
                if (loading) {
                  e.preventDefault();
                  toast.message("Please wait, your test cases are getting generated.");
                }
              }}
              onMouseDown={(e) => {
                if (loading) {
                  e.preventDefault();
                  toast.message("Please wait, your test cases are getting generated.");
                }
              }}
              className={`mt-3 w-full rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground font-mono-code focus:outline-none focus:ring-2 focus:ring-accent resize-y ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />
            {validation.state === "empty" && (
              <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm flex items-start gap-3">
                <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive">No requirement provided</div>
                  <div className="text-muted-foreground mt-0.5">Type a requirement, user story, or acceptance criteria above before generating.</div>
                </div>
              </div>
            )}
            {validation.state === "mismatch" && (
              <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm flex items-start gap-3">
                <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive">Inputs are varying. Please mention the correct details.</div>
                  <div className="text-muted-foreground mt-0.5">
                    The requirement doesn't appear to reference the connected GitHub repository
                    {repoUrl ? <> (<span className="font-medium text-foreground">{repoUrl}</span>)</> : null}.
                    Update either the requirement or the GitHub link so they match.
                  </div>
                </div>
              </div>
            )}
            {validation.state === "incomplete" && (() => {
              const optimised = buildOptimisedPrompt(input);
              return (
                <div className="mt-3 rounded-xl border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
                    <AlertTriangle size={18} /> Incomplete Requirement
                  </div>
                  <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
                    Requirement is incomplete. Please provide more detail.
                  </p>
                  <div className="mt-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-foreground">What is unclear:</div>
                    <ul className="mt-1 list-disc pl-5 space-y-1 text-foreground/90">
                      {validation.unclear.map((u, i) => (<li key={i}>{u}</li>))}
                    </ul>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-foreground">Information needed:</div>
                    <ul className="mt-1 list-disc pl-5 space-y-1 text-foreground/90">
                      {validation.needed.map((u, i) => (<li key={i}>{u}</li>))}
                    </ul>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-foreground">Example of a complete requirement:</div>
                    <p className="mt-1 italic text-foreground/90">{validation.example}</p>
                  </div>

                  {/* Optimised Prompt — inside the same yellow box */}
                  <div className="mt-4 pt-4 border-t border-amber-300/40">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
                        <Sparkles size={16} /> Optimised Prompt
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(optimised);
                            setOptimisedCopied(true);
                            setTimeout(() => setOptimisedCopied(false), 1600);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition"
                        >
                          {optimisedCopied ? <><Check size={14} className="text-accent" /> Copied</> : <><Copy size={14} /> Copy</>}
                        </button>
                        <button
                          onClick={() => {
                            setInput(optimised);
                            setValidation({ state: "ok" });
                            toast.success("Optimised prompt applied. You can edit or generate now.");
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent text-primary-dark text-xs font-semibold hover:opacity-90 transition"
                        >
                          <Sparkles size={14} /> Use this prompt
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your input looks incomplete. Here&apos;s a structured version you can use to get high-quality test cases.
                    </p>
                    <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-border bg-background p-3 font-mono-code text-xs leading-relaxed whitespace-pre-wrap text-foreground">
{optimised}
                    </pre>
                  </div>
                </div>
              );
            })()}
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

        {/* HISTORY & VISUALIZATION */}
        <div className="mt-8 bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 flex-wrap">
            <div className="flex items-center gap-2">
              <HistoryIcon size={16} className="text-muted-foreground" />
              <h3 className="font-display text-lg text-foreground">Project History</h3>
              <span className="text-xs text-muted-foreground">
                · {projects.find((p) => p.id === currentProjectId)?.name}
              </span>
            </div>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {showHistory ? "Hide" : "Show"}
            </button>
          </div>

          {showHistory && (
            <div className="p-5">
              {/* Aggregate visualization */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {(["Total", "Manual", "UI", "API"] as const).map((k) => {
                  const max = Math.max(projectStats.Total || 1, 1);
                  const v = projectStats[k] || 0;
                  const pct = k === "Total" ? 100 : Math.round((v / max) * 100);
                  return (
                    <div key={k} className="rounded-xl border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase tracking-wider text-muted-foreground">{k}</span>
                        <BarChart3 size={12} className="text-muted-foreground" />
                      </div>
                      <div className="mt-1 font-display text-2xl text-primary">{v}</div>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {projectHistory.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No history yet. Generate test cases to start building history for this project.
                </div>
              ) : (
                <ul className="space-y-2">
                  {projectHistory.map((h) => (
                    <li key={h.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/30 transition">
                      <button onClick={() => loadHistoryEntry(h)} className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{h.requirement}</div>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>{new Date(h.createdAt).toLocaleString()}</span>
                          {h.stats.map((s) => (
                            <span key={s.label}>
                              <span className="font-semibold text-foreground">{s.value}</span> {s.label}
                            </span>
                          ))}
                        </div>
                      </button>
                      <button
                        onClick={() => deleteHistoryEntry(h.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive p-1"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNewProject(false)}>
          <div className="w-full max-w-sm rounded-xl bg-card border border-border p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg text-foreground">New Project</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enter project name</p>
            <input
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createProject(); if (e.key === "Escape") setShowNewProject(false); }}
              placeholder="Enter project name"
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setShowNewProject(false); setNewProjectName(""); }} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">Cancel</button>
              <button onClick={createProject} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}