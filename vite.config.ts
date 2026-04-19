import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // In production, the PWA lives at /safecycle on the VPS.
  // In development, it's served from root /.
  const base = env.VITE_BASE_PATH || '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    // NOTE: GEMINI_API_KEY is intentionally NOT exposed to the browser bundle.
    // All Gemini API calls are proxied through the Express server (server.ts).
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Ensure source maps are not included in production builds
      sourcemap: false,
      // Optimize chunk splitting for the mobile WebView
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            motion: ['motion'],
            lucide: ['lucide-react'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // Proxy /api/* to the Express backend during development
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
