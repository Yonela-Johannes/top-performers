import fs from "node:fs";
import path from "node:path";

const readmePath = path.join(process.cwd(), "README.md");
const dataDir = path.join(process.cwd(), "public", "data");
const committersDir = path.join(dataDir, "committers");

let totalDevelopers = 0;
let totalCommits = 0;
const countryFiles = fs.existsSync(committersDir)
  ? fs.readdirSync(committersDir).filter((f) => f.endsWith(".json"))
  : [];

for (const file of countryFiles) {
  try {
    const raw = fs.readFileSync(path.join(committersDir, file), "utf8");
    const data = JSON.parse(raw);
    const users = data.users || [];
    totalDevelopers += users.length;
    for (const u of users) {
      totalCommits += u.commits || 0;
    }
  } catch {
    // Ignore unreadable files
  }
}

let metadata = { generatedAt: new Date().toISOString(), countries: countryFiles.length };
try {
  metadata = JSON.parse(fs.readFileSync(path.join(dataDir, "metadata.json"), "utf8"));
} catch {
  // Fallback
}

const formattedDate =
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(metadata.generatedAt || Date.now())) + " UTC";

const statsMarkdown = `<!-- DATA-STATS:START -->
### 📊 Live Dataset Status

| Metric | Stat |
|---|---|
| 🌐 **Countries Indexed** | \`${metadata.countries || countryFiles.length}\` |
| 👥 **Developers Tracked** | \`${totalDevelopers.toLocaleString()}\` |
| ⚡ **Public Commits Indexed** | \`${totalCommits.toLocaleString()}\` |
| 🕒 **Last Dataset Update** | \`${formattedDate}\` |

*Updated automatically by GitHub Actions on every dataset refresh.*
<!-- DATA-STATS:END -->`;

if (!fs.existsSync(readmePath)) {
  console.error("README.md not found!");
  process.exit(1);
}

let readme = fs.readFileSync(readmePath, "utf8");

if (
  readme.includes("<!-- DATA-STATS:START -->") &&
  readme.includes("<!-- DATA-STATS:END -->")
) {
  readme = readme.replace(
    /<!-- DATA-STATS:START -->[\s\S]*?<!-- DATA-STATS:END -->/,
    statsMarkdown,
  );
} else {
  readme = readme.replace(/## Overview/, `${statsMarkdown}\n\n## Overview`);
}

fs.writeFileSync(readmePath, readme, "utf8");
console.log("Successfully updated README.md with live dataset stats!");
