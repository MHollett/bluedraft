import { z } from 'zod';

// Shared between the API (validation) and the React app (forms, types).
// Keep this folder free of server-only or browser-only dependencies.

export const createNoteSchema = z.object({
  body: z.string().trim().min(1, 'Note cannot be empty').max(2000),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export interface Note {
  id: string;
  body: string;
  createdAt: string;
}
