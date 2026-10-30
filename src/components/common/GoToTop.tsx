import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface GoToTopProps {
  children?: React.ReactNode;
}

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
        className="flex h-11 w-11 items-center justify-center border-2 border-foreground bg-card text-foreground shadow-[2px_2px_0px_0px_var(--ink)] transition-all duration-150 ease-out hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--ink)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[1px_1px_0px_0px_var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default GoToTop;
