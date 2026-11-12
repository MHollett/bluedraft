# BlueDraft

React (Vite) frontend and Hono API in one repo. Deployed as one Vercel project: static
files from `dist/` plus a single function at `api/index.ts`. Postgres on Supabase, accessed
only through the API using Drizzle.

## Commands

| Command                       | What it does                                        |
| ----------------------------- | --------------------------------------------------- |
| `pnpm dev`                    | Vite on :5173 + API on :8787 (Vite proxies `/api`)  |
| `pnpm check`                  | lint, format check, typecheck, unit tests, build    |
| `pnpm e2e`                    | Playwright against local dev servers                |
| `BASE_URL=<url> pnpm e2e`     | Playwright against a deployed URL (preview or prod) |
| `pnpm db:generate --name <x>` | Create a migration from changes to `db/schema.ts`   |
| `pnpm db:migrate`             | Apply migrations (uses `DIRECT_URL`)                |

## Layout

- `src/` browser code. May import **types only** from `server/`, `db/`, `api/` (lint enforced).
- `server/app.ts` all API routes, chained on one Hono app so `AppType` reaches the client.
- `server/index.ts` wires real dependencies. `server/dev.ts` is the local Node server.
- `api/index.ts` Vercel entry. Do not add other files to `api/`: each one becomes a function.
- `db/schema.ts` Drizzle tables. `db/migrations/` is generated; never edit by hand.
- `shared/` Zod schemas and types used by both sides. No React, Drizzle or server imports.
- `e2e/` Playwright specs. They must pass locally **and** against a deployed URL.

## Paved roads (copy these, don't invent new patterns)

**New API endpoint:** define the input schema in `shared/`, add the route to the chain in
`server/app.ts` with `zValidator`, call it from the browser through `client` in
`src/client.ts`. Add a test in `server/app.test.ts` using `createApp({ getDb })`.

**New table:** add it to `db/schema.ts` with `.enableRLS()`, run
`pnpm db:generate --name <change>`, commit the generated SQL. Never write raw DDL elsewhere.

## Rules

- Relative imports in `server/`, `api/`, `db/`, `shared/` end in `.js`. Node's ESM loader
  needs this on Vercel; `tsconfig.server.json` enforces it.
- Validate every request body with Zod. Never trust `c.req.json()` directly.
- Return JSON errors with a status code; don't throw for expected cases (missing row, bad input).
- No secrets in code or in the browser bundle. Env vars live in Vercel and `.env` (gitignored).
- Don't add a dependency when the platform or an existing one does the job.
- If you hit a lint rule or type error, fix the cause. Don't add `eslint-disable`, `as any`,
  `@ts-expect-error` or `!` to get past it.

## Definition of done

A change is done when **all** of these hold, and you report the evidence:

1. `pnpm check` passes.
2. `pnpm e2e` passes, including a spec that exercises the new behaviour.
3. The PR's Vercel preview passes the **Deployed E2E** check.

"It compiles" or "it should work" is not evidence. Use the `verify` skill to produce it and
the `ship` skill to open the PR.
