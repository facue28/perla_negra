import path from "node:path"
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite' // Trigger restart...
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'sonner'],
          'vendor-utils': ['libphonenumber-js'],
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
