import { hc } from 'hono/client';
import type { AppType } from '../server/app.js';

// Typed client generated from the server's routes. If a route's input or output
// changes, TypeScript flags every call site here and in the components.
export const client = hc<AppType>('/').api;
