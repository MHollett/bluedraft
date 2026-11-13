# BlueDraft

React + Vite frontend, Hono API, Postgres (Supabase) via Drizzle, deployed on Vercel.
Built so AI agents can ship changes safely: lint rules, types and tests are the guardrails,
and every PR is checked against its real preview deployment.

See `CLAUDE.md` for architecture, conventions and the definition of done.

## Local setup (Windows)

1. Node 26 LTS (`winget install OpenJS.NodeJS.LTS`), then `npm install -g pnpm`.
2. `git pull`, then `pnpm install`.
3. `copy .env.example .env` and fill in the two Supabase connection strings.
4. `pnpm db:migrate` to create the tables.
5. `pnpm dev`, then open http://localhost:5173.
6. Once, for E2E tests: `pnpm exec playwright install chromium`.

The app runs without a database too; the status line will say `Database: not_configured`.

## How changes are made

Every change goes **issue → branch → pull request**: start from a GitHub issue with acceptance
criteria, work on a branch named `<issue-number>-<slug>` (e.g. `2-delete-note`), and open a PR
whose description says `Closes #<n>`. `main` only changes through PRs that pass every required
check. Details in `CLAUDE.md` → Workflow.

## Infrastructure

How GitHub, Vercel, Cloudflare (`bluedraft.app`) and Supabase are configured, plus runbooks for
migrations, environment variables and password rotation: [`docs/infrastructure.md`](docs/infrastructure.md).

## Optional: more agent skills

`ship` and `verify` live in `.claude/skills/`. For broader workflows, community packs are
available. Read their SKILL.md files before installing:

- pstack (Lauren Tan's workflow): `npx skills add backnotprop/pstack` (pick the skills you want)
- gstack (Garry Tan's workflow): clone `garrytan/gstack` and copy the skills you want into
  `.claude/skills/`

Add one at a time and keep only what earns its place.
