import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/bangaloresuk/',

  build: {
    // Minify JS with esbuild (default, fast) — set 'terser' for slightly
    // smaller output at the cost of a slower build
    minify: 'esbuild',

    // Inline assets smaller than 4 KB directly into JS (saves round-trips)
    assetsInlineLimit: 4096,

    // Minify CSS
    cssMinify: true,

    // Enable source maps for production debugging (remove if you prefer smaller output)
    sourcemap: false,

    // Warn when a chunk exceeds 400 KB
    chunkSizeWarningLimit: 400,

    rollupOptions: {
      output: {
        // ── Code splitting: vendor JS cached separately by the browser ──
        // React only re-downloads when its version changes, not on every deploy
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },

        // ── Content-hashed filenames → safe long-lived cache headers ──
        // Vite does this by default; these options make it explicit
        entryFileNames  : 'assets/[name].[hash].js',
        chunkFileNames  : 'assets/[name].[hash].js',
        assetFileNames  : 'assets/[name].[hash][extname]',
      },
    },
  },

  // ── Dev server ──────────────────────────────────────────────────────────
  server: {
    // Proxy API calls to your FastAPI backend during local development
    // so the browser never sees a CORS error
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
