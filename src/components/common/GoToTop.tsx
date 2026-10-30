import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface GoToTopProps {
  children?: React.ReactNode;
}

/**
 * Back-to-top button.
 *
 * The visibility check only flips state when the threshold is actually
 * crossed. The previous version called `setState` on every scroll event,
 * which forced a React render per frame on long pages — the single biggest
 * cause of scroll jank here.
 */
const GoToTop = ({ children }: GoToTopProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY > 600);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-2 animate-fade-in sm:bottom-6 sm:right-6">
      {children}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className="flex h-11 w-11 items-center justify-center border border-border bg-card text-foreground transition-colors duration-150 ease-out hover:border-foreground/25 hover:bg-secondary"
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default GoToTop;
