import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toTitle } from "@/lib/seo";

const NotFound = () => (
  <div className="shell flex min-h-[60vh] items-center justify-center py-20">
    <Helmet>
      <title>{toTitle("Page not found")}</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="surface relative max-w-md px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-3"
        style={{
          background: "color-mix(in srgb, var(--sky) 82%, transparent)",
          clipPath:
            "polygon(3% 0,97% 4%,100% 22%,97% 45%,100% 70%,96% 100%,4% 96%,0 78%,3% 52%,0 26%)",
        }}
      />
      <p className="stamp-badge mx-auto inline-flex">404 · Route missing</p>
      <h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
        Off the leaderboard
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        The page you're looking for doesn't exist or has moved. Head back to the
        country index to keep exploring.
      </p>
      <Link to="/" className="button-primary mt-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to countries
      </Link>
    </div>
  </div>
);

export default NotFound;
