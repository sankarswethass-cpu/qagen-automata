import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const baseLinks = [
  { to: "/", label: "Home" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const isAuthed =
    typeof window !== "undefined" && localStorage.getItem("qagen_auth") === "1";
  const links = isAuthed
    ? [...baseLinks, { to: "/app", label: "Workbench" }]
    : [...baseLinks, { to: "/login", label: "Login" }];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-primary-dark/80 backdrop-blur-xl border-b border-white/10">
        <nav className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center font-display text-primary-dark text-lg shadow-glow">Q</div>
            <span className="font-bold text-white tracking-tight">QAGen AI</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) =>
              l.hash ? (
                <a key={l.to} href={l.to} className="px-3 py-2 text-sm text-white/80 hover:text-accent transition-colors">{l.label}</a>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm transition-colors ${isActive ? "text-accent" : "text-white/80 hover:text-accent"}`
                  }
                >
                  {l.label}
                </NavLink>
              )
            )}
            {!isAuthed && (
              <Link
                to="/login"
                className="ml-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-dark hover:scale-[1.03] transition-transform shadow-glow"
              >
                Get Started →
              </Link>
            )}
          </div>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden text-white p-2"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {open && (
          <div className="lg:hidden border-t border-white/10 px-6 py-4 space-y-2 bg-primary-dark">
            {links.map((l) =>
              l.hash ? (
                <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="block py-2 text-white/85">{l.label}</a>
              ) : (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`block py-2 ${loc.pathname === l.to ? "text-accent" : "text-white/85"}`}>{l.label}</Link>
              )
            )}
            {!isAuthed && (
              <Link to="/login" onClick={() => setOpen(false)} className="block text-center mt-3 rounded-lg bg-accent py-2.5 font-semibold text-primary-dark">
                Get Started →
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
