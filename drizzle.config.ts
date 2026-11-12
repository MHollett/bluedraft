import { defineConfig } from 'drizzle-kit';

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment (e.g. CI).
}

// Migrations use the session pooler (DIRECT_URL, port 5432). The app uses the
// transaction pooler (DATABASE_URL, port 6543).
export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '' },
  strict: true,
  verbose: true,
});
