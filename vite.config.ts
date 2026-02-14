
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { compression } from 'vite-plugin-compression2';
import path from 'path';
import { constants as zlibConstants } from 'zlib';
import packageJson from './package.json';

export default defineConfig({
  base: './',
  clearScreen: false,
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /%APP_VERSION%/g,
          packageJson.version
        );
      },
    },
    
    // Dual Compression: Brotli (modern browsers) + Gzip (fallback)
    // NOTE: Only enabled for WEB builds. Electron uses ASAR compression (maximum).
    ...(process.env.WEB_BUILD === 'true' ? [
      compression({
        threshold: 1024, // Only compress files > 1KB
        deleteOriginalAssets: false, // Keep uncompressed files
        algorithms: [
          // Brotli - Best compression for modern browsers (97% support)
          ['brotliCompress', {
            params: {
              [zlibConstants.BROTLI_PARAM_QUALITY]: 11, // Max quality for static assets
              [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
            },
          }],
          // Gzip - Universal fallback
          ['gzip', { level: 9 }], // Max gzip compression
        ],
      })
    ] : []),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: 'esbuild',
    assetsInlineLimit: 10240,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    
    // NOTE: Manual chunks removed for Electron optimization
    // Electron loads from local ASAR - no HTTP caching benefit
    // Manual chunks add file I/O overhead with no gain
    // Lazy loading (per-app chunks) is kept for memory/startup benefits
  },
  esbuild: {
    legalComments: 'none', // Remove all comments for smaller output
    treeShaking: true, // Aggressive dead code elimination
  },
  server: {
    port: 3000,
    open: true,
  },
});