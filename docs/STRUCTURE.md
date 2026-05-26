# Repository Structure

Source is grouped by purpose, while GitHub Pages still publishes the old public
paths for existing links and bookmarks.

| Source | Pages path |
|---|---|
| `apps/player/` | `/player/` |
| `apps/lofi-player/` | `/lofi-player/` |
| `apps/lofi-rater/` | `/lofi-rater/` |
| `apps/izlase/` | `/izlase/` |
| `collections/<name>/` | `/<name>/` |
| `courses/Skola/` | `/Skola/` |
| `courses/TehnoSkola/` | `/TehnoSkola/` |
| `tools/agent/` | `/agent/` |
| `tools/merger/` | `/merger/` |
| `tools/orginals/` | `/orginals/` |
| `tools/reports/` | `/reports/` |
| `tools/sampler/` | `/sampler/` |
| `tools/strudel-to-mp3/` | `/strudel-to-mp3/` |
| `tools/strudel-similarity.mjs` | `/tools/strudel-similarity.mjs` |

The mapping lives in `.github/workflows/pages.yml`. If a public path is renamed,
update the workflow and any hardcoded app paths together.

GitHub Pages should ideally use **Build and deployment > Source: GitHub
Actions**. If the repository is still set to a branch source, GitHub also runs
its automatic `pages build and deployment` job; the workflow waits briefly so
the generated artifact deploys last.
