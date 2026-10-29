# TopPerformers

**TopPerformers** is a focused, daily-updated index of the most active open-source developers, ranked by country. It turns public GitHub commit activity into clear, readable leaderboards — no accounts, no backend, no noise.

🌐 **Live site:** https://topperformers.vercel.app
🐙 **Source:** https://github.com/RensithUdara/Github-Commiters-Top-Rank
👨‍💻 **Developer:** [Rensith Udara Gonalagoda](https://rensithudara.com/)

---

## What it does

- Browse ranked developers across 151 countries and regions.
- Search countries and filter by continent.
- Open any country for a full, sortable leaderboard.
- Inspect contributor profiles enriched with public GitHub data.
- Generate shareable contributor badges.
- Switch between light and dark themes.
- Explore fully responsive layouts on desktop, tablet, and mobile.

The ranking data is sourced from [`committers.top`](https://committers.top) and refreshed every day by a GitHub Action. TopPerformers itself does not calculate rankings from followers, stars, or private activity.

---

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS, CSS custom properties |
| Components | Radix UI primitives, shadcn/ui patterns |
| Data | Redux Toolkit Query over static JSON |
| Routing | React Router 7 |
| Icons | Lucide React |
| SEO | React Helmet Async, JSON-LD, sitemap, robots.txt |
| Hosting | Vercel |

---

## Design system

The interface is built on a small set of shared tokens rather than per-screen styles:

- **Canvas** — warm paper light mode; deep ink dark mode.
- **Accent** — a single volt green used for rank highlights and active states.
- **Typography** — Instrument Serif for editorial headings, Inter for UI, JetBrains Mono for data and labels.
- **Surfaces** — consistent `rounded-xl` cards, one-pixel borders, and a restrained two-level shadow scale.
- **Components** — shared button, input, select, dialog, table, and tooltip primitives with aligned focus, hover, disabled, and loading states.

Tokens live in `src/index.css` and `tailwind.config.js`. Reusable primitives live in `src/components/ui`, shared product components in `src/components/common`.

---

## Project structure

```txt
.
├── public/
│   ├── data/
│   │   ├── countries.json          # Country index
│   │   ├── flags.json              # Flags and continent metadata
│   │   ├── metadata.json           # Last generation timestamp
│   │   └── committers/             # One JSON file per country
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── scripts/
│   └── generate-data.mjs           # Static data generator
├── src/
│   ├── api/                        # RTK Query slices
│   ├── components/
│   │   ├── common/                 # Product components
│   │   └── ui/                     # Design-system primitives
│   ├── hooks/
│   ├── lib/                        # SEO and formatting helpers
│   ├── pages/                      # Home, Country, NotFound
│   ├── routes/
│   └── store/
├── generate-sitemap.cjs
├── tailwind.config.js
└── vercel.json
```

---

## Data model

Rankings are scraped from `https://committers.top/{country}` and saved as static JSON.

```json
{
  "country": { "slug": "sri_lanka", "name": "Sri Lanka" },
  "generatedAt": "2026-10-29T07:55:58.788Z",
  "users": [
    {
      "rank": 1,
      "username": "example",
      "realname": "Example Developer",
      "profile": "https://github.com/example",
      "commits": 12345,
      "avatar": "https://avatars.githubusercontent.com/..."
    }
  ]
}
```

The frontend reads:

```txt
/data/countries.json
/data/flags.json
/data/metadata.json
/data/committers/{country}.json
```

No backend server is required.

---

## Daily updates

`scripts/generate-data.mjs` fetches the source data, writes country files, regenerates metadata, and reports any failures. A GitHub Action runs the pipeline daily at 02:00 UTC; Vercel redeploys automatically when data changes. The workflow also supports manual dispatch.

```txt
GitHub Action → data generator → static JSON → sitemap → commit → Vercel deploy
```

---

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Vite development server |
| `pnpm data:update` | Regenerate country and contributor JSON |
| `pnpm sitemap` | Regenerate `public/sitemap.xml` |
| `pnpm build` | Generate sitemap, type-check, and build for production |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview the production build |

### Environment variables

```txt
VITE_GITHUB_TOKEN=    # Optional: raises GitHub API rate limits for profile dialogs
VITE_SITE_URL=        # Optional: overrides the canonical production URL
VITE_DATA_BASE_URL=   # Optional: overrides the static data base path
```

Default site URL: `https://topperformers.vercel.app`

---

## Deployment

The project is configured for Vercel with SPA rewrites in `vercel.json`.

| Setting | Value |
|---|---|
| Framework | Vite |
| Build command | `pnpm build` |
| Output directory | `dist` |
| Install command | `pnpm install` |

---

## SEO

- Server-agnostic per-page titles, descriptions, and canonicals.
- Open Graph and Twitter card metadata.
- JSON-LD for `WebSite`, `Dataset`, `WebPage`, `BreadcrumbList`, `ItemList`, and `Person`.
- Auto-generated sitemap for every indexed country.
- Installable web manifest with matching icons and theme colours.

---

## Notes

- Rankings depend on the public structure of `committers.top`. If its markup changes, update `scripts/generate-data.mjs`.
- Ranking eligibility is determined by the source and by a public GitHub location. Followers are not a ranking factor.
- Country flags are loaded from `flagcdn.com`; avatars from GitHub.

---

## License

Released under the MIT License.

Built with care by **Rensith Udara Gonalagoda**.
