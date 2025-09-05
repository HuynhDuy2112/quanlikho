import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // bind toàn bộ network interface
    port: 5173,       // bạn có thể đổi port nếu muốn
  },
})
