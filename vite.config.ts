import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isDev = mode === 'development';

  return {
    plugins: [react(), tailwindcss()],
    // 仅在开发模式下注入环境变量，避免生产构建中暴露敏感信息
    define: isDev
      ? {
          'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        }
      : {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // server 配置仅在开发模式下生效，不会影响生产构建
    ...(isDev
      ? {
          server: {
            // HMR 在 AI Studio 中通过 DISABLE_HMR 环境变量禁用。
            // 请勿修改——文件监听已禁用以防止代理编辑时的闪烁。
            hmr: process.env.DISABLE_HMR !== 'true',
          },
        }
      : {}),
  };
});
