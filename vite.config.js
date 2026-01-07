import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' }, // <--- Crucial for Kokoro
  optimizeDeps: { exclude: ['kokoro-js', 'onnxruntime-web'] }
})