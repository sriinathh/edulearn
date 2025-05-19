import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  logLevel: 'error'  // <-- Add this line to hide warnings and show only errors
});
