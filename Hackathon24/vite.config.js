import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  server:{
    proxy:{
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve modules from the correct node_modules directory
      '@node_modules': path.resolve(__dirname, 'Hackathon24/Hackathon24/node_modules'),
    },
  },
})
