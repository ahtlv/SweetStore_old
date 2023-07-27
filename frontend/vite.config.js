import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  moduleContext: {
    './node_modules/pdfmake/build/vfs_fonts.js': 'window',
  },
})
