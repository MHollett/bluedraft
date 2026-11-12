import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Every table enables row-level security. The API connects as the `postgres`
// role, which bypasses RLS; Supabase's public `anon` role gets nothing.
// Keep calling .enableRLS() on new tables.

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();
