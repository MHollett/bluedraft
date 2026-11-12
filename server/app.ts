import { zValidator } from '@hono/zod-validator';
import { desc, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Db } from '../db/client.js';
import { notes } from '../db/schema.js';
import { createNoteSchema, type Note } from '../shared/notes.js';

export interface AppDeps {
  getDb: () => Db | null;
}

function toNote(row: typeof notes.$inferSelect): Note {
  return { id: row.id, body: row.body, createdAt: row.createdAt.toISOString() };
}

/**
 * Builds the API. Dependencies are injected so tests can run without a database.
 * Routes are chained so `AppType` carries every route's types to the React client.
 */
export function createApp(deps: AppDeps) {
  const app = new Hono()
    .basePath('/api')
    .get('/health', async (c) => {
      const db = deps.getDb();
      if (!db) return c.json({ status: 'ok', database: 'not_configured' } as const);
      try {
        await db.execute(sql`select 1`);
        return c.json({ status: 'ok', database: 'ok' } as const);
      } catch (err) {
        console.error('Health check: database unreachable', err);
        return c.json({ status: 'degraded', database: 'error' } as const, 503);
      }
    })
    .get('/notes', async (c) => {
      const db = deps.getDb();
      if (!db) return c.json({ error: 'Database not configured' }, 503);
      const rows = await db.select().from(notes).orderBy(desc(notes.createdAt)).limit(50);
      return c.json({ notes: rows.map(toNote) }, 200);
    })
    .post('/notes', zValidator('json', createNoteSchema), async (c) => {
      const db = deps.getDb();
      if (!db) return c.json({ error: 'Database not configured' }, 503);
      const input = c.req.valid('json');
      const [row] = await db.insert(notes).values({ body: input.body }).returning();
      if (!row) throw new Error('Insert returned no row');
      return c.json({ note: toNote(row) }, 201);
    });

  app.notFound((c) => c.json({ error: 'Not found' }, 404));
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  });

  return app;
}

export type AppType = ReturnType<typeof createApp>;
