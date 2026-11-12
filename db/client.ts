import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export function createDb(url: string) {
  // prepare: false is required for Supabase's transaction pooler (port 6543).
  // max: 1 because each serverless instance handles one request at a time.
  const client = postgres(url, { prepare: false, max: 1 });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;

let cached: Db | undefined;

/** Returns null when DATABASE_URL is unset, so the app still boots without a database. */
export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  cached ??= createDb(url);
  return cached;
}
