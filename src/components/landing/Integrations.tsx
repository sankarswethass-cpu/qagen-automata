const tools = ["Jira", "Confluence", "Notion", "Playwright", "GitHub", "GitLab", "OpenAPI"];

export default function Integrations() {
  return (
    <section className="bg-surface-light py-20">
      <div className="container text-center">
        <h2 className="font-display text-3xl md:text-5xl text-foreground tracking-tight">
          Works Where Your Team Already Works
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {tools.map((t) => (
            <span key={t} className="px-5 py-3 rounded-xl bg-card border border-border text-foreground font-medium shadow-sm hover:border-accent hover:text-accent transition-colors">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-8 text-muted-foreground max-w-2xl mx-auto">
          Tool calling pulls live tickets, API contracts, and DB schemas — so every test case is grounded in your actual project context, not generic assumptions.
        </p>
      </div>
    </section>
  );
}
