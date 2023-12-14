import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 字符串简写写法：http://localhost:5173/foo -> http://localhost:4567/foo
      '/findDrawNotice': 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx',
    },
  },
})
