---
name: ship
description: Take finished local changes to a pull request with every check green and a working Vercel preview. Use when asked to ship, open a PR, push, or get a change deployed.
---

# Ship

Goal: a PR whose CI and deployed E2E checks pass, with the preview URL reported. Merging to
`main` deploys production, so only merge when the user asked for it.

## Steps

1. **Branch.** If on `main`, create `feat/<short-name>` or `fix/<short-name>`. Never push to
   `main` directly.
2. **Gate locally.** Run `pnpm check`, then `pnpm e2e`. If anything fails, find and fix the
   root cause, then rerun. Do not skip, disable or weaken a check to get green.
3. **Review your own diff.** `git diff main...HEAD`. Remove debug output, dead code, stray
   files and unrelated changes. Confirm a test covers the new behaviour.
4. **Commit.** Conventional message (`feat: …`, `fix: …`), body says _why_.
5. **Push and open the PR.**
   `git push -u origin HEAD`, then `gh pr create --fill` (edit the body: what changed, how it
   was verified, any follow-ups).
6. **Wait for checks.** `gh pr checks --watch`. Expected checks: _Lint, typecheck, test,
   build_, _E2E (local servers)_, Vercel, _E2E (deployed)_.
   - On failure: `gh run view --log-failed`, fix, push again. Repeat.
7. **Report** the PR URL, the preview URL, and which checks passed.
8. **Merge only if asked:** `gh pr merge --squash --delete-branch`. After merge, watch the
   production deployment's _E2E (deployed)_ run and report its result.

## Never

- Merge with a failing or pending check.
- Mark a check as flaky and move on without a reproduced cause.
- Commit `.env` or any secret.
