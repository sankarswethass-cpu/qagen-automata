import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="container py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center font-display text-primary-dark text-lg">Q</div>
            <span className="font-bold tracking-tight">QAGen AI</span>
          </div>
          <p className="mt-4 text-sm text-white/65 max-w-xs">
            AI-powered QA test case generation from software requirements.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li><Link to="/" className="hover:text-accent">Landing Page</Link></li>
            <li><Link to="/login" className="hover:text-accent">Login</Link></li>
            <li><Link to="/demo" className="hover:text-accent">Request Demo</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-3">Connect</h4>
          <a href="mailto:contact@qagen.ai" className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-accent"><Mail size={16}/> contact@qagen.ai</a>
          <div className="mt-4 flex gap-3">
            <a aria-label="Twitter" href="#" className="h-9 w-9 grid place-items-center rounded-md bg-white/5 hover:bg-accent hover:text-primary-dark transition"><Twitter size={16}/></a>
            <a aria-label="LinkedIn" href="#" className="h-9 w-9 grid place-items-center rounded-md bg-white/5 hover:bg-accent hover:text-primary-dark transition"><Linkedin size={16}/></a>
            <a aria-label="GitHub" href="#" className="h-9 w-9 grid place-items-center rounded-md bg-white/5 hover:bg-accent hover:text-primary-dark transition"><Github size={16}/></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-5 text-xs text-white/55 flex flex-col sm:flex-row gap-2 justify-between">
          <span>© 2026 QAGen AI. All rights reserved.</span>
          <a href="#" className="hover:text-accent">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
