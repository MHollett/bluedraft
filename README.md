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

## One-time deployment setup

### Supabase

- Region near Vercel's default functions region (US East) unless you need Canadian residency.
- Disable the Data API. All access goes through our API.
- Connection strings (from **Connect**): transaction pooler, port 6543 → `DATABASE_URL`;
  session pooler, port 5432 → `DIRECT_URL`.

### Vercel

1. **Add New → Project**, import this repo. The settings come from `vercel.json`.
2. **Settings → Environment Variables:** add `DATABASE_URL` for Production and Preview.
3. **Settings → Deployment Protection → Protection Bypass for Automation:** create a secret,
   then add it to GitHub as repo secret `VERCEL_AUTOMATION_BYPASS_SECRET`
   (**Settings → Secrets and variables → Actions**). This lets the deployed E2E tests reach
   protected previews.
4. Check `https://<project>.vercel.app/api/health` returns `{"status":"ok","database":"ok"}`.

### Domain (Cloudflare DNS)

1. Vercel **Settings → Domains**, add `yourdomain` and `www.yourdomain`.
2. Copy the records Vercel shows into Cloudflare DNS with the proxy set to **DNS only**
   (grey cloud). Proxying through Cloudflare in front of Vercel breaks certificates and caching.

### GitHub branch protection

**Settings → Rules → Rulesets → New branch ruleset** for `main`:

- Require a pull request before merging.
- Require status checks: **Lint, typecheck, test, build**, **E2E (local servers)**,
  **E2E (deployed)**.
- Block force pushes.

This makes "CI is green" a hard requirement for agents and for you.

## Migrations

Edit `db/schema.ts`, run `pnpm db:generate --name <change>`, commit the SQL, then
`pnpm db:migrate`. Apply migrations to production **before** merging code that depends on them.

## Optional: more agent skills

`ship` and `verify` live in `.claude/skills/`. For broader workflows, community packs are
available. Read their SKILL.md files before installing:

- pstack (Lauren Tan's workflow): `npx skills add backnotprop/pstack` (pick the skills you want)
- gstack (Garry Tan's workflow): clone `garrytan/gstack` and copy the skills you want into
  `.claude/skills/`

Add one at a time and keep only what earns its place.
