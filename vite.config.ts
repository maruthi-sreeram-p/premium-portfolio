import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Three.js + R3F already split themselves out via the lazy import in
    // HeroVisual. Splitting the remaining vendors keeps React on its own
    // long-lived cache entry and lets the animation libraries download in
    // parallel with it rather than behind it.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom') || /node_modules[\\/]react[\\/]/.test(id)) {
            return 'vendor-react'
          }
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
            return 'vendor-motion'
          }
          if (id.includes('gsap') || id.includes('lenis')) return 'vendor-scroll'
          return undefined
        },
      },
    },
    // The WebGL chunk is legitimately large and is never loaded on the tiers
    // that cannot afford it, so the default 500kB warning is just noise here.
    chunkSizeWarningLimit: 900,
  },
})
