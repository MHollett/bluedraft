import { expect, test } from '@playwright/test';

test('app loads and reaches the API', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'BlueDraft' })).toBeVisible();
  // Proves the frontend, the /api rewrite and the function all work together.
  await expect(page.getByTestId('health')).toContainText('API: ok');
});

test('client-side routes fall back to the app shell', async ({ page }) => {
  const res = await page.goto('/some/deep/link');
  expect(res?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'BlueDraft' })).toBeVisible();
});

test('API returns JSON 404 for unknown routes', async ({ request }) => {
  const res = await request.get('/api/does-not-exist');
  expect(res.status()).toBe(404);
  expect(await res.json()).toEqual({ error: 'Not found' });
});
