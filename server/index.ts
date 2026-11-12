import { getDb } from '../db/client.js';
import { createApp } from './app.js';

export const app = createApp({ getDb });
