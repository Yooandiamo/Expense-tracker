import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量 (包括 Vercel 设置的 API_KEY)
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 将 process.env.API_KEY 注入到客户端代码中
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});