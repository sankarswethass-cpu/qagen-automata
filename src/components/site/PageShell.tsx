import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PageShell({ children, hideFooter = false }: { children: React.ReactNode; hideFooter?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1"
      >
        {children}
      </motion.main>
      {!hideFooter && <Footer />}
    </div>
  );
}
