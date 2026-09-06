import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:8080';

  return {
    plugins: [
      react(),
      tailwindcss(), // Enables Tailwind v4 native bundling
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    esbuild: {
      target: 'es2022',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022',
      },
    },
    server: {
      port: 3000,
      strictPort: false,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/actuator': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            animations: ['motion/react', 'canvas-confetti'],
            icons: ['lucide-react'],
          },
        },
      },
    },
  };
});