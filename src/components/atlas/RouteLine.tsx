import { useEffect, useRef, useState } from "react";

interface RouteLineProps {
  /** SVG path `d` string in a 600x120 viewBox. */
  d?: string;
  className?: string;
  stroke?: string;
}

const DEFAULT_PATH =
  "M8 78 C90 18 150 110 240 62 S380 12 460 66 S560 96 592 44";

export const RouteLine = ({
  d = DEFAULT_PATH,
  className = "",
  stroke = "var(--ink)",
}: RouteLineProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;

    if (!svg || !path) return;

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const draw = () => {
      const length = path.getTotalLength();

      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = mediaQuery.matches
        ? "0"
        : `${length}`;

      if (mediaQuery.matches) {
        setDrawn(true);
      }
    };

    draw();

    if (mediaQuery.matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(svg);

    return () => observer.disconnect();
  }, [d]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = drawn ? "0" : `${length}`;
  }, [drawn, d]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      viewBox="0 0 600 120"
      preserveAspectRatio="none"
      className={`route-line pointer-events-none h-16 w-full overflow-visible ${className}`}
    >
      <path
        d={d}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.06"
        transform="translate(0 3)"
      />

      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="route-line-path"
        style={{
          transition: "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      <circle
        cx="8"
        cy="78"
        r="4"
        fill="var(--tangerine)"
        stroke="var(--ink)"
        strokeWidth="1.5"
      />

      <circle
        cx="592"
        cy="44"
        r="4"
        fill="var(--sun)"
        stroke="var(--ink)"
        strokeWidth="1.5"
      />
    </svg>
  );
};