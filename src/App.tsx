import { useEffect } from "react";
import {
  BrowserRouter as Router,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-fox-toast";
import AppRoutes from "./routes";
import { TooltipProvider } from "./components/ui/tooltip";
import { Footer, Header } from "./components/common";
import GoToTop from "./components/common/GoToTop";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return undefined;
    }

    let targetId = hash.slice(1);
    try {
      targetId = decodeURIComponent(targetId);
    } catch {
      // Keep the raw hash if it is not valid percent-encoding.
    }

    let cancelled = false;
    let attempts = 0;
    let timer = 0;

    // Content above an anchor can load in after the first paint (for example
    // infinite-scroll country cards). Re-anchor briefly until the layout
    // settles, but stop immediately if the person starts scrolling.
    const settle = () => {
      if (cancelled) return;

      const target = document.getElementById(targetId);
      if (target) {
        const margin =
          Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const delta = Math.abs(target.getBoundingClientRect().top - margin);
        if (delta > 4) {
          // "instant" overrides the global smooth-scroll CSS so layout shifts
          // above the target cannot restart a long animation on every retry.
          target.scrollIntoView({ behavior: "instant", block: "start" });
        }
      }

      attempts += 1;
      if (attempts < 20) {
        timer = window.setTimeout(settle, 100);
      }
    };

    const cancel = () => {
      cancelled = true;
      window.clearTimeout(timer);
    };

    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });
    window.addEventListener("keydown", cancel, { once: true });

    timer = window.setTimeout(settle, 60);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
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
    <TooltipProvider delayDuration={200}>
      <Router>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main-content" className="flex-1 animate-fade-in">
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
    </TooltipProvider>
  );
};

export default App;
