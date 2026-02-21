import path from "node:path"
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite' // Trigger restart...
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      sourcemaps: {
        assets: "./dist/assets/**",
        filesToDeleteAfterUpload: "./dist/**/*.map"
      }
    }),
  ],
  build: {
    target: 'esnext',
    sourcemap: true, // Enable sourcemaps for Sentry
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'sonner'],
          'vendor-utils': ['libphonenumber-js'],
          'charts': ['recharts'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
