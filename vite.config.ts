import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // In dev, the API runs separately (server/dev.ts). In production both share one origin.
    proxy: { '/api': 'http://localhost:8787' },
  },
});
