// Local development only. On Vercel, api/index.ts is the entry point.
import { serve } from '@hono/node-server';
import { app } from './index.js';

const port = Number(process.env.API_PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.warn(`API listening on http://localhost:${String(info.port)}`);
});
