import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['pipeline/**/*.test.ts', 'website/**/*.test.ts'], // Tests in pipeline and website folders
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './website'),
      '@data': path.resolve(__dirname, './data'),
    },
  },
});
