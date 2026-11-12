import { useCallback, useEffect, useState, type SubmitEvent } from 'react';
import type { Note } from '../shared/notes';
import { createNoteSchema } from '../shared/notes';
import { client } from './client';

type Health = { status: string; database: string } | null;

export function App() {
  const [health, setHealth] = useState<Health>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    const res = await client.notes.$get();
    if (res.ok) setNotes((await res.json()).notes);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await client.health.$get();
        const body = await res.json();
        setHealth(body);
        if (body.database === 'ok') await loadNotes();
      } catch {
        setHealth({ status: 'unreachable', database: 'unknown' });
      }
    })();
  }, [loadNotes]);

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = createNoteSchema.safeParse({ body: draft });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid note');
      return;
    }
    setError(null);
    const res = await client.notes.$post({ json: parsed.data });
    if (res.status === 201) {
      setDraft('');
      await loadNotes();
    } else {
      setError('Could not save the note');
    }
  }

  return (
    <main>
      <h1>BlueDraft</h1>
      <p data-testid="health">
        API: {health ? health.status : 'checking…'} · Database: {health ? health.database : '…'}
      </p>

      {health?.database === 'ok' && (
        <section>
          <form onSubmit={(e) => void onSubmit(e)}>
            <input
              aria-label="New note"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
              }}
              placeholder="Write a note"
            />
            <button type="submit">Add</button>
          </form>
          {error && <p role="alert">{error}</p>}
          <ul>
            {notes.map((n) => (
              <li key={n.id}>{n.body}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
