import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

const appWithoutDb = createApp({ getDb: () => null });

describe('API without a database', () => {
  it('reports health with the database unconfigured', async () => {
    const res = await appWithoutDb.request('/api/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', database: 'not_configured' });
  });

  it('returns 503 for notes when the database is missing', async () => {
    const res = await appWithoutDb.request('/api/notes');
    expect(res.status).toBe(503);
  });

  it('rejects an empty note before touching the database', async () => {
    const res = await appWithoutDb.request('/api/notes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: '   ' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns JSON 404 for unknown API routes', async () => {
    const res = await appWithoutDb.request('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
