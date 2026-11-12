---
name: verify
description: Prove a feature or fix works in the running app, with evidence, before calling it done. Use after implementing any user-visible change, and whenever asked to verify, test or check that something works.
---

# Verify

Claims need evidence from the real app, not from reading code. Produce that evidence.

## Steps

1. **State the claim** in one sentence a user would recognise, e.g. "Submitting an empty
   note shows an error and saves nothing."
2. **Write or extend a Playwright spec** in `e2e/` that performs exactly that, through the UI
   the way a user would. Assert on visible outcomes (text, roles, URLs), not implementation
   details. Prefer `getByRole` / `getByLabel`; add a `data-testid` only when nothing
   accessible fits.
3. **Make sure the spec can fail.** Temporarily break the behaviour (or run the spec before
   the fix) and confirm it fails for the right reason. A test that can't fail proves nothing.
4. **Run locally:** `pnpm e2e`. For a bug fix, also add a unit test in `server/*.test.ts`
   if the bug lives in the API.
5. **Run against the deployment** once a preview exists:
   `BASE_URL=<preview-url> pnpm e2e` (set `VERCEL_AUTOMATION_BYPASS_SECRET` if the preview
   is protected). CI also does this automatically as _E2E (deployed)_.
6. **Report:** the claim, the spec file and test name, the commands run and their result. On
   failure, attach the trace path from `test-results/`.

## Notes

- The specs must pass against a database-less environment _and_ a real one. Gate
  database-dependent specs on `/api/health` reporting `database: ok`, or seed data in the
  test itself.
- If you find yourself verifying the same thing by hand twice, turn it into a spec.
