import path from 'path';
import { defineConfig } from 'vite';
import dtsPlugin from 'vite-plugin-dts';

module.exports = defineConfig({
  plugins: [
    dtsPlugin(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src', 'index.ts'),
      name: 'podbean',
      fileName: (format) => `podbean.${format}.js`
    }
  }
});
