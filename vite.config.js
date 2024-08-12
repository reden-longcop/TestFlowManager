import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/TestCaseManager/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    }
  }
})
