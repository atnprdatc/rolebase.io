import react from '@vitejs/plugin-react'
import { terser } from 'rollup-plugin-terser'
import visualizer from 'rollup-plugin-visualizer'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Required to prevent error "pragma and pragmaFrag cannot be set when runtime is automatic"
      // with @magicbell/magicbell-react
      jsxRuntime: 'classic',
    }),
    tsconfigPaths(),
    terser({
      format: {
        comments: false,
      },
      compress: false,
    }),
    visualizer(),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      // Multiple entry points: https://stackoverflow.com/questions/70522494/multiple-entry-points-in-vite
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        demo1: fileURLToPath(
          new URL('./src/demos/demo1.html', import.meta.url)
        ),
      },
    },
  },
  server: {
    port: 3000,
  },
})
