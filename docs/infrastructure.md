# Infrastructure

How BlueDraft's hosting, database, DNS and repository are configured. These settings live in
dashboards, not code, so this file is the record. **Update it in the same PR as any change you
make in a dashboard.**

This file names settings and environment variables. It must never contain secret values
(connection strings, passwords, tokens, bypass secrets).

## Overview

```
browser ──► bluedraft.app (Cloudflare DNS, DNS only)
              │
              ▼
           Vercel project
             ├─ static files from dist/      (React app)
             └─ /api/*  ──► api/index.ts     (Hono, one Vercel Function)
                                │
                                ▼
                     Supabase Postgres (us-east-1)
                     via transaction pooler, port 6543
```

| Service    | Role                                         | Plan  |
| ---------- | -------------------------------------------- | ----- |
| GitHub     | Code, issues, Project board, CI              | Free  |
| Vercel     | Builds, hosting, preview deployments         | Hobby |
| Supabase   | Postgres database                            | Free  |
| Cloudflare | Domain registrar and DNS for `bluedraft.app` | —     |

## GitHub

**Repository:** `MHollett/bluedraft`. Default branch `main`.

**Planning:** GitHub Issues, shown on the user-level Project board **bluedraft MVP**. The issue
is the unit of work; the board is a view of issues. Project workflows:

- Item added to project → Status **Todo**
- Pull request linked to issue → **In Progress**
- Item closed → **Done**
- Auto-add: `repo:MHollett/bluedraft is:issue`

**Ruleset `main`** (Settings → Rules → Rulesets). Active, no bypass list, targets the default
branch:

- Restrict deletions
- Block force pushes
- Require a pull request before merging, **0 required approvals** (GitHub does not let you
  approve your own PR; the required checks are the gate)
- Require status checks to pass:
  - `Lint, typecheck, test, build`
  - `E2E (local servers)`
  - `E2E (deployed)`: add once it has run on a PR (it only appears in the picker after a run)
  - `Linked issue`: add once the workflow is on `main`
- "Require branches to be up to date": off

**Merging** (Settings → General → Pull Requests): squash merging only; head branches are
deleted automatically after merge.

**Actions secrets** (Settings → Secrets and variables → Actions):

| Name                              | Used by            | Source                                                            |
| --------------------------------- | ------------------ | ----------------------------------------------------------------- |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | `deployed-e2e.yml` | Vercel → Deployment Protection → Protection Bypass for Automation |

**Workflows** (`.github/workflows/`):

| File               | Trigger                     | Job name(s)                                                |
| ------------------ | --------------------------- | ---------------------------------------------------------- |
| `ci.yml`           | PRs, pushes to `main`       | `Lint, typecheck, test, build`, `E2E (local servers)`      |
| `deployed-e2e.yml` | Vercel deployment succeeded | `E2E (deployed)`, runs Playwright against the deployed URL |
| `linked-issue.yml` | PR opened or edited         | `Linked issue`, fails unless the body says `Closes #n`     |

**Claude GitHub App:** installed on the account with access to `bluedraft`, so Claude can
create issues, push branches and open PRs.

## Vercel

**Project:** imported from `MHollett/bluedraft`. Every push to a branch creates a preview
deployment; every merge to `main` deploys production.

**Build configuration** comes from `vercel.json`, not the dashboard: framework `vite`,
`pnpm install --frozen-lockfile`, `pnpm build`, output `dist/`, and two rewrites (`/api/*` → the
function, everything else → `index.html` for client-side routing). Node version comes from
`engines.node` in `package.json` (`26.x`).

**Environment variables** (Settings → Environment Variables):

| Name           | Production | Preview | Development | Value                                  |
| -------------- | :--------: | :-----: | :---------: | -------------------------------------- |
| `DATABASE_URL` |     ✓      |    ✓    |             | Supabase **transaction pooler** string |

- Paste values **without quotes**. Vercel stores quote characters literally (this broke the
  first deploy: `database "postgres"" does not exist`).
- Changes apply to **new** deployments only. Redeploy after editing.
- `DIRECT_URL` is not needed on Vercel; migrations run from a developer machine.

**Deployment protection:** preview deployments require Vercel login (the Hobby default).
**Protection Bypass for Automation** is enabled; its secret is stored in GitHub as
`VERCEL_AUTOMATION_BYPASS_SECRET` so `E2E (deployed)` can reach previews.

**Domains:** `bluedraft.app` is the production domain; `www.bluedraft.app` redirects to it.

**Logs:** Project → Logs. The health check logs the real database error there; the public
`/api/health` response only says `database: error`.

## Cloudflare

Registrar and DNS for `bluedraft.app`.

**DNS records** (DNS → Records) are the ones Vercel shows under Settings → Domains: an `A`
record for `@` and a `CNAME` for `www`.

- **Proxy status must be DNS only (grey cloud).** Proxying through Cloudflare puts a second
  CDN and certificate in front of Vercel's and causes redirect loops and certificate errors.
  Cloudflare's SSL/TLS settings do not apply while the proxy is off.
- TLS certificates are issued and renewed by Vercel.
- `.app` is on the HSTS preload list: browsers only ever load it over HTTPS.

Auto-renew and two-factor authentication are on for the Cloudflare account.

## Supabase

**Project region:** `us-east-1`, next to Vercel's default function region (Washington, D.C.).

**Connection strings** (Connect → Connection String). Use the poolers, never the direct
`db.<ref>.supabase.co` host, which is IPv6-only:

| Variable       | Pooler      | Port | Used by                         |
| -------------- | ----------- | ---- | ------------------------------- |
| `DATABASE_URL` | Transaction | 6543 | the app (local and Vercel)      |
| `DIRECT_URL`   | Session     | 5432 | `pnpm db:migrate` (drizzle-kit) |

Pooler usernames are `postgres.<project-ref>`, not `postgres`. The app connects with
`prepare: false`, which the transaction pooler requires (`db/client.ts`).

**Security:**

- **Data API is off.** All access goes through our Hono API; nothing in the browser talks to
  Supabase directly. Do not add `@supabase/supabase-js` or `VITE_SUPABASE_*` variables.
- **Row-level security is on for every table** (`.enableRLS()` in `db/schema.ts`). The API
  connects as `postgres`, which bypasses RLS; the public `anon` role gets nothing.
- The database password contains only letters and digits, so connection strings need no
  URL-encoding.

**Free-tier limits:** the project pauses after about a week with no activity (restore it from
the dashboard), and the account can have two active projects.

**Known gap:** preview deployments and production share one database. Fine while there are no
real users; separate them before launch.

## Runbooks

### Local environment

1. `copy .env.example .env`
2. Fill in `DATABASE_URL` (transaction pooler) and `DIRECT_URL` (session pooler). Quotes are
   fine in `.env`; they are not fine in Vercel.
3. `pnpm db:migrate`, then `pnpm dev`. The page should show `Database: ok`.

Only `.env` is read by the API and by migrations. Vite also reads `.env.local`, but only for
`VITE_*` variables, which end up in the browser bundle.

### Schema change

1. Edit `db/schema.ts` (new tables call `.enableRLS()`).
2. `pnpm db:generate --name <change>` and commit the generated SQL.
3. Before merging the PR: `pnpm db:migrate` against the shared database. Migrations must be
   backward compatible, because production code keeps running against the new schema until
   the merge deploys.

### Add or change an environment variable

1. Add it to `.env.example` (name and format, no real value) in the PR that needs it.
2. Set it in Vercel for the right environments, without quotes.
3. Redeploy, or let the PR's next push redeploy the preview.
4. Add a row to the Vercel table above.

### Rotate the database password

1. Supabase → Project Settings → Database → Reset database password (letters and digits).
2. Update `DATABASE_URL` and `DIRECT_URL` in your `.env`.
3. Update `DATABASE_URL` in Vercel for Production and Preview, then redeploy production.
4. Check `https://bluedraft.app/api/health` reports `"database":"ok"`.

### Debug `/api/health` returning `database: error`

Open Vercel → Logs → the `/api/health` request:

| Log message                           | Cause                                           |
| ------------------------------------- | ----------------------------------------------- |
| `Invalid URL`                         | quotes or a typo in the value                   |
| `database "postgres"" does not exist` | trailing quote in the value                     |
| `ENOTFOUND` / `ENETUNREACH`           | direct host instead of a pooler                 |
| `password authentication failed`      | wrong or old password                           |
| `Tenant or user not found`            | username `postgres` instead of `postgres.<ref>` |
