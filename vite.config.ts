/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/hangeul-typing-game/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
