---
name: ship
description: Take finished local changes for a GitHub issue to a pull request with every check green and a working Vercel preview. Use when asked to ship, open a PR, push, or get a change deployed.
---

# Ship

Goal: a PR that closes its issue, with CI, the linked-issue check and the deployed E2E check
all passing, and the preview URL reported. Merging to `main` deploys production, so only merge
when the user asked for it.

## Steps

1. **Know the issue.** Identify the issue number `<n>` this work is for (`gh issue view <n>`).
   If there isn't one, stop and ask. Don't ship work that no issue describes.
2. **Branch.** Work must be on `<n>-<slug>` (e.g. `2-delete-note`). If you're on `main`,
   create it now: `git switch -c <n>-<slug>`. Never push to `main`.
3. **Gate locally.** Run `pnpm check`, then `pnpm e2e`. If anything fails, find and fix the
   root cause, then rerun. Do not skip, disable or weaken a check to get green.
4. **Check against the issue.** Go through each acceptance criterion and confirm there's a
   test or a verified observation for it. Review your own diff (`git diff main...HEAD`):
   remove debug output, dead code, stray files and changes the issue didn't ask for.
5. **Commit.** Conventional message (`feat: …`, `fix: …`, `docs: …`), body says _why_.
6. **Push and open the PR.**
   `git push -u origin HEAD`, then `gh pr create --title "<title>" --body-file <file>`. The
   body must contain `Closes #<n>`, plus: what changed, how each acceptance criterion was
   verified, and any follow-ups.
7. **Wait for checks.** `gh pr checks --watch`. Expected: _Lint, typecheck, test, build_,
   _E2E (local servers)_, _Linked issue_, Vercel, _E2E (deployed)_.
   - On failure: `gh run view --log-failed`, fix, push again. Repeat.
8. **Report** the PR URL, the preview URL, and which checks passed.
9. **Merge only if asked:** `gh pr merge --squash --delete-branch`. After merge, watch the
   production deployment's _E2E (deployed)_ run and report its result.

## Never

- Push to `main`, or merge with a failing or pending check.
- Open a PR without `Closes #<n>`.
- Mark a check as flaky and move on without a reproduced cause.
- Commit `.env` or any secret.
