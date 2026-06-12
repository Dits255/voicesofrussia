import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // доступ к dev-серверу с других устройств в локальной сети (телефон и т.п.)
  server: { host: true },
})
