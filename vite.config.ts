import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/pons-launches': {
          target: 'https://www.ponsfamily.com',
          changeOrigin: true,
        },
        '/api/pons-token': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api/eth-usd': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api/user-launches': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api/token-launches': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api/assets': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api/launch-ready': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api/launch-config': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      proxy: {
        '/api/pons-launches': {
          target: 'https://www.ponsfamily.com',
          changeOrigin: true,
        },
      },
    },
  };
});
