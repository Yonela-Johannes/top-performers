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
    <div className="max-w-md text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 font-display text-5xl leading-none text-foreground">
        Off the leaderboard
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        The page you're looking for doesn't exist or has moved. Head back to the
        country index to keep exploring.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to countries
      </Link>
    </div>
  </div>
);

export default NotFound;
