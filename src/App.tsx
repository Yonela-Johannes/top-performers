import { useEffect } from "react";
import {
  BrowserRouter as Router,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-fox-toast";
import AppRoutes from "./routes";
import { Footer, Header } from "./components/common";
import GoToTop from "./components/common/GoToTop";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timeout = window.setTimeout(() => {
        document
          .querySelector(hash)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => window.clearTimeout(timeout);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return undefined;
  }, [pathname, hash]);

  return null;
};

const toastBase = {
  background: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  boxShadow: "0 2px 4px rgba(20,18,24,.08), 0 22px 36px -22px rgba(20,18,24,.45)",
  fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: 500,
} as const;

const toastTheming = {
  success: { style: toastBase, className: "" },
  error: { style: toastBase, className: "" },
  info: { style: toastBase, className: "" },
  custom: { style: toastBase, className: "" },
};

const App = () => {
  return (
    <Router>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
        <GoToTop />
        <ToastContainer
          position="top-right"
          duration={3200}
          toastTypeTheming={toastTheming}
        />
      </div>
    </Router>
  );
};

export default App;
