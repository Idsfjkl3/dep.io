import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import commonjs from '@rollup/plugin-commonjs';
import resolve2 from '@rollup/plugin-node-resolve';
// Vite doesn't need MiniCssExtractPlugin as it has built-in CSS extraction
// Babel is handled by Vite's default esbuild transformation

export default defineConfig({
  // Define entry point (Vite handles this differently)
  build: {
    rollupOptions: {
      input: {
        game: resolve(__dirname, 'client/src/index.html'),
      },
      output: {
        entryFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]',
      },
    },
    outDir: 'dist',
  },
  // CSS is handled automatically by Vite
  // JavaScript transpilation is handled by Vite's esbuild integration
  plugins: [
    // HTML plugin for template handling
    resolve2(),
    commonjs(),
    createHtmlPlugin({
      minify: true,
      pages: [
        {
          entry: '/client/src/index.js',
          filename: 'index.html',
          template: 'client/src/index.html',
        },
      ],
    }),
  ],
  // Configure paths
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});