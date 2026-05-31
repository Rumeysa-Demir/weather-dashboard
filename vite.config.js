/**
 * @file vite.config.js
 * @description Vite build tool configuration for the SkyLine Weather application.
 *
 * Covers course topics:
 *  - Modern ES6+: import/export modules, arrow functions, destructuring
 *  - Project organization: path aliases, clean build output, source maps
 *  - Performance: code splitting, chunk optimization, asset inlining threshold
 *  - Code quality: environment variable validation at build time
 *
 * Vite docs: https://vitejs.dev/config/
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    // Load .env variables for the current mode (development / production)
    // so we can validate required keys at startup rather than at runtime.
    const env = loadEnv(mode, process.cwd(), '');

    // ── Environment variable guard ─────────────────────────────────────────────
    // Warn the developer immediately if the API key is missing,
    // instead of getting a cryptic 401 error after the app loads.
    if (!env.VITE_WEATHER_API_KEY) {
        console.warn(
            '\n⚠️  [vite.config.js] VITE_WEATHER_API_KEY is not set.\n' +
            '   Create a .env file at the project root and add:\n' +
            '   VITE_WEATHER_API_KEY=your_openweathermap_key\n'
        );
    }

    return {
        // ── Plugins ───────────────────────────────────────────────────────────────
        plugins: [
            react(), // Enables JSX transform, Fast Refresh in dev
        ],

        // ── Path aliases ──────────────────────────────────────────────────────────
        // Allows clean imports like:  import { useWeather } from '@hooks/useWeather'
        // instead of:                 import { useWeather } from '../../hooks/useWeather'
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@components': resolve(__dirname, 'src/components'),
                '@hooks': resolve(__dirname, 'src/hooks'),
                '@utils': resolve(__dirname, 'src/utils'),
                '@context': resolve(__dirname, 'src/context'),
                '@assets': resolve(__dirname, 'src/assets'),
            },
        },

        // ── Dev server ────────────────────────────────────────────────────────────
        server: {
            port: 5173,      // Explicit port — avoids surprises when 5173 is taken
            open: true,      // Auto-opens the browser on `npm run dev`
            watch: {
                // Ignore Visual Studio's hidden folder to prevent unnecessary HMR triggers
                ignored: ['**/.vs/**', '**/node_modules/**'],
            },
        },

        // ── Build output ──────────────────────────────────────────────────────────
        build: {
            outDir: 'dist',   // Output directory (excluded from Git via .gitignore)
            sourcemap: true,     // Generate source maps for easier debugging

            // ── Code splitting / chunk strategy ─────────────────────────────────────
            // Splitting vendor code into a separate chunk means users only re-download
            // app code when the app changes — not the entire React bundle.
            rollupOptions: {
                output: {
                    manualChunks: {
                        // React core in its own chunk
                        'vendor-react': ['react', 'react-dom'],
                    },
                },
            },

            // Assets smaller than 4 KB are inlined as base64 (reduces HTTP requests)
            assetsInlineLimit: 4096,

            // Warn when a chunk exceeds 500 KB (helps catch accidental bundle bloat)
            chunkSizeWarningLimit: 500,
        },

        // ── Preview server (used by `npm run preview`) ────────────────────────────
        preview: {
            port: 4173,
            open: true,
        },
    };
});