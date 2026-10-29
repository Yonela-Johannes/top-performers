export const SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://topperformers.vercel.app";

export const SITE_NAME = "TopPerformers";
export const SITE_TAGLINE =
  "The world's most active developers, ranked by country.";
export const SITE_OWNER = "Rensith Udara Gonalagoda";
export const SITE_DESCRIPTION =
  "Explore daily-updated rankings of the most active open-source developers by country, with public commit data and contributor profiles.";
export const SITE_KEYWORDS = [
  "top developers by country",
  "GitHub committers ranking",
  "open source leaderboard",
  "developer rankings",
  "most active developers",
  "GitHub profile analytics",
  "software engineer rankings",
  "country developer leaderboard",
  "open source contributors",
];
export const SOURCE_NAME = "committers.top";
export const SOURCE_URL = "https://committers.top";
export const AUTHOR_URL = "https://rensithudara.com/";
export const GITHUB_URL = "https://github.com/RensithUdara";
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/rensith-udara-gonalagoda/";

export const defaultOgImage = `${SITE_URL}/og-image.png`;

export const absoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const toTitle = (title?: string) =>
  title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
