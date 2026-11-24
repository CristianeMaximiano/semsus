import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Site com várias páginas: index.html (início) e plataforma.html (painel em React).
// As demais páginas ficam em public/ e são copiadas como estão.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        plataforma: 'plataforma.html',
      },
    },
  },
})
