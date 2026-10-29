# TopPerformers

**TopPerformers** is an open-source project that makes it easier to discover active developers around the world. It turns public GitHub commit activity into country-based leaderboards, giving developers a simple way to explore open-source contributions across different countries and regions.

🌐 **Live site:** [topperformers.vercel.app](https://topperformers.vercel.app)  
🐙 **Source code:** [Yonela-Johannes/TopPerformers](https://github.com/Yonela-Johannes/TopPerformers)

---

## Overview

Open-source development happens everywhere, but discovering the people contributing to it can be difficult.

TopPerformers brings public GitHub commit activity into one place, organised by country and presented through searchable, sortable leaderboards.

The goal is simple: make open-source activity easier to explore, recognise, and understand.

### Features

- **Global leaderboards** — Explore developer rankings across 151 countries and regions.
- **Country discovery** — Search for countries and filter results by continent.
- **Developer profiles** — Explore contributor information using publicly available GitHub data.
- **Sortable rankings** — Browse country leaderboards and compare contributor activity.
- **Shareable badges** — Generate badges featuring contributor rankings.
- **Light and dark themes** — Choose the appearance that works best for you.
- **Responsive interface** — Browse on desktop, tablet, or mobile.
- **Automated data updates** — Refresh ranking data daily.
- **Search engine optimisation** — Structured metadata and country-specific pages help make rankings discoverable.

## How rankings work

TopPerformers uses publicly available ranking data from `committers.top`, which tracks GitHub commit activity by country.

The data is collected and stored as static JSON files, allowing the application to serve leaderboards without requiring a dedicated backend server.

Rankings reflect the source data and its methodology. They should not be interpreted as a complete measure of a developer's skill, experience, or overall open-source impact.

GitHub followers, repository stars, and private contributions are not used by TopPerformers itself to calculate rankings.

---

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS, CSS custom properties |
| Components | Radix UI primitives, shadcn/ui patterns |
| Data fetching | Redux Toolkit Query |
| Routing | React Router 7 |
| Icons | Lucide React |
| SEO | React Helmet Async, JSON-LD, sitemap, robots.txt |
| Hosting | Vercel |
| Automation | GitHub Actions |
| Data storage | Static JSON |

The application is designed to remain lightweight, with pre-generated ranking data and no dedicated application server required for the core experience.

---

## Design and interface

TopPerformers follows a consistent design system built around reusable components and shared design tokens.

The interface prioritises readability, clear information hierarchy, responsive layouts, and straightforward navigation.

### Design principles

- **Clarity first** — Rankings and contributor information remain easy to scan.
- **Consistent components** — Shared primitives keep interactions and layouts predictable.
- **Purposeful styling** — Colours, typography, borders, and spacing serve a clear function.
- **Accessible interactions** — Interactive elements support appropriate focus and state indicators.
- **Responsive by design** — Layouts adapt to different screen sizes without sacrificing usability.
- **Theme support** — Light and dark modes provide consistent experiences across the application.

### Design system structure

Design tokens are maintained in:

- `src/index.css`
- `tailwind.config.js`

Reusable UI primitives live in `src/components/ui`, while shared application components live in `src/components/common`.

---

## Project structure

```text
.
├── public/
│   ├── data/
│   │   ├── countries.json
│   │   ├── flags.json
│   │   ├── metadata.json
│   │   └── committers/
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── scripts/
│   └── generate-data.mjs
├── src/
│   ├── api/
│   ├── components/
│   │   ├── common/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── routes/
│   └── store/
├── generate-sitemap.cjs
├── tailwind.config.js
└── vercel.json
```

### Key directories

| Path | Purpose |
|---|---|
| `public/data/` | Generated country, metadata, and contributor data |
| `public/data/committers/` | Individual country leaderboard files |
| `scripts/` | Data generation and maintenance scripts |
| `src/api/` | Redux Toolkit Query API definitions |
| `src/components/common/` | Shared application components |
| `src/components/ui/` | Reusable UI primitives |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Shared utilities, formatting, and SEO helpers |
| `src/pages/` | Application pages |
| `src/routes/` | Routing configuration |
| `src/store/` | Redux store configuration |

---

## Data model

Each country leaderboard is stored as a JSON file containing country metadata, a generation timestamp, and its ranked contributors.

Example:

```json
{
  "country": {
    "slug": "south_africa",
    "name": "South Africa"
  },
  "generatedAt": "2026-10-29T07:55:58.788Z",
  "users": [
    {
      "rank": 1,
      "username": "example",
      "realname": "Example Developer",
      "profile": "https://github.com/example",
      "commits": 12345,
      "avatar": "https://avatars.githubusercontent.com/u/123456"
    }
  ]
}
```

The example values are illustrative and do not represent actual rankings.

### Data files

The frontend consumes the following files:

```text
/data/countries.json
/data/flags.json
/data/metadata.json
/data/committers/{country}.json
```

This static-data approach keeps the application simple to deploy and reduces the need for server-side infrastructure.

---

## Automated data updates

Ranking data is refreshed automatically through a GitHub Actions workflow.

The data generation script:

1. Fetches the available source ranking data.
2. Generates individual country leaderboard files.
3. Updates the dataset metadata and generation timestamp.
4. Reports failures encountered during collection.
5. Supports the repository's automated update and deployment workflow.

The scheduled workflow runs daily at **02:00 UTC** and also supports manual execution.

### Update pipeline

```text
GitHub Actions
      ↓
Data generation script
      ↓
Country leaderboard JSON
      ↓
Metadata and sitemap generation
      ↓
Commit updated data
      ↓
Vercel deployment
```

The exact deployment behaviour depends on the repository's GitHub Actions and Vercel configuration.

---

## Getting started

### Requirements

- Node.js compatible with the project's dependencies.
- pnpm.
- Git.

### Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Yonela-Johannes/TopPerformers.git
cd TopPerformers
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

### Available scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm data:update` | Regenerate country and contributor data |
| `pnpm sitemap` | Regenerate the sitemap |
| `pnpm build` | Generate the sitemap, type-check, and build for production |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview the production build |

---

## Configuration

The application supports the following environment variables:

| Variable | Required | Description |
|---|---|---|
| `VITE_GITHUB_TOKEN` | No | Optional GitHub token for higher API rate limits |
| `VITE_SITE_URL` | No | Override the canonical site URL |
| `VITE_DATA_BASE_URL` | No | Override the base URL used to load static data |

Configure these variables in your local environment when needed.

The default production URL is:

`https://topperformers.vercel.app`

Do not commit API tokens or other secrets to the repository.

---

## Deployment

TopPerformers is configured for deployment on Vercel.

| Setting | Value |
|---|---|
| Framework | Vite |
| Install command | `pnpm install` |
| Build command | `pnpm build` |
| Output directory | `dist` |

The application uses SPA rewrites configured in `vercel.json`.

To deploy, connect the repository to Vercel and configure the build settings and environment variables as required.

---

## SEO and discoverability

The application includes several features to improve search engine discoverability:

- Page-specific titles and descriptions.
- Canonical URLs.
- Open Graph and Twitter card metadata.
- Structured JSON-LD data.
- Country-specific sitemap entries.
- A `robots.txt` file.
- A web manifest and application icons.

Structured data supports relevant types such as `WebSite`, `Dataset`, `WebPage`, `BreadcrumbList`, `ItemList`, and `Person`, where appropriate.

The sitemap is generated from the available country data to help search engines discover indexed leaderboard pages.

---

## Limitations

- **Source dependency:** Rankings depend on the availability and structure of the upstream dataset.
- **Data freshness:** Rankings reflect the latest successful data generation, not necessarily real-time activity.
- **Public information:** Contributor details come from publicly available sources and may be incomplete.
- **Ranking methodology:** Results reflect commit activity as represented by the source, not a comprehensive assessment of developer performance.
- **Country attribution:** Country-based rankings depend on the source's country attribution and eligibility rules.

If the upstream data structure changes, the data generation script may need to be updated.

---

## Contributing

Contributions that improve the interface, accessibility, data reliability, performance, and overall developer experience are welcome.

Before submitting changes:

1. Keep changes focused and consistent with the existing architecture.
2. Follow the project's established coding and styling conventions.
3. Run the available linting, type-checking, and build commands.
4. Include a clear description of the changes.

---

## License

This project is released under the MIT License. See the repository's `LICENSE` file for the applicable terms.

---

**TopPerformers**  
Built by **Yonela Johannes**.