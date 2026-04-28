import { useEffect, useState } from "react";
import PageShell from "@/components/site/PageShell";

const sections = [
  ["problem", "Problem Statement"],
  ["goals", "Goals"],
  ["io", "System Inputs & Outputs"],
  ["success", "Success Criteria"],
  ["framework", "Framework (RAG + Tool Calling)"],
  ["arch", "System Architecture"],
  ["example", "Example Output"],
  ["coverage", "Coverage Summary"],
  ["playwright", "Why Playwright"],
] as const;

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border my-5">
      <table className="w-full text-sm">
        <thead className="bg-primary text-white">
          <tr>{headers.map((h) => <th key={h} className="text-left py-2.5 px-4 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="bg-card">
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((c, j) => <td key={j} className="py-3 px-4 align-top text-foreground/85">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PRD() {
  const [active, setActive] = useState("problem");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach(([id]) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <PageShell>
      <div className="bg-surface-light min-h-screen">
        <div className="container py-12 grid lg:grid-cols-[240px_1fr] gap-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <div className="text-xs font-semibold tracking-widest text-muted-foreground mb-3">CONTENTS</div>
              {sections.map(([id, label]) => (
                <a key={id} href={`#${id}`} className={`block py-2 px-3 rounded-md text-sm border-l-2 transition-colors ${active === id ? "border-accent text-primary font-semibold bg-accent/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="max-w-[760px] mx-auto w-full">
            <header className="border-b border-border pb-6 mb-10">
              <span className="inline-block text-xs font-semibold tracking-widest text-accent border border-accent/40 rounded-full px-3 py-1 bg-accent/10">CONFIDENTIAL — QA AI SYSTEM</span>
              <h1 className="font-display text-4xl md:text-5xl mt-4 text-foreground">QA Test Case Generation from Requirements Using AI</h1>
              <p className="mt-3 text-muted-foreground">Internal Technical Document — System Architecture & Problem Statement</p>
            </header>

            <section id="problem" className="scroll-mt-24">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">1. Problem Statement</h2>
              <p className="mt-3 text-foreground/80 leading-relaxed">QA test case generation from software requirements using AI is a critical pain point in modern software development teams. The current manual approach introduces compounding inefficiencies at every stage of the QA cycle.</p>
              <h3 className="font-display text-xl mt-6 text-foreground">1.1 Why This Problem Exists</h3>
              <Table headers={["Issue", "Description"]} rows={[
                ["Time Consuming", "Engineers spend 30–40% of sprint time manually writing test cases that follow repetitive patterns, diverting focus from higher-value testing activities."],
                ["Inconsistent", "Different QA engineers apply different instincts — one may include SQL injection checks, another may not. Coverage quality varies based on individual knowledge and habits."],
                ["Incomplete", "Edge cases, boundary conditions, and security scenarios are frequently missed under deadline pressure or due to lack of domain awareness."],
                ["Delayed", "Test cases are written after development begins or ends, meaning QA is always a lagging activity rather than a proactive quality gate."],
              ]}/>
            </section>

            <section id="goals" className="scroll-mt-24 mt-10">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">2. Goal</h2>
              <p className="mt-3 text-foreground/80 leading-relaxed">Build an AI-powered system that accepts any form of requirement input and automatically generates comprehensive, production-grade test cases — reducing manual effort, improving consistency, and enabling QA to happen earlier in the development cycle.</p>
            </section>

            <section id="io" className="scroll-mt-24 mt-10">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">2.1 System Inputs</h2>
              <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/85">
                <li>Plain text description of the feature or functionality</li>
                <li>Acceptance criteria (AC) from product documentation</li>
                <li>User stories in standard Agile format</li>
              </ul>
              <h3 className="font-display text-xl mt-6 text-foreground">2.2 System Outputs</h3>
              <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/85">
                <li>Manual test cases — step-by-step format with preconditions and expected results</li>
                <li>UI automation test scripts using Playwright (TypeScript)</li>
                <li>API automation test scripts using Playwright (TypeScript)</li>
              </ul>
            </section>

            <section id="success" className="scroll-mt-24 mt-10">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">3. Success Criteria</h2>
              <Table headers={["#", "Scenario Type", "Description"]} rows={[
                [1, "Happy Path", "Standard positive flows where inputs are valid and the system behaves as expected."],
                [2, "Negative Scenarios", "Invalid inputs, wrong credentials, missing fields, and other failure paths that must be handled gracefully."],
                [3, "Edge Cases", "Unusual or extreme input scenarios, including empty states, maximum lengths, special characters, and concurrent actions."],
                [4, "Boundary Conditions", "Testing at exact limits and just beyond them (min-1, min, min+1, max-1, max, max+1)."],
                [5, "Security Checks", "SQL injection, XSS, rate limiting, authentication bypass, and input sanitization validation."],
                [6, "Cross Platform", "Responsive behaviour across mobile, tablet, and desktop viewports; cross-browser compatibility (Chromium, Firefox, WebKit)."],
              ]}/>
            </section>

            <section id="framework" className="scroll-mt-24 mt-10">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">4. Framework</h2>
              <h3 className="font-display text-xl mt-5 text-foreground">4.1 RAG — Retrieval-Augmented Generation</h3>
              <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/85">
                <li><b>Without RAG</b> — test cases will be generic and project-agnostic</li>
                <li><b>With RAG</b> — project-specific test cases based on historical memory</li>
                <li><b>Domain understanding</b> — knowledge of your business rules and data models</li>
                <li><b>Format compliance</b> — follows your team's defined test case structure</li>
              </ul>
              <h3 className="font-display text-xl mt-6 text-foreground">4.2 Tool Calling</h3>
              <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/85">
                <li><b>Jira tickets</b> — pull acceptance criteria and requirements directly from your backlog</li>
                <li><b>API documentation</b> — read actual endpoint definitions, request/response schemas</li>
                <li><b>DB schema</b> — understand data constraints and relationships for realistic data tests</li>
              </ul>
            </section>

            <section id="arch" className="scroll-mt-24 mt-10">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">5. System Architecture</h2>
              <h3 className="font-display text-xl mt-5 text-foreground">5.1 Pipeline Overview</h3>
              <Table headers={["Step", "Agent", "Responsibility"]} rows={[
                ["01", "Planner Agent", "Parses user input (AC / Description / User Story). Identifies intent, infers domain, detects tech stack, and defines scope of test generation."],
                ["02", "Context Gathering", "RAG retrieves relevant past test cases, domain knowledge, and QA practices. Tool calling fetches Jira tickets, API docs, and DB schemas to enrich context."],
                ["03", "Generator Agent", "Using all gathered context, generates: (1) manual step-by-step test cases, (2) Playwright UI automation scripts, and (3) Playwright API automation scripts."],
                ["04", "Review Agent", "Verifies that all 6 success criteria categories are covered. Identifies gaps, scores quality, and sends incomplete outputs back to the Generator for revision."],
                ["05", "Formatter Agent", "Produces clean, structured Markdown documentation ready for Confluence, Notion, or your test management tool. Applies consistent naming and formatting conventions."],
              ]}/>
              <h3 className="font-display text-xl mt-6 text-foreground">5.2 Pipeline Flow</h3>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {["User Input","Planner Agent","RAG + Tool Calling","Generator Agent","Review Agent","Formatter Agent","Clean Output"].map((s, i, arr) => (
                  <span key={s} className="inline-flex items-center gap-2">
                    <span className="px-3 py-2 rounded-lg bg-primary text-white font-medium">{s}</span>
                    {i < arr.length - 1 && <span className="text-accent font-bold">→</span>}
                  </span>
                ))}
              </div>
            </section>

            <section id="example" className="scroll-mt-24 mt-10">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">6. Example Output</h2>
              <pre className="mt-4 rounded-xl bg-primary-dark text-white/90 p-5 font-mono-code text-sm overflow-x-auto">
{`Test Case ID: TC-001
Title: Valid User Login with Correct Credentials
Priority: High
Preconditions: User account exists and is active

Step 1: Navigate to login page → Login page is displayed
Step 2: Enter valid email: user@example.com → Email accepted
Step 3: Enter valid password: Password@123 → Password masked
Step 4: Click Login button → Loading indicator appears
Step 5: Wait for response → Redirected to dashboard`}
              </pre>
              <pre className="mt-4 rounded-xl bg-primary-dark text-white/90 p-5 font-mono-code text-sm overflow-x-auto">
{`Test Case ID: TC-002
Title: Login Attempt with Invalid Password
Priority: High
Preconditions: User account exists with known credentials`}
              </pre>
            </section>

            <section id="coverage" className="scroll-mt-24 mt-10">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">7. Coverage Summary</h2>
              <Table headers={["Output Type", "Count", "Coverage Areas"]} rows={[
                ["Manual Test Cases", 3, "Happy Path, Negative, Security"],
                ["API Automation (Playwright)", 6, "Success, Validation, Rate Limiting, Security"],
                ["UI Automation (Playwright)", 7, "Functional, Validation, UX, Responsive"],
                ["Total", 16, "Comprehensive Coverage"],
              ]}/>
              <h3 className="font-display text-xl mt-6 text-foreground">Coverage Matrix</h3>
              <Table headers={["Scenario Type", "Manual", "API", "UI"]} rows={[
                ["Happy Path", "✓", "✓", "✓"],
                ["Negative Scenarios", "✓", "✓", "✓"],
                ["Edge Cases", "✓", "✓", "✓"],
                ["Boundary Conditions", "—", "✓", "✓"],
                ["Security Checks", "✓", "✓", "—"],
                ["Cross Platform", "—", "—", "✓"],
              ]}/>
            </section>

            <section id="playwright" className="scroll-mt-24 mt-10">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">8. Why Playwright</h2>
              <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/85">
                <li>Single framework for both API and UI testing — one tool to learn and maintain</li>
                <li>Built-in auto-wait and retry mechanisms — reduces flaky tests significantly</li>
                <li>Cross-browser support — Chromium, Firefox, and WebKit out of the box</li>
                <li>Mobile device emulation — test responsive layouts without real devices</li>
                <li>Parallel test execution — faster CI/CD pipeline runs</li>
                <li>Rich debugging tools — trace viewer, screenshots, video recording on failure</li>
                <li>Full TypeScript support — IntelliSense, type safety, and better maintainability</li>
              </ul>
            </section>

            <footer className="mt-16 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              End of Document — Confidential — QA AI System
            </footer>
          </article>
        </div>
      </div>
    </PageShell>
  );
}
