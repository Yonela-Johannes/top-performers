import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface GoToTopProps {
  children?: React.ReactNode;
}

const GoToTop = ({ children }: GoToTopProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-2 animate-fade-in sm:bottom-6 sm:right-6">
      {children}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-pop transition-colors hover:bg-secondary"
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default GoToTop;
