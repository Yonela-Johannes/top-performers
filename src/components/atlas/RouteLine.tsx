import { useEffect, useRef, useState } from "react";

/**
 * Draws a dashed ink route (SVG, decorative) once the element scrolls into
 * view via stroke-dashoffset. Under prefers-reduced-motion the line renders
 * fully drawn from the start.
 */
interface RouteLineProps {
  /** SVG path `d` string in a 600x120 viewBox, drawn left to right. */
  d?: string;
  className?: string;
  stroke?: string;
}

const DEFAULT_PATH =
  "M8 78 C 90 18, 150 110, 240 62 S 380 12, 460 66 S 560 96, 592 44";

export const RouteLine = ({
  d = DEFAULT_PATH,
  className = "",
  stroke = "var(--ink)",
}: RouteLineProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !ref.current) {
      setDrawn(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 600 120"
      preserveAspectRatio="none"
      className={`route-line pointer-events-none h-16 w-full overflow-visible ${drawn ? "is-drawn" : ""} ${className}`}
    >
      {/* Soft ground shadow so the route reads as inked onto the paper */}
      <path
        d={d}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.07"
        transform="translate(0 4)"
      />
      <path
        className="route-line-path"
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{
          strokeDasharray: "1 12",
          strokeDashoffset: drawn ? 0 : 420,
          transition: "stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)",
        }}
      />
      {/* Waypoint dots at each end, like chart pins */}
      <circle cx="8" cy="78" r="4.5" fill="var(--tangerine)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="592" cy="44" r="4.5" fill="var(--sun)" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
};
