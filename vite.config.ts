
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Define global variables for the browser environment
  define: {
    // Provide "process.env.NODE_ENV" and an empty process object for compatibility
    'process.env': {
      NODE_ENV: JSON.stringify(mode)
    },
    'process': {
      env: {
        NODE_ENV: JSON.stringify(mode)
      }
    }
  }
}));
