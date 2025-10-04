import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Your GitHub Pages subpath:
export default defineConfig({
  plugins: [react()],
  base: '/bucketlisted-mocks/',   // <- hard-set to your repo name
})
