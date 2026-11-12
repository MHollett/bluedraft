// Vercel Function entry point. vercel.json rewrites /api/* here; Hono routes on the
// original path. Every file in api/ becomes a function, so keep routes in server/.
import { app } from '../server/index.js';

const handler = (request: Request) => app.fetch(request);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
